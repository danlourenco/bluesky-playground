<script lang="ts">
	export let reply: any;
	export let parentPost: any;

	// Get thread context - show both root and immediate parent when available
	$: rootPost = reply?.root;
	$: immediateParent = parentPost;
	$: isReply = !!(reply?.parent || parentPost);
	$: hasRootContext = rootPost && rootPost.author;
	$: showImmediateParent = immediateParent && (!hasRootContext || immediateParent.author?.handle !== rootPost?.author?.handle);
</script>

{#if isReply}
	<!-- Thread container following Bluesky mobile pattern -->
	<div class="px-4 py-3 bg-base-50">
		
		{#if hasRootContext}
			<!-- Root post (original context) -->
			<div class="mb-3">
				<div class="flex space-x-3">
					<div class="avatar flex-shrink-0">
						<div class="w-10 h-10 rounded-full">
							<img 
								src={rootPost.author.avatar || 'https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=?'} 
								alt="{rootPost.author.displayName || rootPost.author.handle}'s avatar"
								class="object-cover"
							/>
						</div>
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center space-x-1 mb-1">
							<span class="font-bold text-sm">{rootPost.author.displayName || rootPost.author.handle}</span>
							<span class="text-base-content/60 text-sm">@{rootPost.author.handle}</span>
							<span class="text-base-content/40">·</span>
							<span class="text-base-content/60 text-xs">
								{new Date(rootPost.indexedAt || rootPost.record?.createdAt).toLocaleDateString()}
							</span>
						</div>
						<div class="text-sm text-base-content mb-2">
							{rootPost.record?.text || ''}
						</div>
						
						<!-- Root post media/embed -->
						{#if rootPost.embed}
							<div class="mb-2">
								{#await import('./PostMedia.svelte')}
									<div>Loading media...</div>
								{:then PostMediaModule}
									<svelte:component this={PostMediaModule.default} embed={rootPost.embed} />
								{/await}
							</div>
						{/if}
						
						<!-- Root quote post -->
						{#if rootPost.embed?.$type === 'app.bsky.embed.record#view' && rootPost.embed.record}
							{#await import('./PostQuote.svelte')}
								<div>Loading quote...</div>
							{:then PostQuoteModule}
								<svelte:component this={PostQuoteModule.default} quotedPost={rootPost.embed.record} />
							{/await}
						{/if}
					</div>
				</div>
			</div>
		{/if}
		
		{#if showImmediateParent}
			<!-- Immediate parent post (Amy's reply) -->
			<div class="mb-3 ml-3">
				<div class="flex space-x-3">
					<div class="avatar flex-shrink-0">
						<div class="w-8 h-8 rounded-full">
							<img 
								src={immediateParent.author.avatar || 'https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=?'} 
								alt="{immediateParent.author.displayName || immediateParent.author.handle}'s avatar"
								class="object-cover"
							/>
						</div>
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center space-x-1 mb-1">
							<span class="font-bold text-sm">{immediateParent.author.displayName || immediateParent.author.handle}</span>
							<span class="text-base-content/60 text-sm">@{immediateParent.author.handle}</span>
							<span class="text-base-content/40">·</span>
							<span class="text-base-content/60 text-xs">
								{new Date(immediateParent.indexedAt || immediateParent.record?.createdAt).toLocaleDateString()}
							</span>
						</div>
						<div class="text-sm text-base-content">
							{immediateParent.record?.text || ''}
						</div>
					</div>
				</div>
			</div>
		{/if}
		
	</div>
{/if}