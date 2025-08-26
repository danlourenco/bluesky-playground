// Server-side code for the dashboard page
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getBlueskyService } from '$lib/server/bluesky';
import type { DemoType } from '$lib/server/bluesky';

export const load: PageServerLoad = async ({ cookies, url }) => {
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

		// Get which API to demonstrate from query params
		const demo = (url.searchParams.get('demo') || 'profile') as DemoType;

		console.log(`Running demo: ${demo} for user: ${sessionId}`);

		let apiData: any = null;
		let apiError: string | null = null;

		try {
			// Use the unified demo API method
			const response = await bluesky.executeDemoAPI(sessionId, demo, sessionId, 10);
			
			if (response.success) {
				// For API compatibility with the template, wrap the data to match expected structure
				apiData = { data: response.data };
			} else {
				apiError = response.error?.message || 'Unknown error occurred';
			}
		} catch (error) {
			console.error(`Error running ${demo} demo:`, error);
			apiError = error instanceof Error ? error.message : 'Unknown error occurred';
		}

		// Return data to the page
		// Convert API response to serializable plain objects for SvelteKit
		return {
			user: sessionId,
			demo,
			apiData: apiData ? JSON.parse(JSON.stringify(apiData)) : null,
			apiError
		};
	} catch (error) {
		console.error('Error with dashboard:', error);
		
		// If we can't access the service, redirect to login
		cookies.delete('bsky_session', { path: '/' });
		throw redirect(302, '/');
	}
};