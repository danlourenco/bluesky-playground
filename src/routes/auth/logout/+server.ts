// Logout endpoint - clears the session
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createOAuthClient } from '$lib/server/oauth';

export const GET: RequestHandler = async ({ cookies }) => {
	console.log('Logging out user...');

	// Get the session ID from the cookie
	const sessionId = cookies.get('bsky_session');

	if (sessionId) {
		try {
			// Create OAuth client to access session store
			const client = await createOAuthClient();
			
			// Delete the session from the OAuth client's session store
			await client.sessionStore.del(sessionId);
			console.log(`Session ${sessionId} deleted from OAuth client store`);
		} catch (error) {
			console.error('Error deleting session from OAuth store:', error);
			// Continue with logout even if session deletion fails
		}
	}

	// Delete the cookie
	cookies.delete('bsky_session', { path: '/' });

	console.log('User logged out, redirecting to home...');

	// Redirect to home
	throw redirect(302, '/');
};