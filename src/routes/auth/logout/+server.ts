// Logout endpoint - clears the session
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDefaultBlueskyService } from '$lib/server/bluesky';

export const GET: RequestHandler = async ({ cookies }) => {
	console.log('Logging out user...');

	// Get the session ID from the cookie
	const sessionId = cookies.get('bsky_session');

	if (sessionId) {
		try {
			// Get the Bluesky service instance
			const bluesky = getDefaultBlueskyService();
			
			// Logout user and clear session cookie
			await bluesky.logout(sessionId, cookies);
			console.log(`User ${sessionId} logged out successfully`);
		} catch (error) {
			console.error('Error during logout:', error);
			// Continue with logout even if session deletion fails
			cookies.delete('bsky_session', { path: '/' });
		}
	} else {
		// Clear cookie even if no session ID
		cookies.delete('bsky_session', { path: '/' });
	}

	console.log('User logged out, redirecting to home...');

	// Redirect to home
	throw redirect(302, '/');
};