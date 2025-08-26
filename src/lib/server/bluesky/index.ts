/**
 * @fileoverview Bluesky Service - Main Export Module
 * 
 * This module provides the main BlueskyService class that combines OAuth
 * authentication and API functionality into a single, easy-to-use service.
 * It serves as the primary interface for all Bluesky interactions in the
 * application.
 * 
 * @example
 * ```typescript
 * import { BlueskyService } from '$lib/server/bluesky';
 * 
 * // Initialize the service
 * const bluesky = new BlueskyService({
 *   publicUrl: 'http://localhost:5173',
 *   developmentMode: true
 * });
 * 
 * // Handle OAuth flow
 * const authUrl = await bluesky.initiateLogin('user.bsky.social');
 * const result = await bluesky.handleCallback(callbackUrl, cookies);
 * 
 * // Make API calls
 * const timeline = await bluesky.getTimelineEnriched(userDid, 10);
 * const profile = await bluesky.getProfile(userDid, userDid);
 * ```
 */

import type { Cookies } from '@sveltejs/kit';
import { BlueskyOAuthService } from './oauth.js';
import { BlueskyAPIService } from './api.js';
import type {
  BlueskyServiceOptions,
  DID,
  OAuthCallbackResult,
  BlueskyProfile,
  EnrichedFeedResponse,
  EnrichedFollowResponse,
  ThreadResponse,
  APIResponse,
  DemoType,
  AuthenticatedAgent,
  BlueskyError,
  OAuthError
} from './types.js';

/**
 * Main Bluesky Service Class
 * 
 * Combines OAuth authentication and API functionality into a single
 * service class for easy integration with SvelteKit routes and components.
 */
export class BlueskyService {
  private readonly oauthService: BlueskyOAuthService;
  private readonly apiService: BlueskyAPIService;

  /**
   * Create a new BlueskyService instance
   * 
   * @param options - Configuration options for the service
   */
  constructor(options: BlueskyServiceOptions = {}) {
    this.oauthService = new BlueskyOAuthService(options);
    this.apiService = new BlueskyAPIService(options.apiTimeout);
  }

  // ============================================================================
  // OAuth Methods
  // ============================================================================

  /**
   * Initiate OAuth login flow
   * 
   * @param handle - Optional Bluesky handle to pre-fill
   * @param redirectUri - Optional custom redirect URI
   * @returns Promise resolving to authorization URL
   */
  async initiateLogin(handle?: string, redirectUri?: string): Promise<string> {
    return await this.oauthService.initiateLogin(handle, redirectUri);
  }

  /**
   * Handle OAuth callback and set session cookie
   * 
   * @param callbackUrl - The callback URL with authorization code
   * @param cookies - SvelteKit cookies object for setting session
   * @returns Promise resolving to callback result
   */
  async handleOAuthCallback(callbackUrl: string | URL, cookies: Cookies): Promise<OAuthCallbackResult> {
    const result = await this.oauthService.handleCallback(callbackUrl);
    
    if (result.success && result.userDid) {
      // Set HTTP-only session cookie
      cookies.set('bsky_session', result.userDid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      });
    }
    
