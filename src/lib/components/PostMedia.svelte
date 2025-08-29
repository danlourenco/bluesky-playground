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
					class="h-auto w-full rounded-lg"
					loading="lazy"
				/>
			</div>
		{:else}
			<div class="grid max-w-md grid-cols-2 gap-2">
				{#each embed.images as image}
					<img
						src={image.thumb}
						alt={image.alt || 'Post image'}
						class="h-32 w-full rounded-lg object-cover"
					/>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<!-- Video -->
{#if embed?.$type === 'app.bsky.embed.video#view'}
	{@const video = embed}
	<div
		class="relative mt-3 overflow-hidden rounded-lg bg-black"
		style="aspect-ratio: {video.aspectRatio?.width || 16}/{video.aspectRatio?.height || 9}"
	>
		<video
			controls
			poster={video.thumbnail}
			class="h-full w-full object-cover"
			preload="metadata"
			use:setupVideo={video.playlist}
		>
			<track kind="captions" src="" srclang="en" label="English captions" default />
			<p class="p-4 text-center text-white">Loading video...</p>
		</video>
		<div class="bg-opacity-60 absolute top-2 left-2 rounded bg-black px-2 py-1 text-xs text-white">
			Video
		</div>
	</div>
{/if}

<!-- External links -->
{#if embed?.$type === 'app.bsky.embed.external#view' || embed?.external}
	{@const external = embed.external || embed}
	<a 
		href={external.uri} 
		target="_blank" 
		rel="noopener noreferrer"
		class="mt-3 block border border-base-300 rounded-lg overflow-hidden hover:bg-base-50 transition-colors"
	>
		{#if external.thumb}
			<img 
				src={external.thumb} 
				alt={external.title || 'Link preview'}
				class="w-full h-48 object-cover"
			/>
		{/if}
		<div class="p-3">
			<div class="text-sm font-semibold text-base-content line-clamp-2">
				{external.title || 'Untitled'}
			</div>
			{#if external.description}
				<div class="text-xs text-base-content/70 mt-1 line-clamp-2">
					{external.description}
				</div>
			{/if}
			<div class="text-xs text-blue-600 mt-2">
				{new URL(external.uri).hostname}
			</div>
		</div>
	</a>
{/if}
