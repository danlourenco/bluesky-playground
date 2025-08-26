<script lang="ts">
	// Props
	export let author: any;
	export let timestamp: string;
</script>

<div class="flex items-center space-x-1">
	<span class="font-semibold text-gray-900">{author.displayName || author.handle}</span>
	<span class="text-gray-500">@{author.handle}</span>
	<span class="text-gray-400">·</span>
	<span class="text-gray-500 text-sm">
		{new Date(timestamp).toLocaleDateString()}
	</span>
</div>