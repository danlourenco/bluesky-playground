<script lang="ts">
	import { onMount } from 'svelte';

	// Props
	export let post: any;
	export let showCopyButton = true;
	export let copyButtonId = 'copy-btn';
	export let showRepostIndicator = true;

	// HLS.js support for video playback
	let Hls: any = null;
	
	onMount(async () => {
		// Load HLS.js dynamically from CDN
		if (typeof window !== 'undefined') {
			try {
				// Check if HLS.js is already loaded
				if ((window as any).Hls) {
					Hls = (window as any).Hls;
					console.log('HLS.js already available');
					return;
				}
				
				// Create script tag to load HLS.js
				const script = document.createElement('script');
				script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
				script.onload = () => {
					Hls = (window as any).Hls;
					console.log('HLS.js loaded successfully', Hls ? 'supported' : 'not supported');
				};
				script.onerror = () => {
					console.log('Failed to load HLS.js, falling back to native video');
				};
				document.head.appendChild(script);
			} catch (error) {
				console.log('HLS.js not available, falling back to native video');
			}
		}
	});

	function setupVideo(videoElement: HTMLVideoElement, playlistUrl: string) {
		console.log('Setting up video with playlist:', playlistUrl);
		console.log('HLS available:', !!Hls, 'HLS supported:', Hls ? Hls.isSupported() : false);
		
		if (Hls && Hls.isSupported()) {
			console.log('Using HLS.js for video playback');
			const hls = new Hls({
				debug: true,
				enableWorker: false
			});
			
			hls.loadSource(playlistUrl);
			hls.attachMedia(videoElement);
			
			hls.on(Hls.Events.MANIFEST_PARSED, function () {
				console.log('HLS manifest parsed, video ready to play');
			});
			
			hls.on(Hls.Events.ERROR, function (event, data) {
				console.error('HLS error:', event, data);
			});
			
			return {
				destroy() {
					hls.destroy();
				}
			};
		} else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
			// Native HLS support (Safari)
			console.log('Using native HLS support');
			videoElement.src = playlistUrl;
		} else {
			console.log('HLS not supported, setting source directly');
			videoElement.src = playlistUrl;
		}
		return { destroy() {} };
	}

	// Copy JSON to clipboard function
	async function copyPostJson() {
		const jsonString = JSON.stringify(post, null, 2);
		
		try {
			await navigator.clipboard.writeText(jsonString);
			
			// Show success feedback (temporary)
			const button = document.getElementById(copyButtonId);
			if (button) {
				const originalText = button.innerHTML;
				button.innerHTML = '✓ Copied!';
				button.classList.add('bg-green-600', 'hover:bg-green-700');
				button.classList.remove('bg-gray-600', 'hover:bg-gray-700');
				
				setTimeout(() => {
					button.innerHTML = originalText;
					button.classList.remove('bg-green-600', 'hover:bg-green-700');
					button.classList.add('bg-gray-600', 'hover:bg-gray-700');
				}, 2000);
			}
		} catch (error) {
			console.error('Failed to copy JSON:', error);
			alert('Failed to copy JSON to clipboard');
		}
	}
</script>

