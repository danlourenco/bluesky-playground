// OAuth callback endpoint - handles OAuth response (following README example)
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBlueskyService } from '$lib/server/bluesky';

export const GET: RequestHandler = async ({ url, cookies }) => {
	console.log('OAuth callback received at root');
	console.log('Callback URL:', url.toString());

	try {
		// Get the singleton Bluesky service instance
		const bluesky = getBlueskyService();

		// Handle the OAuth callback using the refactored service
		const result = await bluesky.handleOAuthCallback(url.toString(), cookies);

		if (result.success && result.userDid) {
			console.log('Agent created successfully - OAuth flow complete!');
			console.log('Session established, will redirect to dashboard...');
			
			// Redirect to dashboard
			throw redirect(302, '/dashboard');
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