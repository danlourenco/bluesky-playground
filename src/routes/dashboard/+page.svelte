<script lang="ts">
	import type { PageData } from './$types';

	// The data from our server load function
	export let data: PageData;

	// List of available API demos
	const demos = [
		{ id: 'profile', name: 'Get Profile', description: 'Get your profile information' },
		{ id: 'timeline', name: 'Get Timeline', description: 'Get your home timeline feed' },
		{ id: 'author-feed', name: 'Get Author Feed', description: 'Get your own posts' },
		{ id: 'post-thread', name: 'Get Post Thread', description: 'Get a post and its replies' },
		{ id: 'likes', name: 'Get Likes', description: 'Get posts you have liked' },
		{ id: 'following', name: 'Get Following', description: 'Get users you follow' },
		{ id: 'followers', name: 'Get Followers', description: 'Get your followers' }
	];
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="bg-white shadow rounded-lg p-6 mb-8">
			<div class="flex justify-between items-center">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">Bluesky API Dashboard</h1>
					<p class="mt-1 text-sm text-gray-600">
						Logged in as: <code class="bg-gray-100 px-2 py-1 rounded">{data.user}</code>
					</p>
				</div>
				<a
					href="/auth/logout"
					class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
				>
					Logout
				</a>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- API Demo Selector -->
			<div class="lg:col-span-1">
				<div class="bg-white shadow rounded-lg p-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">API Demonstrations</h2>
					<p class="text-sm text-gray-600 mb-4">
						Click on any API below to see it in action. The response will appear on the right.
					</p>
					<div class="space-y-2">
						{#each demos as demo}
							<a
								href="/dashboard?demo={demo.id}"
								class="block p-3 rounded-md transition {data.demo === demo.id
									? 'bg-blue-100 border-2 border-blue-500'
									: 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'}"
							>
								<div class="font-medium text-gray-900">{demo.name}</div>
								<div class="text-sm text-gray-600">{demo.description}</div>
							</a>
						{/each}
					</div>
				</div>

				<!-- Info Box -->
				<div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-6">
					<h3 class="font-semibold text-blue-900 mb-2">How This Works</h3>
					<ul class="text-sm text-blue-800 space-y-1">
						<li>• OAuth tokens are stored server-side</li>
						<li>• Using basic 'atproto' scope (works for Profile)</li>
						<li>• Other APIs show educational scope requirements</li>
						<li>• All API calls happen on the server (SSR)</li>
						<li>• Sessions expire after 1 week</li>
					</ul>
				</div>
			</div>

			<!-- API Response Display -->
			<div class="lg:col-span-2">
				<div class="bg-white shadow rounded-lg p-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">
						API Response: {demos.find(d => d.id === data.demo)?.name}
					</h2>

					{#if data.apiError}
						<!-- Error Display -->
						<div class="bg-red-50 border-2 border-red-200 rounded-md p-4">
							<h3 class="text-red-800 font-semibold mb-2">Error</h3>
							<p class="text-red-700">{data.apiError}</p>
						</div>
					{:else if data.apiData}
						<!-- Success Response -->
						<div class="bg-gray-50 rounded-md p-4">
							<div class="mb-2 text-sm text-gray-600">
								<span class="font-semibold">Response Type:</span>
								<code class="ml-2 bg-gray-200 px-2 py-1 rounded">
									{data.demo}
								</code>
							</div>
							
							<!-- Pretty-printed JSON -->
							<div class="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
								<pre class="text-sm"><code>{JSON.stringify(data.apiData, null, 2)}</code></pre>
							</div>

							<!-- Quick Stats -->
							{#if data.demo === 'timeline' && data.apiData.data?.feed}
								<div class="mt-4 p-3 bg-blue-50 rounded-md">
									<p class="text-sm text-blue-900">
										Showing {data.apiData.data.feed.length} posts from your timeline
									</p>
								</div>
							{:else if data.demo === 'following' && data.apiData.data?.follows}
								<div class="mt-4 p-3 bg-blue-50 rounded-md">
									<p class="text-sm text-blue-900">
										You follow {data.apiData.data.follows.length} users
									</p>
								</div>
							{:else if data.demo === 'followers' && data.apiData.data?.followers}
								<div class="mt-4 p-3 bg-blue-50 rounded-md">
									<p class="text-sm text-blue-900">
										You have {data.apiData.data.followers.length} followers
									</p>
								</div>
							{/if}
						</div>
					{:else}
						<!-- Loading State (shouldn't happen with SSR, but good to have) -->
						<div class="text-gray-500">Loading...</div>
					{/if}
				</div>

				<!-- API Documentation Links -->
				<div class="bg-gray-50 rounded-lg p-4 mt-6">
					<h3 class="font-semibold text-gray-900 mb-2">Learn More</h3>
					<ul class="text-sm space-y-1">
						<li>
							<a 
								href="https://docs.bsky.app/" 
								target="_blank" 
								class="text-blue-600 hover:text-blue-800"
							>
								Bluesky API Documentation →
							</a>
						</li>
						<li>
							<a 
								href="https://github.com/bluesky-social/atproto" 
								target="_blank"
								class="text-blue-600 hover:text-blue-800"
							>
								AT Protocol GitHub →
							</a>
						</li>
						<li>
							<a 
								href="https://atproto.com/" 
								target="_blank"
								class="text-blue-600 hover:text-blue-800"
							>
								AT Protocol Specification →
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>