<script lang="ts">
	import { onMount } from 'svelte';
	import Hls from 'hls.js';

	// Props
	export let embed: any;

	function setupVideo(videoElement: HTMLVideoElement, playlistUrl: string) {
		console.log('Setting up video with playlist:', playlistUrl);
		console.log('HLS supported:', Hls.isSupported());
		
		if (Hls.isSupported()) {
			console.log('Using HLS.js for video playback');
			const hls = new Hls({
				debug: false,
				enableWorker: false,
				maxBufferLength: 10,
				maxMaxBufferLength: 30
			});
			
			hls.loadSource(playlistUrl);
			hls.attachMedia(videoElement);
			
			hls.on(Hls.Events.MANIFEST_PARSED, function () {
				console.log('HLS manifest parsed, video ready to play');
			});
			
			hls.on(Hls.Events.ERROR, function (event, data) {
				console.error('HLS error:', event, data);
				if (data.fatal) {
					console.log('Fatal HLS error, trying fallback');
					videoElement.src = playlistUrl;
				}
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
</script>

<!-- Images -->
{#if embed?.images}
	<div class="mt-3">
		{#if embed.images.length === 1}
			{@const image = embed.images[0]}
			<div class="max-w-md">
				<img 
					src={image.fullsize} 
					alt={image.alt || 'Post image'}
					class="rounded-lg w-full h-auto"
					loading="lazy"
				/>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-2 max-w-md">
				{#each embed.images as image}
					<img 
						src={image.thumb} 
						alt={image.alt || 'Post image'}
						class="rounded-lg object-cover w-full h-32"
					/>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<!-- Video -->
{#if embed?.$type === 'app.bsky.embed.video#view'}
	{@const video = embed}
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