    return result;
  }

  /**
   * Logout user and clear session
   * 
   * @param userDid - User DID to logout
   * @param cookies - SvelteKit cookies object for clearing session
   */
  async logout(userDid: DID, cookies: Cookies): Promise<void> {
    await this.oauthService.logout(userDid);
    cookies.delete('bsky_session', { path: '/' });
  }

  /**
   * Get authenticated agent for a user
   * 
   * @param userDid - User's DID
   * @returns Promise resolving to authenticated agent
   */
  async getAuthenticatedAgent(userDid: DID): Promise<AuthenticatedAgent> {
    return await this.oauthService.getAuthenticatedAgent(userDid);
  }

  /**
   * Check if user has valid session
   * 
   * @param userDid - User's DID to check
   * @returns Promise resolving to true if session is valid
   */
  async hasValidSession(userDid: DID): Promise<boolean> {
    return await this.oauthService.hasValidSession(userDid);
  }

  // ============================================================================
  // API Methods
  // ============================================================================

  /**
   * Get user profile
   * 
   * @param userDid - Authenticated user's DID
   * @param actor - Actor to get profile for
   * @returns Promise resolving to profile data
   */
  async getProfile(userDid: DID, actor: DID | string): Promise<APIResponse<BlueskyProfile>> {
    const agent = await this.getAuthenticatedAgent(userDid);
    return await this.apiService.getProfile(agent, actor);
  }

  /**
   * Get enriched timeline
   * 
   * @param userDid - Authenticated user's DID
   * @param limit - Number of posts to fetch
   * @param cursor - Pagination cursor
   * @returns Promise resolving to enriched timeline
   */
  async getTimelineEnriched(
    userDid: DID,
    limit: number = 10,
    cursor?: string
  ): Promise<APIResponse<EnrichedFeedResponse>> {
    const agent = await this.getAuthenticatedAgent(userDid);
    return await this.apiService.getTimelineEnriched(agent, limit, cursor);
  }

  /**
   * Get enriched author feed
   * 
   * @param userDid - Authenticated user's DID
   * @param actor - Actor whose feed to get
   * @param limit - Number of posts to fetch
   * @param cursor - Pagination cursor
   * @returns Promise resolving to enriched author feed
   */
  async getAuthorFeedEnriched(
    userDid: DID,
    actor: DID | string,
    limit: number = 10,
    cursor?: string
  ): Promise<APIResponse<EnrichedFeedResponse>> {
    const agent = await this.getAuthenticatedAgent(userDid);
    return await this.apiService.getAuthorFeedEnriched(agent, actor, limit, cursor);
  }

  /**
   * Get post thread
   * 
   * @param userDid - Authenticated user's DID
   * @param uri - Post URI to get thread for
   * @param depth - Maximum thread depth
   * @returns Promise resolving to thread data
   */
  async getPostThread(
    userDid: DID,
    uri: string,
    depth: number = 6
  ): Promise<APIResponse<ThreadResponse>> {
    const agent = await this.getAuthenticatedAgent(userDid);
    return await this.apiService.getPostThread(agent, uri, depth);
  }

  /**
   * Get user likes
   * 
   * @param userDid - Authenticated user's DID
   * @param actor - Actor whose likes to get
   * @param limit - Number of likes to fetch
   * @param cursor - Pagination cursor
   * @returns Promise resolving to liked posts
   */
  async getLikes(
    userDid: DID,
    actor: DID | string,
    limit: number = 10,
    cursor?: string
  ): Promise<APIResponse<EnrichedFeedResponse>> {
    const agent = await this.getAuthenticatedAgent(userDid);
    return await this.apiService.getLikes(agent, actor, limit, cursor);
  }

  /**
   * Get follows with totals
   * 
   * @param userDid - Authenticated user's DID
   * @param actor - Actor whose follows to get
   * @param limit - Number of follows to fetch
   * @param cursor - Pagination cursor
   * @returns Promise resolving to follows with totals
   */
  async getFollowsWithTotals(
    userDid: DID,
    actor: DID | string,
    limit: number = 20,
    cursor?: string
  ): Promise<APIResponse<EnrichedFollowResponse>> {
    const agent = await this.getAuthenticatedAgent(userDid);
    return await this.apiService.getFollowsWithTotals(agent, actor, limit, cursor);
  }

  /**
   * Get followers with totals
   * 
   * @param userDid - Authenticated user's DID
   * @param actor - Actor whose followers to get
   * @param limit - Number of followers to fetch
   * @param cursor - Pagination cursor
   * @returns Promise resolving to followers with totals
   */
  async getFollowersWithTotals(
    userDid: DID,
    actor: DID | string,
    limit: number = 20,
    cursor?: string
  ): Promise<APIResponse<EnrichedFollowResponse>> {
    const agent = await this.getAuthenticatedAgent(userDid);
    return await this.apiService.getFollowersWithTotals(agent, actor, limit, cursor);
  }

  /**
   * Execute demo API call
   * 
   * Unified method for dashboard demo functionality.
   * 
   * @param userDid - Authenticated user's DID
   * @param demo - Demo type to execute
   * @param actor - Actor for user-specific calls
   * @param limit - Number of items to fetch
   * @returns Promise resolving to demo API response
   */
  async executeDemoAPI(
    userDid: DID,
    demo: DemoType,
    actor: DID | string,
    limit: number = 10
  ): Promise<APIResponse<any>> {
    const agent = await this.getAuthenticatedAgent(userDid);
    return await this.apiService.executeDemoAPI(agent, demo, actor, limit);
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get service configuration for debugging
   * 
   * @returns Service configuration with sensitive data redacted
   */
  getConfig(): Partial<BlueskyServiceOptions> {
    return this.oauthService.getConfig();
  }

  /**
   * Get session statistics
   * 
   * @returns Current session statistics
   */
  getStats(): { oauth: ReturnType<BlueskyOAuthService['getSessionStats']> } {
    return {
      oauth: this.oauthService.getSessionStats()
    };
  }

  /**
   * Clean up expired sessions and data
   * 
   * @returns Promise resolving to number of items cleaned
   */
  async cleanup(): Promise<number> {
    return await this.oauthService.cleanup();
  }
}

// ============================================================================
// Singleton Service Instance
// ============================================================================

let blueskyServiceInstance: BlueskyService | null = null;

/**
 * Get the singleton Bluesky service instance
 * 
 * Creates a single shared instance with default configuration for the entire application.
 * 
 * @returns Singleton Bluesky service instance
 */
export function getBlueskyService(): BlueskyService {
  if (!blueskyServiceInstance) {
    blueskyServiceInstance = new BlueskyService();
  }
  return blueskyServiceInstance;
}

/**
 * Reset the service instance (useful for testing)
 * @internal
 */
export function resetBlueskyService(): void {
  blueskyServiceInstance = null;
}

// ============================================================================
// Re-exports for Convenience
// ============================================================================

// Export all types for easy importing
export type * from './types.js';

// Export individual service classes for advanced usage
export { BlueskyOAuthService } from './oauth.js';
export { BlueskyAPIService } from './api.js';

// Export error classes
export { BlueskyError, OAuthError } from './types.js';

// ============================================================================
// Legacy Compatibility (for existing routes)
// ============================================================================

/**
 * Create OAuth client (legacy compatibility)
 * @deprecated Use getBlueskyService() instead
 */
export async function createOAuthClient(): Promise<any> {
  console.warn('createOAuthClient is deprecated. Use getBlueskyService() instead.');
  const service = getBlueskyService();
  return (service as any).oauthService.getOAuthClientForTesting();
}

/**
 * Get user agent (legacy compatibility)
 * @deprecated Use getBlueskyService().getAuthenticatedAgent instead
 */
export async function getUserAgent(userDid: DID): Promise<AuthenticatedAgent> {
  console.warn('getUserAgent is deprecated. Use getBlueskyService().getAuthenticatedAgent instead.');
  const service = getBlueskyService();
  return await service.getAuthenticatedAgent(userDid);
}