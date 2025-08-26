<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	// Get error state from server load function
	const hasError = data.hasError;
	
	// Handle for pre-filling the OAuth login (optional)
	let handle = '';
	
	// Handle OAuth success redirect
	onMount(() => {
		if (data.success && data.redirectTo) {
			// Small delay to ensure cookie is set, then redirect
			setTimeout(() => {
				goto(data.redirectTo);
			}, 100);
		}
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
	<div class="max-w-md w-full">
		<!-- Main Card -->
		<div class="bg-white rounded-lg shadow-xl p-8">
			<!-- Logo/Title -->
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-gray-900">SvelteKit Bsky Guide</h1>
				<p class="mt-2 text-gray-600">
					A demonstration of Bluesky OAuth integration with SvelteKit
				</p>
			</div>

			<!-- Success Message -->
			{#if data.success}
				<div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
					<p class="text-sm text-green-800">
						🎉 Authentication successful! Redirecting to dashboard...
					</p>
				</div>
			{:else if hasError}
			<!-- Error Message -->
				<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
					<p class="text-sm text-red-800">
						OAuth authentication failed. Please try again.
					</p>
				</div>
			{/if}

			<!-- OAuth Login Form -->
			<!-- 
			This form initiates the OAuth flow by making a GET request to /auth/login
			The server will:
			1. Create an OAuth client with proper configuration
			2. Generate an authorization URL with PKCE, state, etc.
			3. Redirect the user to Bluesky for authentication
			-->
			<form action="/auth/login" method="GET" class="space-y-6">
				<div>
					<label for="handle" class="block text-sm font-medium text-gray-700">
						Bluesky Handle (optional)
					</label>
					<div class="mt-1">
						<input
							type="text"
							id="handle"
							name="handle"
							bind:value={handle}
							placeholder="username.bsky.social"
							class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
					<p class="mt-1 text-xs text-gray-500">
						Enter your handle to pre-fill the OAuth login form, or leave blank
					</p>
				</div>

				<button
					type="submit"
					class="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition duration-200 ease-in-out transform hover:scale-[1.02]"
				>
					Sign in with Bluesky OAuth
				</button>
			</form>

			<!-- OAuth Flow Explanation -->
			<div class="mt-8 pt-6 border-t border-gray-200">
				<h2 class="text-sm font-semibold text-gray-900 mb-3">What happens when you sign in:</h2>
				<ol class="space-y-2 text-sm text-gray-600">
					<li class="flex items-start">
						<span class="font-semibold mr-2">1.</span>
						<span>Server creates OAuth client and generates secure authorization URL</span>
					</li>
					<li class="flex items-start">
						<span class="font-semibold mr-2">2.</span>
						<span>You're redirected to Bluesky to authorize this application</span>
					</li>
					<li class="flex items-start">
						<span class="font-semibold mr-2">3.</span>
						<span>Bluesky redirects back with authorization code</span>
					</li>
					<li class="flex items-start">
						<span class="font-semibold mr-2">4.</span>
						<span>Server exchanges code for access/refresh tokens securely</span>
					</li>
					<li class="flex items-start">
						<span class="font-semibold mr-2">5.</span>
						<span>You can now test various API endpoints with your authenticated session</span>
					</li>
				</ol>
			</div>

			<!-- Technical Implementation Details -->
			<details class="mt-6">
				<summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
					OAuth Technical Implementation Details
				</summary>
				<div class="mt-3 p-4 bg-gray-50 rounded-md text-sm text-gray-700 space-y-2">
					<p><strong>OAuth Flow:</strong> Authorization Code with PKCE (Proof Key for Code Exchange)</p>
					<p><strong>Authentication:</strong> Private Key JWT (private_key_jwt)</p>
					<p><strong>Token Storage:</strong> Server-side sessions with automatic refresh</p>
					<p><strong>Security:</strong> DPoP, HTTPOnly cookies, CSRF protection via state parameter</p>
					<p><strong>Libraries:</strong> @atproto/oauth-client-node, @atproto/api</p>
					<p><strong>Client Type:</strong> Backend service (not native app or SPA)</p>
				</div>
			</details>

			<!-- Requirements Box -->
			<div class="mt-6 p-4 bg-blue-50 rounded-md">
				<h3 class="text-sm font-semibold text-blue-900 mb-2">OAuth Requirements Met:</h3>
				<ul class="text-xs text-blue-800 space-y-1">
					<li>✓ Client metadata hosted at /client-metadata.json</li>
					<li>✓ JWKS endpoint at /jwks.json for JWT verification</li>
					<li>✓ PKCE (Proof Key for Code Exchange) support</li>
					<li>✓ DPoP (Demonstrating Proof of Possession) enabled</li>
					<li>✓ Automatic token refresh handling</li>
					<li>✓ Secure server-side session management</li>
				</ul>
			</div>
		</div>

		<!-- Educational Footer -->
		<div class="mt-6 text-center text-sm text-gray-600">
			<p>
				This demonstrates proper OAuth 2.1 + PKCE implementation for Bluesky.
			</p>
			<p class="mt-1">
				Code is extensively commented for educational purposes.
			</p>
		</div>
	</div>
</div>

<style>
	/* Custom styles for collapsible details */
	details summary::-webkit-details-marker {
		display: none;
	}
	
	details summary::before {
		content: '▶';
		display: inline-block;
		margin-right: 0.5rem;
		transition: transform 0.2s;
	}
	
	details[open] summary::before {
		transform: rotate(90deg);
	}
</style>