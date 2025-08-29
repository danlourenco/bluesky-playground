<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import TVGuideTable from '$lib/components/TVGuideTable.svelte';
	import TVGuideVideo from '$lib/components/TVGuideVideo.svelte';
	
	export let data: PageData;
	
	let currentTime = new Date();
	let timeInterval: NodeJS.Timeout;
	let isScrolling = true; // Auto-start scrolling
	let currentVideo: any = null;
	let currentPost: any = null;
	let isManualSelection = false; // Track if user manually selected a video
	
	// Update time every second for authentic TV Guide feel
	onMount(() => {
		timeInterval = setInterval(() => {
			currentTime = new Date();
		}, 1000);
	});
	
	onDestroy(() => {
		if (timeInterval) clearInterval(timeInterval);
	});
	
	// Format time like classic TV Guide
	function formatTime(date: Date) {
		return date.toLocaleTimeString('en-US', { 
			hour: 'numeric', 
			minute: '2-digit',
			hour12: true 
		});
	}
	
	function formatDate(date: Date) {
		return date.toLocaleDateString('en-US', { 
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		});
	}
	
	function toggleScroll() {
		isScrolling = !isScrolling;
	}
	
	function handleVideoSelect(post: any, isManual = false) {
		// If there's a manual selection in progress, don't override with auto-preload
		if (isManualSelection && !isManual) {
			return;
		}
		
		if (isManual) {
			isManualSelection = true;
		}
		
		currentPost = post;
		// Find video in the post
		if (post.post.embed?.$type === 'app.bsky.embed.video#view') {
			currentVideo = post.post.embed;
		} else if (post.post.embed?.record?.record?.embeds?.[0]?.$type === 'app.bsky.embed.video#view') {
			currentVideo = post.post.embed.record.record.embeds[0];
		} else {
			currentVideo = null;
		}
	}
	
	// Handle automatic video preloading from table
	function handleUpcomingVideo(event: CustomEvent) {
		handleVideoSelect(event.detail);
	}
	
	function handleVideoEnded() {
		// Clear current video and post to return to placeholder
		currentVideo = null;
		currentPost = null;
		isManualSelection = false; // Reset manual selection flag
	}
	
</script>

