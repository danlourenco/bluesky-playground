// Page server load function that handles OAuth callback at root
// Per atproto OAuth spec, localhost redirect URIs must be http://127.0.0.1/
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createOAuthClient } from '$lib/server/oauth';
import { Agent } from '@atproto/api';

export const load: PageServerLoad = async ({ url, cookies }) => {
	// Check if this is a REAL OAuth callback (must have both 'code' AND 'state' parameters)
	// Don't confuse our own 'error=oauth_failed' parameter with OAuth errors
	const isRealOAuthCallback = url.searchParams.has('code') && url.searchParams.has('state');
	
	if (!isRealOAuthCallback) {
		// Not an OAuth callback, return normal page data
		return {
			isOAuthCallback: false,
			hasError: url.searchParams.get('error') === 'oauth_failed'
		};
	}

	console.log('OAuth callback received at root');
	console.log('Callback URL:', url.toString());

	try {
		// Create the OAuth client
		const client = await createOAuthClient();

		// Parse the callback parameters
		const params = new URLSearchParams(url.search);
		
		// Handle the OAuth callback - this exchanges code for tokens
		const { session, state } = await client.callback(params);

		console.log('OAuth successful!');
		console.log('User DID:', session.sub);
		console.log('State received:', state);

		// Test the session by creating an agent
		// Note: getProfile requires specific scopes, so we'll skip it for now
		const agent = new Agent(session);
		console.log('Agent created successfully - OAuth flow complete!');

		// Store the user's DID in a cookie for session lookup
		// The actual session is already stored in the OAuth client's sessionStore
		cookies.set('bsky_session', session.sub, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false, // Set to true in production with HTTPS
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		console.log('Session established, will redirect to dashboard...');

		// Return success data instead of redirecting immediately
		// This ensures the cookie is set before the redirect
		return {
			isOAuthCallback: true,
			success: true,
			userDid: session.sub,
			redirectTo: '/dashboard'
		};
	} catch (error) {
		if (error instanceof Response) {
			throw error; // Re-throw redirects
		}
		
		console.error('OAuth callback error:', error);
		
		// Redirect to home with error indication
		throw redirect(302, '/?error=oauth_failed');
	}
};