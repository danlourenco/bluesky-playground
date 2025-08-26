// Server-side code for the dashboard page
// This runs on the server before the page is rendered
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserAgent } from '$lib/server/oauth';

export const load: PageServerLoad = async ({ cookies, url }) => {
	// Get the session ID from the cookie
	const sessionId = cookies.get('bsky_session');

	// If no session cookie, redirect to login
	if (!sessionId) {
		console.log('No session cookie found, redirecting to login...');
		throw redirect(302, '/');
	}

	try {
		// Get the authenticated agent from the session  
		const agent = await getUserAgent(sessionId);
		// Get which API to demonstrate from query params
		const demo = url.searchParams.get('demo') || 'profile';

		// Object to store our API response
		let apiData: any = null;
		let apiError: string | null = null;

		console.log(`Running demo: ${demo}`);
		console.log('Agent session details:', {
			did: agent.session?.did,
			sub: agent.session?.sub,
			sessionExists: !!agent.session
		});
		console.log(`About to execute case: ${demo}`);

		try {
			switch (demo) {
				case 'profile':
					// Get the user's own profile - this works with basic 'atproto' scope
					apiData = await agent.getProfile({ 
						actor: sessionId
					});
					break;

				case 'timeline':
					// Timeline requires specific scopes not available in basic OAuth
					// Show what the error would be and what scope is needed
					try {
						apiData = await agent.getTimeline({ 
							limit: 10
						});
					} catch (error: any) {
						apiData = {
							error: true,
							message: error.message,
							requiredScope: "rpc:app.bsky.feed.getTimeline?aud=did:web:api.bsky.app%23bsky_appview",
							currentScope: "atproto",
							explanation: "The timeline API requires additional OAuth scopes that are not available in the current basic atproto scope."
						};
					}
					break;

				case 'author-feed':
					// Get posts from a specific user (in this case, themselves)
					try {
						apiData = await agent.getAuthorFeed({ 
							actor: sessionId,
							limit: 10
						});
					} catch (error: any) {
						apiData = {
							error: true,
							message: error.message,
							requiredScope: "rpc:app.bsky.feed.getAuthorFeed?aud=did:web:api.bsky.app%23bsky_appview",
							currentScope: "atproto",
							explanation: "The author feed API requires additional OAuth scopes."
						};
					}
					break;

				case 'post-thread':
					// For demo, we'll first get a post then its thread
					// First, get user's recent posts
					const feedData = await agent.getAuthorFeed({ 
						actor: sessionId, 
						limit: 1 
					});
					
					if (feedData.data.feed.length > 0) {
						// Get the thread for the first post
						const firstPost = feedData.data.feed[0];
						apiData = await agent.getPostThread({ 
							uri: firstPost.post.uri 
						});
					} else {
						apiData = { message: 'No posts found to show thread for' };
					}
					break;

				case 'likes':
					// Get posts that the user has liked
					try {
						apiData = await agent.getActorLikes({ 
							actor: sessionId,
							limit: 10
						});
					} catch (error: any) {
						apiData = {
							error: true,
							message: error.message,
							requiredScope: "rpc:app.bsky.feed.getActorLikes?aud=did:web:api.bsky.app%23bsky_appview",
							currentScope: "atproto",
							explanation: "The likes API requires additional OAuth scopes."
						};
					}
					break;

				case 'following':
					// Get list of users this person follows
					try {
						apiData = await agent.getFollows({ 
							actor: sessionId,
							limit: 20
						});
					} catch (error: any) {
						apiData = {
							error: true,
							message: error.message,
							requiredScope: "rpc:app.bsky.graph.getFollows?aud=did:web:api.bsky.app%23bsky_appview",
							currentScope: "atproto",
							explanation: "The following API requires additional OAuth scopes."
						};
					}
					break;

				case 'followers':
					// Get list of users following this person
					try {
						apiData = await agent.getFollowers({ 
							actor: sessionId,
							limit: 20
						});
					} catch (error: any) {
						apiData = {
							error: true,
							message: error.message,
							requiredScope: "rpc:app.bsky.graph.getFollowers?aud=did:web:api.bsky.app%23bsky_appview",
							currentScope: "atproto",
							explanation: "The followers API requires additional OAuth scopes."
						};
					}
					break;

				default:
					apiData = { message: 'Unknown demo type' };
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
		console.error('Error with agent:', error);
		
		// If we can't use the agent, the session might be invalid
		// Clear it and redirect to login
		cookies.delete('bsky_session', { path: '/' });
		throw redirect(302, '/');
	}
};