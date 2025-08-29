<script lang="ts">
	import { Icon, ChatBubbleOvalLeftEllipsis } from 'svelte-hero-icons';

	export let reply: any;
	export let parentPost: any;

	// Get the parent author
	$: parentAuthor = parentPost?.author || reply?.parent?.author;
	$: isReply = !!(reply?.parent || parentPost);
</script>

{#if isReply && parentAuthor}
	<div class="flex items-center space-x-1 text-xs text-base-content/60 mb-2">
		<Icon src={ChatBubbleOvalLeftEllipsis} class="w-3 h-3" />
		<span>Replying to</span>
		<span class="text-blue-600">@{parentAuthor.handle}</span>
	</div>
{/if}