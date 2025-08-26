// OAuth callback endpoint - handles OAuth response (following README example)
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createOAuthClient } from '$lib/server/oauth';
import { Agent } from '@atproto/api';

export const GET: RequestHandler = async ({ url, cookies }) => {
	console.log('OAuth callback received');
	console.log('Callback URL:', url.toString());

	try {
		// Create the OAuth client
		const client = await createOAuthClient();

		// Parse the callback parameters (following README example)
		const params = new URLSearchParams(url.search);
		
		// Handle the OAuth callback - this exchanges code for tokens
		const { session, state } = await client.callback(params);

		console.log('OAuth successful!');
		console.log('User DID:', session.sub);
		console.log('State received:', state);

		// Test the session by creating an agent (following README example)
		const agent = new Agent(session);
		const profile = await agent.getProfile({ actor: session.sub });
		console.log('User profile:', profile.data.displayName);

		// Store the user's DID in a cookie for session lookup
		// The actual session is already stored in the OAuth client's sessionStore
		cookies.set('bsky_session', session.sub, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false, // Set to true in production with HTTPS
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		console.log('Session established, redirecting to dashboard...');

		// Redirect to dashboard
		throw redirect(302, '/dashboard');
	} catch (error) {
		if (error instanceof Response) {
			throw error; // Re-throw redirects
		}
		
		console.error('OAuth callback error:', error);
		
		// Redirect to home with error indication
		throw redirect(302, '/?error=oauth_failed');
	}
};