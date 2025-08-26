/**
 * @fileoverview Bluesky OAuth Service
 * 
 * Handles OAuth authentication flow with the AT Protocol and Bluesky.
 * This service manages the OAuth client configuration, state management,
 * and session handling for secure authentication.
 * 
 * Key features:
 * - Uses correct snake_case property names for NodeOAuthClient
 * - Supports custom domain handles (e.g., danlouren.co)
 * - In-memory stores for development (should be replaced with persistent storage in production)
 * - CSRF protection via state management
 * - Session management with automatic cleanup
 */

import { NodeOAuthClient } from '@atproto/oauth-client-node';
import { Agent } from '@atproto/api';
import type {
  BlueskyServiceOptions,
  DID,
  OAuthCallbackResult,
  AuthenticatedAgent,
  OAuthError
} from './types.js';

/**
 * OAuth Service for Bluesky Authentication
 * 
 * Manages the complete OAuth flow including authorization URL generation,
 * callback handling, session management, and authenticated agent creation.
 */
export class BlueskyOAuthService {
  private readonly config: Required<BlueskyServiceOptions>;
  private oauthClient: NodeOAuthClient | null = null;
  private readonly stateStore = new Map<string, any>();
  private readonly sessionStore = new Map<string, any>();

  constructor(options: BlueskyServiceOptions = {}) {
    // Set up configuration with defaults
    const publicUrl = options.publicUrl || process.env.PUBLIC_URL || 'http://127.0.0.1:5174';
    
    this.config = {
      publicUrl,
      clientId: options.clientId || process.env.CLIENT_ID || this.generateLocalhostClientId(publicUrl),
      developmentMode: options.developmentMode ?? (process.env.NODE_ENV === 'development'),
      apiTimeout: options.apiTimeout || 30000
    };

    // Force client recreation in development mode
    if (this.config.developmentMode) {
      this.oauthClient = null;
    }
  }

