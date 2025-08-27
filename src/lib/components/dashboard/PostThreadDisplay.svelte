<script lang="ts" context="module">
	export interface ThreadPost {
		author: {
			handle: string;
			displayName?: string;
			avatar?: string;
		};
		record: {
			text: string;
		};
		embed?: any; // For embedded media (images, videos, etc.)
		indexedAt: string;
		replyCount?: number;
		repostCount?: number;
		likeCount?: number;
	}

	export interface ThreadReply {
		post: ThreadPost;
		replies?: ThreadReply[];
	}

	export interface ThreadData {
		post: ThreadPost;
		replies?: ThreadReply[];
	}

	export interface PostThreadDisplayProps {
		threadData: ThreadData;
	}
</script>

<script lang="ts">
	import { Icon, ChatBubbleOvalLeft, Heart, ArrowPath } from 'svelte-hero-icons';
	import PostMedia from '$lib/components/PostMedia.svelte';

	export let threadData: ThreadData;
</script>

<div class="card bg-base-100 border mb-6">
	<div class="card-body">
		<h3 class="card-title text-base mb-4">Post Thread</h3>
		
		<!-- Main thread post -->
		{#if threadData.post}
			<div class="border-l-4 border-primary pl-4 mb-4 bg-base-200 rounded-r-lg p-4">
				<div class="badge badge-primary badge-sm mb-2">THREAD ROOT</div>
				<div class="flex space-x-3">
					{#if threadData.post.author.avatar}
						<div class="avatar">
							<div class="w-12 h-12 rounded-full">
								<img src={threadData.post.author.avatar} alt="{threadData.post.author.displayName || threadData.post.author.handle}'s avatar" class="w-full h-full object-cover" />
							</div>
						</div>
					{:else}
						<div class="avatar placeholder">
							<div class="bg-neutral text-neutral-content w-12 h-12 rounded-full">
								<span>{(threadData.post.author.displayName || threadData.post.author.handle).charAt(0).toUpperCase()}</span>
							</div>
						</div>
					{/if}
					<div class="flex-1 min-w-0">
						<div class="flex items-center space-x-1 mb-1">
							<span class="font-semibold">{threadData.post.author.displayName || threadData.post.author.handle}</span>
							<span class="text-base-content/70">@{threadData.post.author.handle}</span>
							<span class="text-base-content/40">·</span>
							<span class="text-base-content/70 text-sm">
								{new Date(threadData.post.indexedAt).toLocaleDateString()}
							</span>
						</div>
						<div class="whitespace-pre-wrap break-words">
							{threadData.post.record.text}
						</div>
						
						<!-- Post media -->
						{#if threadData.post.embed}
							<PostMedia embed={threadData.post.embed} />
						{/if}
						
						<div class="flex items-center space-x-6 mt-3 text-base-content/70">
							<div class="flex items-center space-x-1 text-sm">
								<Icon src={ChatBubbleOvalLeft} class="w-4 h-4" />
								<span>{threadData.post.replyCount || 0}</span>
							</div>
							<div class="flex items-center space-x-1 text-sm">
								<Icon src={ArrowPath} class="w-4 h-4" />
								<span>{threadData.post.repostCount || 0}</span>
							</div>
							<div class="flex items-center space-x-1 text-sm">
								<Icon src={Heart} class="w-4 h-4" />
								<span>{threadData.post.likeCount || 0}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Thread replies -->
		{#if threadData.replies && threadData.replies.length > 0}
			<div class="space-y-4">
				<h4 class="font-semibold flex items-center space-x-2">
					<Icon src={ChatBubbleOvalLeft} class="w-4 h-4" />
					<span>Replies ({threadData.replies.length})</span>
				</h4>
				{#each threadData.replies.slice(0, 5) as reply, replyIndex}
					{#if reply.post}
						<div class="border-l-2 border-base-300 pl-4 ml-4 bg-base-100 rounded-r-lg p-3">
							<div class="flex space-x-3">
								{#if reply.post.author.avatar}
									<div class="avatar">
										<div class="w-10 h-10 rounded-full">
											<img src={reply.post.author.avatar} alt="{reply.post.author.displayName || reply.post.author.handle}'s avatar" class="w-full h-full object-cover" />
										</div>
									</div>
								{:else}
									<div class="avatar placeholder">
										<div class="bg-neutral text-neutral-content w-10 h-10 rounded-full">
											<span class="text-xs">{(reply.post.author.displayName || reply.post.author.handle).charAt(0).toUpperCase()}</span>
										</div>
									</div>
								{/if}
								<div class="flex-1 min-w-0">
									<div class="flex items-center space-x-1 mb-1">
										<span class="font-semibold text-sm">{reply.post.author.displayName || reply.post.author.handle}</span>
										<span class="text-base-content/70 text-sm">@{reply.post.author.handle}</span>
										<span class="text-base-content/40">·</span>
										<span class="text-base-content/70 text-xs">
											{new Date(reply.post.indexedAt).toLocaleDateString()}
										</span>
									</div>
									<div class="text-sm whitespace-pre-wrap break-words mb-2">
										{reply.post.record.text}
									</div>
									
									<!-- Reply media -->
									{#if reply.post.embed}
										<div class="mb-2">
											<PostMedia embed={reply.post.embed} />
										</div>
									{/if}
									
									<div class="flex items-center space-x-4 text-base-content/70">
										<div class="flex items-center space-x-1 text-xs">
											<Icon src={ChatBubbleOvalLeft} class="w-3 h-3" />
											<span>{reply.post.replyCount || 0}</span>
										</div>
										<div class="flex items-center space-x-1 text-xs">
											<Icon src={Heart} class="w-3 h-3" />
											<span>{reply.post.likeCount || 0}</span>
										</div>
									</div>
									
									<!-- Nested replies -->
									{#if reply.replies && reply.replies.length > 0}
										<div class="mt-3 space-y-2">
											{#each reply.replies.slice(0, 2) as nestedReply}
												{#if nestedReply.post}
													<div class="border-l border-base-300 pl-3 bg-base-200 rounded-r p-2">
														<div class="flex items-center space-x-2 text-xs">
															{#if nestedReply.post.author.avatar}
																<div class="avatar">
																	<div class="w-6 h-6 rounded-full">
																		<img src={nestedReply.post.author.avatar} alt="{nestedReply.post.author.displayName || nestedReply.post.author.handle}'s avatar" class="w-full h-full object-cover" />
																	</div>
																</div>
															{:else}
																<div class="avatar placeholder">
																	<div class="bg-neutral text-neutral-content w-6 h-6 rounded-full">
																		<span class="text-xs">{(nestedReply.post.author.displayName || nestedReply.post.author.handle).charAt(0).toUpperCase()}</span>
																	</div>
																</div>
															{/if}
															<span class="font-medium">{nestedReply.post.author.displayName || nestedReply.post.author.handle}</span>
														</div>
														<div class="text-xs mt-1 pl-8">{nestedReply.post.record.text}</div>
														{#if nestedReply.post.embed}
															<div class="mt-1 pl-8">
																<PostMedia embed={nestedReply.post.embed} />
															</div>
														{/if}
													</div>
												{/if}
											{/each}
											{#if reply.replies.length > 2}
												<div class="text-xs text-base-content/60 italic pl-3">... and {reply.replies.length - 2} more nested replies</div>
											{/if}
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				{/each}
				{#if threadData.replies.length > 5}
					<div class="text-center text-base-content/70 text-sm">
						Showing 5 of {threadData.replies.length} replies
					</div>
				{/if}
			</div>
		{:else}
			<div class="text-center text-base-content/70 italic">
				No replies in this thread
			</div>
		{/if}
	</div>
</div>