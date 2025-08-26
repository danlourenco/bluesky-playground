import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getBlueskyService } from '$lib/server/bluesky';

export const load: PageServerLoad = async ({ cookies }) => {
	// Get the session ID from the cookie
	const sessionId = cookies.get('bsky_session');

	// If no session cookie, redirect to login
	if (!sessionId) {
		console.log('No session cookie found, redirecting to login...');
		throw redirect(302, '/');
	}

	try {
		// Get the singleton Bluesky service instance
		const bluesky = getBlueskyService();

		// Check if user has valid session
		const hasValidSession = await bluesky.hasValidSession(sessionId);
		if (!hasValidSession) {
			console.log('Invalid session, redirecting to login...');
			cookies.delete('bsky_session', { path: '/' });
			throw redirect(302, '/');
		}

		// Get initial feed data
		try {
			const response = await bluesky.getTimelineEnriched(sessionId, 30);
			
			if (response.success) {
				// Convert API response to serializable plain objects for SvelteKit
				return {
					user: sessionId,
					initialFeed: response.data?.feed ? JSON.parse(JSON.stringify(response.data.feed)) : [],
					cursor: response.data?.cursor || null
				};
			} else {
				console.error('Error fetching timeline:', response.error);
				return {
					user: sessionId,
					initialFeed: [],
					cursor: null,
					error: response.error?.message || 'Failed to load timeline'
				};
			}
		} catch (error) {
			console.error('Error fetching timeline:', error);
			return {
				user: sessionId,
				initialFeed: [],
				cursor: null,
				error: 'Failed to load timeline'
			};
		}
	} catch (error) {
		console.error('Error with TV Guide:', error);
		
		// If we can't access the service, redirect to login
		cookies.delete('bsky_session', { path: '/' });
		throw redirect(302, '/');
	}
};