<div class="tv-guide-container">
	<!-- Upper Section: Video/Ad Area -->
	<div class="upper-section">
		<!-- Left: Video Player -->
		<div class="video-section">
			{#if currentVideo}
				<TVGuideVideo video={currentVideo} on:videoEnded={handleVideoEnded} />
			{:else}
				<div class="placeholder-video">
					<div class="static-noise"></div>
					<div class="channel-info">
						<h2>BLUESKY</h2>
						<p>Social Feed Channel</p>
						<p class="blink">Select a video post to play</p>
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Right: Info Panel -->
		<div class="info-section">
			<div class="branding">
				<h1>Prevue Channel</h1>
				<p class="tagline">Your Social Media Guide</p>
			</div>
			
			<div class="current-info">
				{#if currentPost}
					<div class="post-info">
						<h3>{currentPost.post.author.displayName || currentPost.post.author.handle}</h3>
						<p class="handle">@{currentPost.post.author.handle}</p>
						{#if currentPost.post.record?.text}
							<p class="post-text">{currentPost.post.record.text}</p>
						{/if}
					</div>
				{:else}
					<div class="instructions">
						<p>Welcome to Bluesky TV Guide</p>
						<p class="sub">Your timeline, retro style</p>
						<p class="auto-info">Videos will appear automatically as they scroll</p>
					</div>
				{/if}
			</div>
			
			<!-- Always show scroll control button -->
			<div class="scroll-controls">
				<button 
					class="start-button"
					on:click={toggleScroll}
				>
					{isScrolling ? 'PAUSE SCROLLING' : 'RESUME SCROLLING'}
				</button>
			</div>
			
			<div class="datetime">
				<div class="time">{formatTime(currentTime)}</div>
				<div class="date">{formatDate(currentTime)}</div>
			</div>
		</div>
	</div>
	
	<!-- Lower Section: Scrolling Table -->
	<div class="lower-section">
		<TVGuideTable 
			feed={data.initialFeed}
			{isScrolling}
			on:selectPost={(e) => handleVideoSelect(e.detail, true)}
			on:upcomingVideo={handleUpcomingVideo}
		/>
	</div>
</div>

<style>
	.tv-guide-container {
		height: 100vh;
		width: 100vw;
		margin: 0;
		padding: 0;
		overflow: hidden;
		background: linear-gradient(180deg, #001a4d 0%, #003366 100%);
		display: flex;
		flex-direction: column;
		font-family: 'Courier New', monospace;
		position: fixed;
		top: 0;
		left: 0;
	}
	
	/* Upper Section - 40% height */
	.upper-section {
		height: 40vh;
		display: grid;
		grid-template-columns: 60% 40%;
		background: linear-gradient(180deg, #003366 0%, #004080 100%);
		border-bottom: 4px solid #ffcc00;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
	}
	
	/* Video Section */
	.video-section {
		background: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		border-right: 3px solid #ffcc00;
		position: relative;
		overflow: hidden;
	}
	
	.placeholder-video {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		background: #111;
	}
	
	.static-noise {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: 
			repeating-linear-gradient(
				0deg,
				rgba(255, 255, 255, 0.03) 0px,
				transparent 1px,
				transparent 2px,
				rgba(255, 255, 255, 0.03) 3px
			);
		animation: static 0.2s steps(10) infinite;
		pointer-events: none;
	}
	
	@keyframes static {
		0% { transform: translateY(0); }
		100% { transform: translateY(10px); }
	}
	
	.channel-info {
		text-align: center;
		color: #ffcc00;
		z-index: 1;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
	}
	
	.channel-info h2 {
		font-size: 3rem;
		margin: 0;
		font-weight: bold;
		letter-spacing: 0.2em;
	}
	
	.channel-info p {
		font-size: 1.2rem;
		margin: 0.5rem 0;
	}
	
	.blink {
		animation: blink 1s infinite;
	}
	
	@keyframes blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0; }
	}
	
	/* Info Section */
	.info-section {
		background: linear-gradient(135deg, #004080 0%, #003366 100%);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		color: white;
	}
	
	.branding h1 {
		font-size: 2.5rem;
		margin: 0;
		color: #ffcc00;
		text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.7);
		font-weight: bold;
		letter-spacing: 0.05em;
	}
	
	.tagline {
		font-size: 1rem;
		color: #88ddff;
		margin: 0.5rem 0 0 0;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
	
	.current-info {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		margin: 1rem 0;
	}
	
	.post-info h3 {
		color: #ffcc00;
		margin: 0 0 0.5rem 0;
		font-size: 1.4rem;
	}
	
	.handle {
		color: #88ddff;
		font-size: 0.9rem;
		margin: 0 0 1rem 0;
	}
	
	.post-text {
		color: white;
		font-size: 0.95rem;
		line-height: 1.4;
		max-height: 100px;
		overflow-y: auto;
	}
	
	.instructions {
		text-align: center;
	}
	
	.instructions p {
		margin: 0.5rem 0;
		font-size: 1.2rem;
		color: #ffcc00;
	}
	
	.instructions .sub {
		font-size: 0.9rem;
		color: #88ddff;
		margin-bottom: 0.5rem;
	}
	
	.auto-info {
		font-size: 0.8rem;
		color: #66ccaa;
		margin-bottom: 1.5rem;
		font-style: italic;
	}
	
	.start-button {
		background: linear-gradient(180deg, #ffcc00 0%, #ff9900 100%);
		color: #003366;
		border: none;
		padding: 1rem 2rem;
		font-size: 1.2rem;
		font-weight: bold;
		font-family: inherit;
		cursor: pointer;
		border-radius: 4px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
		transition: transform 0.2s;
	}
	
	.start-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 8px rgba(0, 0, 0, 0.4);
	}
	
	.start-button:active {
		transform: translateY(0);
	}
	
	.scroll-controls {
		text-align: center;
		margin: 1rem 0;
	}
	
	.datetime {
		text-align: center;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.4);
		border-radius: 8px;
	}
	
	.time {
		font-size: 2rem;
		color: #ffcc00;
		font-weight: bold;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
	}
	
	.date {
		font-size: 1rem;
		color: #88ddff;
		margin-top: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
	
	/* Lower Section - 60% height */
	.lower-section {
		height: 60vh;
		background: #001a33;
		overflow: hidden;
	}
</style>