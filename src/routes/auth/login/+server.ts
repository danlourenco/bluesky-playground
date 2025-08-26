// Login endpoint - initiates OAuth flow (following README example)
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDefaultBlueskyService } from '$lib/server/bluesky';

export const GET: RequestHandler = async ({ url }) => {
	console.log('Starting OAuth login flow...');

	try {
		// Get the Bluesky service instance (same one used by callback and dashboard)
		const bluesky = getDefaultBlueskyService();

		// Get handle from query parameters (optional)
		const handle = url.searchParams.get('handle') || '';

		console.log('Authorizing with handle:', handle);

		// Generate the authorization URL using the refactored service
		const authUrl = await bluesky.initiateLogin(handle);

		console.log('Generated authorization URL:', authUrl);

		// Redirect user to Bluesky for authorization
		throw redirect(302, authUrl);
	} catch (error) {
		if (error instanceof Response) {
			throw error; // Re-throw redirects
		}
		console.error('Error during OAuth authorization:', error);
		throw error;
	}
};