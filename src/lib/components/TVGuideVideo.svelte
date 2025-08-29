<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import Hls from 'hls.js';
	
	export let video: any;
	
	let videoElement: HTMLVideoElement;
	const dispatch = createEventDispatcher();
	let hls: Hls | null = null;
	
	$: if (video && videoElement) {
		setupVideo();
	}
	
	function setupVideo() {
		// Clean up previous instance
		if (hls) {
			hls.destroy();
		}
		
		const playlistUrl = video.playlist;
		
		// Add event listener for video end
		if (videoElement) {
			videoElement.addEventListener('ended', handleVideoEnd);
		}
		
		if (Hls.isSupported() && playlistUrl) {
			hls = new Hls({
				debug: false,
				enableWorker: false,
				maxBufferLength: 10,
				maxMaxBufferLength: 30
			});
			
			hls.loadSource(playlistUrl);
			hls.attachMedia(videoElement);
			
			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				videoElement.play().catch(e => {
					console.log('Autoplay prevented:', e);
				});
			});
			
			hls.on(Hls.Events.ERROR, (event, data) => {
				console.error('HLS error:', event, data);
				if (data.fatal) {
					// Try direct playback as fallback
					videoElement.src = playlistUrl;
					videoElement.play().catch(e => {
						console.log('Fallback play failed:', e);
					});
				}
			});
		} else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
			// Native HLS support (Safari)
			videoElement.src = playlistUrl;
			videoElement.play().catch(e => {
				console.log('Native play failed:', e);
			});
		} else {
			// Direct playback attempt
			videoElement.src = playlistUrl;
			videoElement.play().catch(e => {
				console.log('Direct play failed:', e);
			});
		}
	}
	
	function handleVideoEnd() {
		// Dispatch event to parent to return to placeholder
		dispatch('videoEnded');
	}
	
	onDestroy(() => {
		if (hls) {
			hls.destroy();
		}
	});
</script>

<div class="tv-video-container">
	<video
		bind:this={videoElement}
		controls
		autoplay
		poster={video.thumbnail}
		class="tv-video"
	>
		<track kind="captions" src="" srclang="en" label="English captions" default />
		<p class="fallback-text">Your browser doesn't support video playback</p>
	</video>
	
	<!-- TV-style overlay effects -->
	<div class="tv-overlay">
		<div class="scanlines"></div>
		<div class="tv-corner tl">◢</div>
		<div class="tv-corner tr">◣</div>
		<div class="tv-corner bl">◥</div>
		<div class="tv-corner br">◤</div>
	</div>
	
	<!-- Live indicator -->
	<div class="live-indicator">
		<span class="live-dot"></span>
		<span class="live-text">LIVE</span>
	</div>
</div>

<style>
	.tv-video-container {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #000;
		overflow: hidden;
	}
	
	.tv-video {
		width: 100%;
		height: 100%;
		object-fit: contain;
		background: #000;
	}
	
	.fallback-text {
		color: #ffcc00;
		text-align: center;
		padding: 2rem;
	}
	
	/* TV Overlay Effects */
	.tv-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 2;
	}
	
	.scanlines {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: repeating-linear-gradient(
			0deg,
			rgba(0, 0, 0, 0.15),
			rgba(0, 0, 0, 0.15) 1px,
			transparent 1px,
			transparent 2px
		);
		animation: scanline 8s linear infinite;
		opacity: 0.3;
	}
	
	@keyframes scanline {
		0% { transform: translateY(0); }
		100% { transform: translateY(10px); }
	}
	
	/* Curved TV corners */
	.tv-corner {
		position: absolute;
		font-size: 2rem;
		color: rgba(255, 204, 0, 0.2);
		text-shadow: 0 0 10px rgba(255, 204, 0, 0.5);
	}
	
	.tv-corner.tl {
		top: 0;
		left: 0;
	}
	
	.tv-corner.tr {
		top: 0;
		right: 0;
	}
	
	.tv-corner.bl {
		bottom: 0;
		left: 0;
	}
	
	.tv-corner.br {
		bottom: 0;
		right: 0;
	}
	
	/* Live Indicator */
	.live-indicator {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(255, 0, 0, 0.9);
		padding: 0.5rem 1rem;
		border-radius: 4px;
		z-index: 3;
		box-shadow: 0 2px 10px rgba(255, 0, 0, 0.5);
	}
	
	.live-dot {
		width: 10px;
		height: 10px;
		background: white;
		border-radius: 50%;
		animation: live-pulse 1.5s infinite;
	}
	
	@keyframes live-pulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(1.2); }
	}
	
	.live-text {
		color: white;
		font-weight: bold;
		font-size: 0.9rem;
		letter-spacing: 0.1em;
		font-family: 'Courier New', monospace;
	}
</style>