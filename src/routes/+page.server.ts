// Page server load function that handles OAuth callback at root
// Per atproto OAuth spec, localhost redirect URIs must be http://127.0.0.1/
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDefaultBlueskyService } from '$lib/server/bluesky';

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
		// Get the Bluesky service instance (same one used by login and dashboard)
		const bluesky = getDefaultBlueskyService();

		// Handle the OAuth callback using the refactored service
		const result = await bluesky.handleOAuthCallback(url.toString(), cookies);

		if (result.success && result.userDid) {
			console.log('Agent created successfully - OAuth flow complete!');
			console.log('Session established, will redirect to dashboard...');

			// Return success data instead of redirecting immediately
			// This ensures the cookie is set before the redirect
			return {
				isOAuthCallback: true,
				success: true,
				userDid: result.userDid,
				redirectTo: '/dashboard'
			};
		} else {
			console.error('OAuth callback failed:', result.error);
			throw redirect(302, '/?error=oauth_failed');
		}
	} catch (error) {
		if (error instanceof Response) {
			throw error; // Re-throw redirects
		}
		
		console.error('OAuth callback error:', error);
		
		// Redirect to home with error indication
		throw redirect(302, '/?error=oauth_failed');
	}
};