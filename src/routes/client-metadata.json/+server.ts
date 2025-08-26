// Client metadata endpoint for OAuth
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const PUBLIC_URL = process.env.PUBLIC_URL || 'http://127.0.0.1:5174';
	
	const clientMetadata = {
		"client_id": `${PUBLIC_URL}/client-metadata.json`,
		"client_name": "SvelteKit Bsky Guide",
		"client_uri": PUBLIC_URL,
		"redirect_uris": [`${PUBLIC_URL}/`],
		"scope": "atproto transition:generic",
		"grant_types": ["authorization_code", "refresh_token"],
		"response_types": ["code"],
		"token_endpoint_auth_method": "none",
		"application_type": "web",
		"dpop_bound_access_tokens": true
	};
	
	return new Response(JSON.stringify(clientMetadata, null, 2), {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};