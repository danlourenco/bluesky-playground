// JWKS endpoint for OAuth
// Note: Currently using public client auth ('none'), so no JWKS needed
// This endpoint exists for completeness but returns empty JWKS
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	// Since we're using 'token_endpoint_auth_method: none', 
	// we don't need JWT keys, so return empty JWKS
	const emptyJWKS = {
		keys: []
	};
	
	return new Response(JSON.stringify(emptyJWKS, null, 2), {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};