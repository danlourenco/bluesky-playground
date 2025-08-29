<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let feed: any[] = [];
	export let isScrolling = false;
	
	const dispatch = createEventDispatcher();
	
	let tableContainer: HTMLDivElement;
	let scrollInterval: NodeJS.Timeout;
	let scrollPosition = 0;
	let rows: any[] = [];
	let lastPreloadedIndex = -1;
	
	// Process feed into rows (filter out replies)
	$: {
		rows = feed.filter(item => !item.post.record?.reply).map((item, index) => ({
			...item,
			id: `row-${index}`,
			time: formatRowTime(index)
		}));
	}
	
	// Format time for each row (simulating TV schedule)
	function formatRowTime(index: number) {
		const baseTime = new Date();
		baseTime.setMinutes(Math.floor(baseTime.getMinutes() / 30) * 30, 0, 0);
		baseTime.setMinutes(baseTime.getMinutes() + (index * 30));
		
		return baseTime.toLocaleTimeString('en-US', { 
			hour: 'numeric', 
			minute: '2-digit',
			hour12: true 
		});
	}
	
	// Handle scrolling
	$: if (isScrolling) {
		startScrolling();
	} else {
		stopScrolling();
	}
	
	function startScrolling() {
		if (scrollInterval) return;
		
		scrollInterval = setInterval(() => {
			if (tableContainer) {
				scrollPosition += 1;
				tableContainer.scrollTop = scrollPosition;
				
				// Check for upcoming videos (preload when 3 rows away from view)
				checkForUpcomingVideos();
				
				// Reset when reaching bottom
				if (tableContainer.scrollTop >= tableContainer.scrollHeight - tableContainer.clientHeight) {
					scrollPosition = 0;
					lastPreloadedIndex = -1; // Reset preload tracking
				}
			}
		}, 50); // Smooth scrolling speed
	}
	
	function checkForUpcomingVideos() {
		if (!tableContainer) return;
		
		const containerHeight = tableContainer.clientHeight;
		const scrollTop = tableContainer.scrollTop;
		const rowHeight = 80; // Approximate row height
		const preloadOffset = rowHeight * 3; // Preload 3 rows ahead
		
		// Calculate which row index is about to come into view
		const upcomingRowIndex = Math.floor((scrollTop + containerHeight + preloadOffset) / rowHeight);
		
		if (upcomingRowIndex < rows.length && upcomingRowIndex > lastPreloadedIndex) {
			const upcomingRow = rows[upcomingRowIndex];
			
			// Check if this row has a video
			const hasVideo = upcomingRow.post.embed?.$type === 'app.bsky.embed.video#view' ||
							 upcomingRow.post.embed?.record?.record?.embeds?.[0]?.$type === 'app.bsky.embed.video#view';
			
			if (hasVideo) {
				dispatch('upcomingVideo', upcomingRow);
				lastPreloadedIndex = upcomingRowIndex;
			}
		}
	}
	
	function stopScrolling() {
		if (scrollInterval) {
			clearInterval(scrollInterval);
			scrollInterval = null;
		}
	}
	
	function handleRowClick(row: any) {
		// Check if row has video
		const hasVideo = row.post.embed?.$type === 'app.bsky.embed.video#view' ||
						 row.post.embed?.record?.record?.embeds?.[0]?.$type === 'app.bsky.embed.video#view';
		
		if (hasVideo) {
			dispatch('selectPost', row);
		}
	}
	
	onDestroy(() => {
		stopScrolling();
	});
	
	// Truncate text for display
	function truncateText(text: string, maxLength: number) {
		if (!text) return '';
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	}
</script>

