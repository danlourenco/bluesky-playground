<script lang="ts">
	let jsonInput = '';
	let parsedPost = null;
	let parseError = null;
	let showRawJson = false;

	// Sample JSON to help users get started
	const sampleJson = `{
  "post": {
    "uri": "at://did:plc:example/app.bsky.feed.post/123",
    "author": {
      "did": "did:plc:example",
      "handle": "user.bsky.social", 
      "displayName": "Test User",
      "avatar": "https://example.com/avatar.jpg"
    },
    "record": {
      "text": "This is a sample post for testing the UI!",
      "createdAt": "2025-01-15T12:00:00.000Z"
    },
    "likeCount": 42,
    "replyCount": 7,
    "repostCount": 12,
    "indexedAt": "2025-01-15T12:00:00.000Z"
  }
}`;

	function parseJson() {
		parseError = null;
		parsedPost = null;
		
		if (!jsonInput.trim()) {
			parseError = 'Please enter some JSON';
			return;
		}

		try {
			const parsed = JSON.parse(jsonInput);
			
			// Validate that it looks like a post object
			if (!parsed.post) {
				parseError = 'JSON should have a "post" property';
				return;
			}
			
			parsedPost = parsed;
		} catch (error) {
			parseError = `Invalid JSON: ${error.message}`;
		}
	}

	function loadSample() {
		jsonInput = sampleJson;
		parseJson();
	}

	function clearInput() {
		jsonInput = '';
		parsedPost = null;
		parseError = null;
	}
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="bg-white shadow rounded-lg p-6 mb-8">
			<div class="flex justify-between items-center">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">🐛 Post JSON Debugger</h1>
					<p class="mt-1 text-sm text-gray-600">
						Paste a post JSON object to test and refine the UI rendering
					</p>
				</div>
				<a
					href="/dashboard"
					class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
				>
					← Dashboard
				</a>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- JSON Input -->
			<div class="space-y-6">
				<div class="bg-white shadow rounded-lg p-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">JSON Input</h2>
					
					<div class="space-y-4">
						<div class="flex space-x-2">
							<button
								on:click={loadSample}
								class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
							>
								📝 Load Sample
							</button>
							<button
								on:click={clearInput}
								class="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition"
							>
								🗑️ Clear
							</button>
						</div>

						<textarea
							bind:value={jsonInput}
							placeholder="Paste your post JSON here..."
							class="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm"
							spellcheck="false"
						></textarea>

						<div class="flex space-x-2">
							<button
								on:click={parseJson}
								class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
							>
								🔄 Parse & Render
							</button>
						</div>

						{#if parseError}
							<div class="bg-red-50 border-2 border-red-200 rounded-md p-4">
								<h3 class="text-red-800 font-semibold mb-2">Parse Error</h3>
								<p class="text-red-700">{parseError}</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Tips -->
				<div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
					<h3 class="font-semibold text-blue-900 mb-2">💡 Tips</h3>
					<ul class="text-sm text-blue-800 space-y-1">
						<li>• Copy JSON from browser dev tools network tab</li>
						<li>• Look for timeline/feed API responses</li>
						<li>• Post should have: post.author, post.record, post.embed (optional)</li>
						<li>• Great for testing videos, images, quote posts, etc.</li>
						<li>• Changes here don't affect the real dashboard</li>
					</ul>
				</div>
			</div>

			<!-- Rendered Output -->
			<div class="space-y-6">
				{#if parsedPost}
					<div class="bg-white shadow rounded-lg p-6">
						<div class="flex justify-between items-center mb-4">
							<h2 class="text-lg font-semibold text-gray-900">Rendered Post</h2>
							<button
								on:click={() => showRawJson = !showRawJson}
								class="text-sm text-gray-500 hover:text-gray-700"
							>
								{showRawJson ? '👁️ Hide' : '🔍 Show'} Raw JSON
							</button>
						</div>

						{#if showRawJson}
							<details class="mb-4">
								<summary class="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
									📄 Parsed JSON Structure
								</summary>
								<div class="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
									<pre class="text-sm"><code>{JSON.stringify(parsedPost, null, 2)}</code></pre>
								</div>
							</details>
						{/if}

						<!-- Render the post using the same component structure as dashboard -->
						<div class="border rounded-lg">
							<div class="p-4 hover:bg-gray-50">
								<!-- Repost indicator -->
								{#if parsedPost.reason?.$type === 'app.bsky.feed.defs#reasonRepost'}
									<div class="pb-2">
										<div class="flex items-center space-x-2 text-gray-500 text-sm">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
											</svg>
											<span>Reposted</span>
											<span class="text-xs">• {new Date(parsedPost.reason?.indexedAt || Date.now()).toLocaleDateString()}</span>
										</div>
									</div>
								{/if}
								
								<!-- Main post content -->
								<div class="flex space-x-3">
									<img 
										src={parsedPost.post.author.avatar || 'https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=?'} 
										alt="{parsedPost.post.author.displayName || parsedPost.post.author.handle}'s avatar"
										class="w-12 h-12 rounded-full object-cover flex-shrink-0"
									/>
									<div class="flex-1 min-w-0">
										<div class="flex items-center space-x-1">
											<span class="font-semibold text-gray-900">{parsedPost.post.author.displayName || parsedPost.post.author.handle}</span>
											<span class="text-gray-500">@{parsedPost.post.author.handle}</span>
											<span class="text-gray-400">·</span>
											<span class="text-gray-500 text-sm">
												{new Date(parsedPost.post.indexedAt || parsedPost.post.record?.createdAt || Date.now()).toLocaleDateString()}
											</span>
										</div>
										<div class="mt-1 text-gray-800 whitespace-pre-wrap break-words">
											{parsedPost.post.record?.text || ''}
										</div>
										
										<!-- Direct images -->
										{#if parsedPost.post.embed?.images}
											<div class="mt-3 grid grid-cols-2 gap-2 max-w-md">
												{#each parsedPost.post.embed.images as image}
													<img 
														src={image.thumb} 
														alt={image.alt || 'Post image'}
														class="rounded-lg object-cover w-full h-32"
													/>
												{/each}
											</div>
										{/if}
										
										<!-- Direct video embed -->
										{#if parsedPost.post.embed?.$type === 'app.bsky.embed.video#view'}
											{@const video = parsedPost.post.embed}
											<div class="mt-3 relative rounded-lg overflow-hidden bg-black" style="aspect-ratio: {video.aspectRatio?.width || 16}/{video.aspectRatio?.height || 9}">
												<video 
													controls 
													poster={video.thumbnail}
													class="w-full h-full object-cover"
													preload="metadata"
												>
													<source src={video.playlist} type="application/x-mpegURL" />
													<p class="text-white p-4">Your browser doesn't support this video format.</p>
												</video>
												<div class="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
													Video
												</div>
											</div>
										{/if}
										
										<!-- Embedded quote post with potential video -->
										{#if parsedPost.post.embed?.record?.record}
											<div class="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
												<div class="flex items-center space-x-2 mb-2">
													<img 
														src={parsedPost.post.embed.record.record.author?.avatar || 'https://via.placeholder.com/24x24/e5e7eb/9ca3af?text=?'} 
														alt="{parsedPost.post.embed.record.record.author?.displayName || parsedPost.post.embed.record.record.author?.handle || 'User'}'s avatar"
														class="w-6 h-6 rounded-full object-cover"
													/>
													<span class="font-medium text-gray-700 text-sm">{parsedPost.post.embed.record.record.author?.displayName || parsedPost.post.embed.record.record.author?.handle || 'Unknown User'}</span>
													<span class="text-gray-500 text-sm">@{parsedPost.post.embed.record.record.author?.handle || 'unknown'}</span>
												</div>
												<div class="text-gray-800 text-sm mb-2">{parsedPost.post.embed.record.record.value?.text || ''}</div>
												
												<!-- Embedded video in quote post -->
												{#if parsedPost.post.embed.record.record.embeds?.[0]?.$type === 'app.bsky.embed.video#view'}
													{@const video = parsedPost.post.embed.record.record.embeds[0]}
													<div class="relative rounded-lg overflow-hidden bg-black" style="aspect-ratio: {video.aspectRatio?.width || 16}/{video.aspectRatio?.height || 9}">
														<video 
															controls 
															poster={video.thumbnail}
															class="w-full h-full object-cover"
															preload="metadata"
														>
															<source src={video.playlist} type="application/x-mpegURL" />
															<p class="text-white p-4">Your browser doesn't support this video format.</p>
														</video>
														<div class="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
															Video
														</div>
													</div>
												{/if}
												
												<!-- Engagement stats for embedded post -->
												<div class="flex items-center space-x-4 mt-2 text-gray-500 text-xs">
													<span>{parsedPost.post.embed.record.record.replyCount || 0} replies</span>
													<span>{parsedPost.post.embed.record.record.repostCount || 0} reposts</span>
													<span>{parsedPost.post.embed.record.record.likeCount || 0} likes</span>
												</div>
											</div>
										{/if}
										
										<!-- Engagement stats for main post -->
										<div class="flex items-center space-x-6 mt-3 text-gray-500">
											<div class="flex items-center space-x-2">
												<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
												</svg>
												<span class="text-sm">{parsedPost.post.replyCount || 0}</span>
											</div>
											<div class="flex items-center space-x-2">
												<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
												</svg>
												<span class="text-sm">{parsedPost.post.repostCount || 0}</span>
											</div>
											<div class="flex items-center space-x-2">
												<svg class="w-5 h-5 {parsedPost.post.viewer?.like ? 'text-red-500' : ''}" fill={parsedPost.post.viewer?.like ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
												</svg>
												<span class="text-sm {parsedPost.post.viewer?.like ? 'text-red-500' : ''}">{parsedPost.post.likeCount || 0}</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				{:else}
					<div class="bg-white shadow rounded-lg p-6">
						<h2 class="text-lg font-semibold text-gray-900 mb-4">Rendered Post</h2>
						<div class="text-center py-12 text-gray-500">
							<svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
							</svg>
							<p class="text-sm">Paste some post JSON and click "Parse & Render" to see the preview</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>