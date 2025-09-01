<script lang="ts">
	export let external: {
		uri: string;
		title?: string;
		description?: string;
		thumb?: string;
	};
	
	$: hostname = (() => {
		try {
			return new URL(external.uri).hostname;
		} catch (e) {
			console.error('Invalid URL:', external.uri, e);
			return external.uri;
		}
	})();
</script>

<a 
	href={external.uri} 
	target="_blank" 
	rel="noopener noreferrer"
	class="mt-3 block border border-base-300 rounded-lg overflow-hidden hover:bg-base-50 transition-colors"
>
	{#if external.thumb}
		<img 
			src={external.thumb} 
			alt={external.title || 'Link preview'}
			class="w-full h-48 object-cover"
		/>
	{/if}
	<div class="p-3">
		<div class="text-sm font-semibold text-base-content line-clamp-2">
			{external.title || 'Untitled'}
		</div>
		{#if external.description}
			<div class="text-xs text-base-content/70 mt-1 line-clamp-2">
				{external.description}
			</div>
		{/if}
		<div class="text-xs text-blue-600 mt-2">
			{hostname}
		</div>
	</div>
</a>