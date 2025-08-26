// OAuth client for Bluesky using @atproto/oauth-client-node
// Starting with basic public client configuration to avoid JWT key generation issues
// This demonstrates the OAuth flow - JWT signing can be added later for production
import { NodeOAuthClient } from '@atproto/oauth-client-node';
import { Agent } from '@atproto/api';

// Get environment variables with fallbacks for development
// For localhost development, use special client_id format with embedded redirect_uri and scope
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://127.0.0.1:5174';
const REDIRECT_URI = `${PUBLIC_URL}/`;
const SCOPE = 'atproto transition:generic';
const CLIENT_ID = process.env.CLIENT_ID || `http://localhost?redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}`;

// Simple in-memory stores for development
// In production, these should be persistent (Redis, database, etc.)
const stateStore = new Map();
const sessionStore = new Map();

// Single OAuth client instance
let oauthClient = null;

// Force client recreation for development
if (process.env.NODE_ENV === 'development') {
	oauthClient = null;
}

// Create OAuth client with basic public client configuration
// This avoids the JWT key generation issues we encountered
// For production, you'd want to implement private_key_jwt authentication
export const createOAuthClient = async () => {
	// Force recreation in development to pick up config changes
	if (oauthClient && process.env.NODE_ENV !== 'development') {
		return oauthClient;
	}

	console.log('Creating OAuth client with localhost development pattern...');
	console.log('Client ID:', CLIENT_ID);

	// Create client using special localhost development format from Statusphere example
	// This embeds the redirect_uri and scope in the client_id for localhost development
	oauthClient = new NodeOAuthClient({
		// Using localhost development pattern with embedded parameters
		clientMetadata: {
			client_id: CLIENT_ID, // Special localhost format with embedded redirect_uri and scope
			client_name: 'SvelteKit Bsky Guide',
			client_uri: PUBLIC_URL,
			redirect_uris: [REDIRECT_URI],
			grant_types: ['authorization_code', 'refresh_token'],
			scope: SCOPE,
			response_types: ['code'],
			application_type: 'native',
			token_endpoint_auth_method: 'none',
			dpop_bound_access_tokens: true,
		},

		// No keyset needed for 'none' authentication method
		
		// State store for OAuth flow security (CSRF protection)
		stateStore: {
			async set(key, internalState) {
				console.log(`Setting state for key: ${key}`);
				stateStore.set(key, internalState);
			},
			async get(key) {
				const state = stateStore.get(key);
				console.log(`Getting state for key: ${key}`, state ? 'found' : 'not found');
				return state;
			},
			async del(key) {
				console.log(`Deleting state for key: ${key}`);
				stateStore.delete(key);
			}
		},

		// Session store for authenticated users
		sessionStore: {
			async set(sub, session) {
				console.log(`Storing session for user: ${sub}`);
				sessionStore.set(sub, session);
			},
			async get(sub) {
				const session = sessionStore.get(sub);
				console.log(`Getting session for user: ${sub}`, session ? 'found' : 'not found');
				return session;
			},
			async del(sub) {
				console.log(`Deleting session for user: ${sub}`);
				sessionStore.delete(sub);
			}
		}
	});

	console.log('OAuth client created successfully!');
	return oauthClient;
};

// Helper function to get an authenticated agent for a user
export const getUserAgent = async (userDid: string) => {
	const client = await createOAuthClient();
	const session = await client.restore(userDid);
	
	if (!session) {
		throw new Error('No valid session found for user');
	}
	
	return new Agent(session);
};