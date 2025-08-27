<script lang="ts">
	import PostHeader from './PostHeader.svelte';
	import PostMedia from './PostMedia.svelte';
	import PostQuote from './PostQuote.svelte';
	import PostEngagement from './PostEngagement.svelte';
	import PostRepostIndicator from './PostRepostIndicator.svelte';
	import PostReplyIndicator from './PostReplyIndicator.svelte';
	import PostReplyText from './PostReplyText.svelte';

	// Props
	export let post: any;
	export let showCopyButton = true;
	export let copyButtonId = 'copy-btn';
	export let showRepostIndicator = true;
	export let showReplyIndicator = true;

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
	{#if showRepostIndicator}
		<PostRepostIndicator reason={post.reason} />
	{/if}
	
	<!-- Reply indicator -->
	{#if showReplyIndicator}
		<PostReplyIndicator 
			reply={post.post?.record?.reply || post.reply} 
			parentPost={post.parentPost || post.reply?.parent}
		/>
	{/if}
	
	<!-- Main post content -->
	<div class="p-4 {showRepostIndicator && post.reason?.$type === 'app.bsky.feed.defs#reasonRepost' ? 'pt-0' : ''} {showReplyIndicator && (post.post?.record?.reply || post.reply?.parent || post.parentPost) ? 'pt-2 ml-16' : ''}">
		<div class="flex space-x-3">
			<img 
				src={post.post.author.avatar || 'https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=?'} 
				alt="{post.post.author.displayName || post.post.author.handle}'s avatar"
				class="w-12 h-12 rounded-full object-cover flex-shrink-0"
			/>
			<div class="flex-1 min-w-0">
				<PostHeader 
					author={post.post.author}
					timestamp={post.post.indexedAt || post.post.record?.createdAt || Date.now()}
				/>
				
				<!-- Reply text indicator -->
				{#if showReplyIndicator}
					<PostReplyText 
						reply={post.post?.record?.reply || post.reply} 
						parentPost={post.parentPost || post.reply?.parent}
					/>
				{/if}
				
				<div class="mt-1 text-gray-800 whitespace-pre-wrap break-words">
					{post.post.record?.text || ''}
				</div>
				
				<!-- Post media -->
				<PostMedia embed={post.post.embed} />
				
				<!-- Quote post -->
				{#if post.post.embed?.$type === 'app.bsky.embed.record#view' && post.post.embed.record}
					<PostQuote quotedPost={post.post.embed.record} />
				{/if}
				
				<!-- Engagement stats -->
				<PostEngagement post={post.post} />
			</div>
		</div>
	</div>
</div>