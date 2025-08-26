// Logout endpoint - clears the session
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSession } from '$lib/server/oauth';

export const GET: RequestHandler = async ({ cookies }) => {
	console.log('Logging out user...');

	// Get the session ID from the cookie
	const sessionId = cookies.get('bsky_session');

	if (sessionId) {
		// Delete the session from our store
		deleteSession(sessionId);
		console.log(`Session ${sessionId} deleted`);
	}

	// Delete the cookie
	cookies.delete('bsky_session', { path: '/' });

	console.log('User logged out, redirecting to home...');

	// Redirect to home
	throw redirect(302, '/');
};