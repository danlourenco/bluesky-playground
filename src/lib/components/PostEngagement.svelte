<script lang="ts">
	// Props
	export let post: any;
</script>

<div class="flex items-center space-x-6 mt-3 text-gray-500">
	<div class="flex items-center space-x-2">
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
		</svg>
		<span class="text-sm">{post.replyCount || 0}</span>
	</div>
	<div class="flex items-center space-x-2">
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
		</svg>
		<span class="text-sm">{post.repostCount || 0}</span>
	</div>
	<div class="flex items-center space-x-2">
		<svg class="w-5 h-5 {post.viewer?.like ? 'text-red-500' : ''}" fill={post.viewer?.like ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
		</svg>
		<span class="text-sm {post.viewer?.like ? 'text-red-500' : ''}">{post.likeCount || 0}</span>
	</div>
</div>