<script lang="ts">
	import PostMedia from './PostMedia.svelte';

	// Props  
	export let quotedPost: any;
</script>

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
		<PostMedia embed={quotedPost.value.embed} />
	{/if}
	
	<!-- Quote post video (from embeds array) -->
	{#if quotedPost.embeds?.[0]?.$type === 'app.bsky.embed.video#view'}
		<PostMedia embed={quotedPost.embeds[0]} />
	{/if}
	
	<!-- Quote post external link (from embeds array) -->
	{#if quotedPost.embeds?.[0]?.$type === 'app.bsky.embed.external#view'}
		{@const external = quotedPost.embeds[0].external}
		<div class="mb-3 border border-gray-200 rounded-lg overflow-hidden">
			<img 
				src={external.thumb} 
				alt={external.title || 'Link preview'}
				class="w-full h-32 object-cover"
			/>
			<div class="p-3">
				<h4 class="font-semibold text-sm text-gray-900 mb-1">{external.title}</h4>
				{#if external.description}
					<p class="text-xs text-gray-600 mb-2">{external.description}</p>
				{/if}
				<a href={external.uri} target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 hover:underline">
					{external.uri}
				</a>
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