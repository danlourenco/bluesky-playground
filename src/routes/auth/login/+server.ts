// Login endpoint - initiates OAuth flow (following README example)
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createOAuthClient } from '$lib/server/oauth';

export const GET: RequestHandler = async ({ url }) => {
	console.log('Starting OAuth login flow...');

	try {
		// Create the OAuth client
		const client = await createOAuthClient();

		// Get handle from query parameters (optional)
		const handle = url.searchParams.get('handle') || '';

		// Generate state for CSRF protection
		const state = crypto.randomUUID();

		console.log('Authorizing with handle:', handle);

		const redirectUri = `${process.env.PUBLIC_URL || 'http://127.0.0.1:5174'}/`;
		console.log('Using redirect_uri:', redirectUri);

		// Generate the authorization URL (following README example)
		const authUrl = await client.authorize(handle, {
			state,
			scope: 'atproto transition:generic',
			redirect_uri: redirectUri
		});

		console.log('Generated authorization URL:', authUrl.toString());

		// Redirect user to Bluesky for authorization
		throw redirect(302, authUrl.toString());
	} catch (error) {
		if (error instanceof Response) {
			throw error; // Re-throw redirects
		}
		console.error('Error during OAuth authorization:', error);
		throw error;
	}
};