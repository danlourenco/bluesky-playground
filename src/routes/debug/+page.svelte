<script lang="ts">
	import PostComponent from '$lib/components/PostComponent.svelte';
	
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

						<!-- Render the post using the reusable PostComponent -->
						<div class="border rounded-lg">
							<PostComponent 
								post={parsedPost} 
								showCopyButton={false}
								copyButtonId="debug-post-copy"
							/>
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