<div class="hover:bg-gray-50 relative group">
	<!-- Copy JSON Button -->
	{#if showCopyButton}
		<button
			id={copyButtonId}
			on:click={copyPostJson}
			class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded-md flex items-center space-x-1 z-10"
			title="Copy post JSON to clipboard"
		>
			<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
			</svg>
			<span>Copy JSON</span>
		</button>
	{/if}
	
	<!-- Repost indicator -->
	{#if showRepostIndicator && post.reason?.$type === 'app.bsky.feed.defs#reasonRepost'}
		<div class="p-4 pb-2">
			<div class="flex items-center space-x-2 text-gray-500 text-sm">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
				</svg>
				<span>Reposted</span>
				<span class="text-xs">• {new Date(post.reason?.indexedAt || Date.now()).toLocaleDateString()}</span>
			</div>
		</div>
	{/if}
	
	<!-- Main post content -->
	<div class="p-4 {showRepostIndicator && post.reason?.$type === 'app.bsky.feed.defs#reasonRepost' ? 'pt-0' : ''}">
		<div class="flex space-x-3">
			<img 
				src={post.post.author.avatar || 'https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=?'} 
				alt="{post.post.author.displayName || post.post.author.handle}'s avatar"
				class="w-12 h-12 rounded-full object-cover flex-shrink-0"
			/>
			<div class="flex-1 min-w-0">
				<div class="flex items-center space-x-1">
					<span class="font-semibold text-gray-900">{post.post.author.displayName || post.post.author.handle}</span>
					<span class="text-gray-500">@{post.post.author.handle}</span>
					<span class="text-gray-400">·</span>
					<span class="text-gray-500 text-sm">
						{new Date(post.post.indexedAt || post.post.record?.createdAt || Date.now()).toLocaleDateString()}
					</span>
				</div>
				<div class="mt-1 text-gray-800 whitespace-pre-wrap break-words">
					{post.post.record?.text || ''}
				</div>
				
				<!-- Direct images -->
				{#if post.post.embed?.images}
					<div class="mt-3 grid grid-cols-2 gap-2 max-w-md">
						{#each post.post.embed.images as image}
							<img 
								src={image.thumb} 
								alt={image.alt || 'Post image'}
								class="rounded-lg object-cover w-full h-32"
							/>
						{/each}
					</div>
				{/if}
				
				<!-- Direct video embed -->
				{#if post.post.embed?.$type === 'app.bsky.embed.video#view'}
					{@const video = post.post.embed}
					<div class="mt-3 relative rounded-lg overflow-hidden bg-black" style="aspect-ratio: {video.aspectRatio?.width || 16}/{video.aspectRatio?.height || 9}">
						<video 
							controls 
							poster={video.thumbnail}
							class="w-full h-full object-cover"
							preload="metadata"
							use:setupVideo={video.playlist}
						>
							<p class="text-white p-4 text-center">Loading video...</p>
						</video>
						<div class="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
							Video
						</div>
					</div>
				{/if}
				
				<!-- Embedded quote post with media -->
				{#if post.post.embed?.$type === 'app.bsky.embed.record#view' && post.post.embed.record}
					{@const quotedPost = post.post.embed.record}
					<div class="mt-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
						<!-- Quote post header -->
						<div class="flex items-center space-x-2 mb-3">
							<img 
								src={quotedPost.author?.avatar || 'https://via.placeholder.com/32x32/e5e7eb/9ca3af?text=?'} 
								alt="{quotedPost.author?.displayName || quotedPost.author?.handle || 'User'}'s avatar"
								class="w-8 h-8 rounded-full object-cover"
							/>
							<div>
								<div class="flex items-center space-x-1">
									<span class="font-semibold text-gray-800 text-sm">{quotedPost.author?.displayName || quotedPost.author?.handle || 'Unknown User'}</span>
									<span class="text-gray-500 text-sm">@{quotedPost.author?.handle || 'unknown'}</span>
								</div>
								<span class="text-gray-500 text-xs">
									{new Date(quotedPost.indexedAt || quotedPost.value?.createdAt || Date.now()).toLocaleDateString()}
								</span>
							</div>
						</div>
						
						<!-- Quote post text -->
						<div class="text-gray-800 text-sm mb-3">{quotedPost.value?.text || ''}</div>
						
						<!-- Quote post images (if any) -->
						{#if quotedPost.value?.embed?.images}
							<div class="mb-3 grid grid-cols-2 gap-2 max-w-md">
								{#each quotedPost.value.embed.images as image}
									<img 
										src={image.thumb} 
										alt={image.alt || 'Quoted post image'}
										class="rounded-lg object-cover w-full h-32"
									/>
								{/each}
							</div>
						{/if}
						
						<!-- Quote post video (from embeds array) -->
						{#if quotedPost.embeds?.[0]?.$type === 'app.bsky.embed.video#view'}
							{@const video = quotedPost.embeds[0]}
							<div class="mb-3 relative rounded-lg overflow-hidden bg-black" style="aspect-ratio: {video.aspectRatio?.width || 16}/{video.aspectRatio?.height || 9}">
								<video 
									controls 
									poster={video.thumbnail}
									class="w-full h-full object-cover"
									preload="metadata"
									use:setupVideo={video.playlist}
								>
									<p class="text-white p-4 text-center">Loading video...</p>
								</video>
								<div class="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
									📹 Video
								</div>
								<!-- Video info overlay -->
								<div class="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
									{video.aspectRatio?.width}×{video.aspectRatio?.height}
								</div>
							</div>
						{/if}
						
						<!-- Engagement stats for embedded post -->
						<div class="flex items-center space-x-4 text-gray-500 text-xs border-t border-gray-300 pt-2">
							<div class="flex items-center space-x-1">
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
								</svg>
								<span>{quotedPost.replyCount || 0}</span>
							</div>
							<div class="flex items-center space-x-1">
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
								</svg>
								<span>{quotedPost.repostCount || 0}</span>
							</div>
							<div class="flex items-center space-x-1">
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
								</svg>
								<span>{quotedPost.likeCount || 0}</span>
							</div>
							<div class="flex items-center space-x-1">
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
								</svg>
								<span>{quotedPost.quoteCount || 0} quotes</span>
							</div>
						</div>
					</div>
				{/if}
				
				<!-- Engagement stats for main post -->
				<div class="flex items-center space-x-6 mt-3 text-gray-500">
					<div class="flex items-center space-x-2">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
						</svg>
						<span class="text-sm">{post.post.replyCount || 0}</span>
					</div>
					<div class="flex items-center space-x-2">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
						</svg>
						<span class="text-sm">{post.post.repostCount || 0}</span>
					</div>
					<div class="flex items-center space-x-2">
						<svg class="w-5 h-5 {post.post.viewer?.like ? 'text-red-500' : ''}" fill={post.post.viewer?.like ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
						</svg>
						<span class="text-sm {post.post.viewer?.like ? 'text-red-500' : ''}">{post.post.likeCount || 0}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>