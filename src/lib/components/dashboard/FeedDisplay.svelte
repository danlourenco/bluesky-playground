<script lang="ts" context="module">
	export interface FeedItem {
		post: any; // PostComponent expects this structure
	}

	export interface FeedDisplayProps {
		title: string;
		feedData: FeedItem[];
		copyPostJson?: (postData: any, postIndex?: string | number) => Promise<void>;
		showCopyButton?: boolean;
		showRepostIndicator?: boolean;
		maxItems?: number;
		copyButtonPrefix?: string;
	}
</script>

<script lang="ts">
	import PostComponent from '$lib/components/PostComponent.svelte';

	export let title: string;
	export let feedData: FeedItem[];
	export let copyPostJson: ((postData: any, postIndex?: string | number) => Promise<void>) | undefined = undefined;
	export let showCopyButton: boolean = true;
	export let showRepostIndicator: boolean = true;
	export let maxItems: number = 5;
	export let copyButtonPrefix: string = 'feed';
</script>

<div class="card bg-base-100 border mb-6">
	<div class="card-body p-0">
		<h3 class="text-lg font-semibold p-4 border-b">{title}</h3>
		<div class="divide-y">
			{#each feedData.slice(0, maxItems) as item, index}
				<PostComponent 
					post={item} 
					{showCopyButton}
					copyButtonId="{copyButtonPrefix}-{index}"
					{showRepostIndicator}
					{copyPostJson}
				/>
			{/each}
		</div>
		{#if feedData.length > maxItems}
			<div class="p-4 text-center text-base-content/70 border-t">
				Showing {maxItems} of {feedData.length} {title.toLowerCase()}
			</div>
		{/if}
	</div>
</div>