<div class="tv-guide-table" bind:this={tableContainer}>
	<!-- Header -->
	<div class="table-header">
		<div class="header-time">TIME</div>
		<div class="header-channel">CHANNEL 37 - BLUESKY SOCIAL</div>
		<div class="header-program">PROGRAM INFO</div>
	</div>
	
	<!-- Scrolling Content -->
	<div class="table-body">
		{#each rows as row}
			<div 
				class="table-row {row.post.embed?.$type === 'app.bsky.embed.video#view' || 
								  row.post.embed?.record?.record?.embeds?.[0]?.$type === 'app.bsky.embed.video#view' ? 'has-video' : ''}"
				on:click={() => handleRowClick(row)}
				role="button"
				tabindex="0"
				on:keydown={(e) => e.key === 'Enter' && handleRowClick(row)}
			>
				<!-- Time Column -->
				<div class="time-cell">
					<span class="time-text">{row.time}</span>
				</div>
				
				<!-- Channel/Author Column -->
				<div class="channel-cell">
					<div class="author-name">{row.post.author.displayName || row.post.author.handle}</div>
					<div class="author-handle">@{row.post.author.handle}</div>
				</div>
				
				<!-- Program/Post Column -->
				<div class="program-cell">
					{#if row.post.embed?.$type === 'app.bsky.embed.video#view'}
						<span class="video-indicator">📹 VIDEO</span>
					{:else if row.post.embed?.record?.record?.embeds?.[0]?.$type === 'app.bsky.embed.video#view'}
						<span class="video-indicator">📹 QUOTE VIDEO</span>
					{:else if row.post.embed?.images}
						<span class="media-indicator">🖼️ IMAGE</span>
					{:else if row.post.embed?.$type === 'app.bsky.embed.record#view'}
						<span class="quote-indicator">💬 QUOTE</span>
					{/if}
					<div class="post-text">
						{truncateText(row.post.record?.text || '', 120)}
					</div>
				</div>
			</div>
		{/each}
		
		<!-- Duplicate rows for infinite scroll effect -->
		{#each rows as row}
			<div 
				class="table-row {row.post.embed?.$type === 'app.bsky.embed.video#view' || 
								  row.post.embed?.record?.record?.embeds?.[0]?.$type === 'app.bsky.embed.video#view' ? 'has-video' : ''}"
				on:click={() => handleRowClick(row)}
				role="button"
				tabindex="0"
				on:keydown={(e) => e.key === 'Enter' && handleRowClick(row)}
			>
				<div class="time-cell">
					<span class="time-text">{row.time}</span>
				</div>
				<div class="channel-cell">
					<div class="author-name">{row.post.author.displayName || row.post.author.handle}</div>
					<div class="author-handle">@{row.post.author.handle}</div>
				</div>
				<div class="program-cell">
					{#if row.post.embed?.$type === 'app.bsky.embed.video#view'}
						<span class="video-indicator">📹 VIDEO</span>
					{:else if row.post.embed?.record?.record?.embeds?.[0]?.$type === 'app.bsky.embed.video#view'}
						<span class="video-indicator">📹 QUOTE VIDEO</span>
					{:else if row.post.embed?.images}
						<span class="media-indicator">🖼️ IMAGE</span>
					{:else if row.post.embed?.$type === 'app.bsky.embed.record#view'}
						<span class="quote-indicator">💬 QUOTE</span>
					{/if}
					<div class="post-text">
						{truncateText(row.post.record?.text || '', 120)}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.tv-guide-table {
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		background: linear-gradient(180deg, #001a33 0%, #001122 100%);
		font-family: 'Courier New', monospace;
		position: relative;
		scrollbar-width: none;
	}
	
	.tv-guide-table::-webkit-scrollbar {
		display: none;
	}
	
	/* Header */
	.table-header {
		position: sticky;
		top: 0;
		z-index: 10;
		display: grid;
		grid-template-columns: 120px 300px 1fr;
		background: linear-gradient(180deg, #ffcc00 0%, #ff9900 100%);
		color: #001a33;
		font-weight: bold;
		border-bottom: 3px solid #003366;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	}
	
	.header-time,
	.header-channel,
	.header-program {
		padding: 1rem;
		border-right: 2px solid #003366;
		display: flex;
		align-items: center;
		font-size: 1.1rem;
		letter-spacing: 0.05em;
		text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
	}
	
	.header-program {
		border-right: none;
	}
	
	/* Table Body */
	.table-body {
		position: relative;
	}
	
	.table-row {
		display: grid;
		grid-template-columns: 120px 300px 1fr;
		min-height: 80px;
		border-bottom: 2px solid #003366;
		background: linear-gradient(180deg, rgba(0, 51, 102, 0.3) 0%, rgba(0, 51, 102, 0.1) 100%);
		transition: background 0.2s;
		cursor: default;
	}
	
	.table-row:nth-child(odd) {
		background: linear-gradient(180deg, rgba(0, 51, 102, 0.4) 0%, rgba(0, 51, 102, 0.2) 100%);
	}
	
	.table-row:hover {
		background: linear-gradient(180deg, rgba(255, 204, 0, 0.2) 0%, rgba(255, 204, 0, 0.1) 100%);
	}
	
	.table-row.has-video {
		cursor: pointer;
		background: linear-gradient(180deg, rgba(0, 102, 204, 0.3) 0%, rgba(0, 102, 204, 0.1) 100%);
	}
	
	.table-row.has-video:hover {
		background: linear-gradient(180deg, rgba(255, 204, 0, 0.3) 0%, rgba(255, 153, 0, 0.2) 100%);
		box-shadow: inset 0 0 20px rgba(255, 204, 0, 0.2);
	}
	
	/* Cells */
	.time-cell {
		padding: 1rem;
		border-right: 2px solid #003366;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 26, 51, 0.5);
	}
	
	.time-text {
		color: #ffcc00;
		font-weight: bold;
		font-size: 1rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
	}
	
	.channel-cell {
		padding: 1rem;
		border-right: 2px solid #003366;
		display: flex;
		flex-direction: column;
		justify-content: center;
		background: rgba(0, 26, 51, 0.3);
	}
	
	.author-name {
		color: #88ddff;
		font-weight: bold;
		font-size: 1rem;
		margin-bottom: 0.25rem;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
	}
	
	.author-handle {
		color: #6699cc;
		font-size: 0.85rem;
	}
	
	.program-cell {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: relative;
		background: rgba(0, 26, 51, 0.2);
	}
	
	.video-indicator,
	.media-indicator,
	.quote-indicator {
		position: absolute;
		top: 0.5rem;
		right: 1rem;
		background: rgba(255, 204, 0, 0.9);
		color: #001a33;
		padding: 0.2rem 0.5rem;
		border-radius: 3px;
		font-size: 0.75rem;
		font-weight: bold;
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
	}
	
	.video-indicator {
		background: rgba(255, 0, 0, 0.9);
		color: white;
		animation: pulse 2s infinite;
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 0.9; }
		50% { opacity: 1; }
	}
	
	.post-text {
		color: #ffffff;
		font-size: 0.95rem;
		line-height: 1.3;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
		max-width: 90%;
	}
</style>