<script lang="ts">
	import PostHeader from './PostHeader.svelte';
	import PostEngagement from './PostEngagement.svelte';

	export let reply: any;
	export let parentPost: any;

	// Get the parent post data
	$: parentAuthor = parentPost?.author || reply?.parent?.author;
	$: parentText = parentPost?.record?.text || reply?.parent?.record?.text;
	$: parentTimestamp = parentPost?.indexedAt || reply?.parent?.indexedAt;
	$: parentStats = parentPost || reply?.parent;
	$: isReply = !!(reply?.parent || parentPost);
</script>

{#if isReply && parentAuthor}
	<!-- Parent post in thread container -->
	<div class="border border-base-300 rounded-lg bg-base-50 p-4">
		<div class="flex space-x-3">
			<img 
				src={parentAuthor.avatar || 'https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=?'} 
				alt="{parentAuthor.displayName || parentAuthor.handle}'s avatar"
				class="w-10 h-10 rounded-full object-cover"
			/>
			<div class="flex-1 min-w-0">
				<div class="flex items-center space-x-1 mb-1">
					<span class="font-semibold text-sm">{parentAuthor.displayName || parentAuthor.handle}</span>
					<span class="text-base-content/70 text-sm">@{parentAuthor.handle}</span>
					<span class="text-base-content/40">·</span>
					<span class="text-base-content/70 text-xs">
						{new Date(parentTimestamp || Date.now()).toLocaleDateString()}
					</span>
				</div>
				{#if parentText}
					<div class="text-sm text-base-content/90 whitespace-pre-wrap break-words mb-2">
						{parentText}
					</div>
				{/if}
				<!-- Minimal parent stats -->
				<div class="flex items-center space-x-4 text-xs text-base-content/60">
					<span>{parentStats?.replyCount || 0} replies</span>
					<span>{parentStats?.likeCount || 0} likes</span>
				</div>
			</div>
		</div>
	</div>
{/if}