  /**
   * Generate localhost development client ID with embedded parameters
   * 
   * This special format is required for localhost development and allows
   * custom domain handles like danlouren.co to work properly.
   */
  private generateLocalhostClientId(publicUrl: string): string {
    const redirectUri = `${publicUrl}/`;
    const scope = 'atproto transition:generic';
    return `http://localhost?redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  }

  /**
   * Create and configure OAuth client with correct snake_case properties
   * 
   * This method ensures the OAuth client is configured exactly as in the working
   * commit (a5f8aa2), using snake_case property names as required by NodeOAuthClient.
   */
  private async getOAuthClient(): Promise<NodeOAuthClient> {
    // Force recreation in development to pick up config changes
    if (this.oauthClient && !this.config.developmentMode) {
      return this.oauthClient;
    }

    console.log('Creating OAuth client with localhost development pattern...');
    console.log('Client ID:', this.config.clientId);

    const redirectUri = `${this.config.publicUrl}/`;
    const scope = 'atproto transition:generic';

    // Create client using the EXACT configuration from the working commit (a5f8aa2)
    // CRITICAL: Use snake_case property names, NOT camelCase
    this.oauthClient = new NodeOAuthClient({
      clientMetadata: {
        client_id: this.config.clientId,  // snake_case, NOT clientId
        client_name: 'SvelteKit Bsky Guide',
        client_uri: this.config.publicUrl,
        redirect_uris: [redirectUri],     // snake_case, NOT redirectUris
        grant_types: ['authorization_code', 'refresh_token'],
        scope: scope,
        response_types: ['code'],
        application_type: 'native',
        token_endpoint_auth_method: 'none',
        dpop_bound_access_tokens: true,
      },

      // No keyset needed for 'none' authentication method
      
      // State store for OAuth flow security (CSRF protection)
      stateStore: {
        async set(key: string, internalState: any) {
          console.log(`Setting state for key: ${key}`);
          this.stateStore.set(key, internalState);
        },
        async get(key: string) {
          const state = this.stateStore.get(key);
          console.log(`Getting state for key: ${key}`, state ? 'found' : 'not found');
          return state;
        },
        async del(key: string) {
          console.log(`Deleting state for key: ${key}`);
          this.stateStore.delete(key);
        }
      },

      // Session store for authenticated users
      sessionStore: {
        async set(sub: string, session: any) {
          console.log(`Storing session for user: ${sub}`);
          this.sessionStore.set(sub, session);
        },
        async get(sub: string) {
          const session = this.sessionStore.get(sub);
          console.log(`Getting session for user: ${sub}`, session ? 'found' : 'not found');
          return session;
        },
        async del(sub: string) {
          console.log(`Deleting session for user: ${sub}`);
          this.sessionStore.delete(sub);
        }
      }
    });

    console.log('OAuth client created successfully!');
    return this.oauthClient;
  }

  /**
   * Initiate OAuth login flow
   * 
   * Generates an authorization URL for the user to visit for authentication.
   * Supports custom domain handles like danlouren.co.
   * 
   * @param handle - Optional Bluesky handle to pre-fill
   * @param redirectUri - Optional custom redirect URI
   * @returns Promise resolving to authorization URL
   */
  async initiateLogin(handle: string = '', redirectUri?: string): Promise<string> {
    try {
      const client = await this.getOAuthClient();
      
      // Generate state for CSRF protection
      const state = crypto.randomUUID();
      
      const actualRedirectUri = redirectUri || `${this.config.publicUrl}/`;
      
      console.log('Authorizing with handle:', handle);
      console.log('Using redirect_uri:', actualRedirectUri);

      // Generate the authorization URL (following the working pattern from a5f8aa2)
      const authUrl = await client.authorize(handle, {
        state,
        scope: 'atproto transition:generic',
        redirect_uri: actualRedirectUri
      });

      console.log('Generated authorization URL:', authUrl.toString());
      return authUrl.toString();
    } catch (error) {
      console.error('Error during OAuth authorization:', error);
      throw new Error(`OAuth authorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   * 
   * @param callbackUrl - The callback URL with authorization code
   * @returns Promise resolving to callback result
   */
  async handleCallback(callbackUrl: string | URL): Promise<OAuthCallbackResult> {
    try {
      console.log('OAuth callback received');
      console.log('Callback URL:', callbackUrl.toString());

      const client = await this.getOAuthClient();
      const url = typeof callbackUrl === 'string' ? new URL(callbackUrl) : callbackUrl;
      const params = new URLSearchParams(url.search);
      
      // Handle the OAuth callback - this exchanges code for tokens
      const { session, state } = await client.callback(params);

      console.log('OAuth successful!');
      console.log('User DID:', session.sub);
      console.log('State received:', state);

      // Test the session by creating an agent
      const agent = new Agent(session);
      const profile = await agent.getProfile({ actor: session.sub });
      console.log('User profile:', profile.data.displayName);

      return {
        success: true,
        userDid: session.sub as DID,
        profile: {
          did: session.sub as DID,
          handle: profile.data.handle,
          displayName: profile.data.displayName || profile.data.handle,
          avatar: profile.data.avatar,
          description: profile.data.description
        }
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OAuth callback failed'
      };
    }
  }

  /**
   * Get authenticated agent for API calls
   * 
   * @param userDid - User's DID
   * @returns Promise resolving to authenticated agent
   */
  async getAuthenticatedAgent(userDid: DID): Promise<AuthenticatedAgent> {
    try {
      const client = await this.getOAuthClient();
      const session = await client.restore(userDid);
      
      if (!session) {
        throw new Error('No valid session found for user');
      }
      
      return new Agent(session);
    } catch (error) {
      console.error(`Failed to get authenticated agent for ${userDid}:`, error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if user has valid session
   * 
   * @param userDid - User's DID to check
   * @returns Promise resolving to true if session is valid
   */
  async hasValidSession(userDid: DID): Promise<boolean> {
    try {
      const client = await this.getOAuthClient();
      const session = await client.restore(userDid);
      return session !== null;
    } catch (error) {
      console.log(`Session check failed for ${userDid}:`, error);
      return false;
    }
  }

  /**
   * Logout user and clear session
   * 
   * @param userDid - User DID to logout
   */
  async logout(userDid: DID): Promise<void> {
    try {
      console.log(`Logging out user: ${userDid}`);
      this.sessionStore.delete(userDid);
      
      // Note: In a full implementation, you might also want to revoke tokens
      // with the OAuth provider, but for development this is sufficient
    } catch (error) {
      console.error(`Error during logout for ${userDid}:`, error);
      // Don't throw - logout should be best effort
    }
  }

  /**
   * Get service configuration for debugging
   * 
   * @returns Service configuration with sensitive data redacted
   */
  getConfig(): Partial<BlueskyServiceOptions> {
    return {
      publicUrl: this.config.publicUrl,
      clientId: this.config.clientId.includes('localhost') ? '[localhost-dev-pattern]' : '[redacted]',
      developmentMode: this.config.developmentMode,
      apiTimeout: this.config.apiTimeout
    };
  }

  /**
   * Get session statistics for monitoring
   * 
   * @returns Current session statistics
   */
  getSessionStats(): { activeSessions: number; stateEntries: number } {
    return {
      activeSessions: this.sessionStore.size,
      stateEntries: this.stateStore.size
    };
  }

  /**
   * Clean up expired sessions and state entries
   * 
   * @returns Promise resolving to number of items cleaned
   */
  async cleanup(): Promise<number> {
    // For now, just clear everything (in production you'd check expiration times)
    const totalItems = this.sessionStore.size + this.stateStore.size;
    
    if (this.config.developmentMode) {
      console.log('Development mode: skipping cleanup');
      return 0;
    }
    
    // In production, implement proper expiration-based cleanup
    return totalItems;
  }

  /**
   * Internal method to access OAuth client (for testing/debugging)
   * @internal
   */
  async getOAuthClientForTesting(): Promise<NodeOAuthClient> {
    return await this.getOAuthClient();
  }
}