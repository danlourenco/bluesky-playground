<script lang="ts">
	import type { PageData } from './$types';

	// The data from our server load function
	export let data: PageData;

	// List of available API demos
	const demos = [
		{ id: 'profile', name: 'Get Profile', description: 'Get your profile information' },
		{ id: 'timeline', name: 'Get Timeline', description: 'Get your home timeline feed' },
		{ id: 'author-feed', name: 'Get Author Feed', description: 'Get your own posts' },
		{ id: 'post-thread', name: 'Get Post Thread', description: 'Get a post and its replies' },
		{ id: 'likes', name: 'Get Likes', description: 'Get posts you have liked' },
		{ id: 'following', name: 'Get Following', description: 'Get users you follow' },
		{ id: 'followers', name: 'Get Followers', description: 'Get your followers' }
	];
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="bg-white shadow rounded-lg p-6 mb-8">
			<div class="flex justify-between items-center">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">Bluesky API Dashboard</h1>
					<p class="mt-1 text-sm text-gray-600">
						Logged in as: <code class="bg-gray-100 px-2 py-1 rounded">{data.user}</code>
					</p>
				</div>
				<a
					href="/auth/logout"
					class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
				>
					Logout
				</a>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- API Demo Selector -->
			<div class="lg:col-span-1">
				<div class="bg-white shadow rounded-lg p-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">API Demonstrations</h2>
					<p class="text-sm text-gray-600 mb-4">
						Click on any API below to see it in action. The response will appear on the right.
					</p>
					<div class="space-y-2">
						{#each demos as demo}
							<a
								href="/dashboard?demo={demo.id}"
								class="block p-3 rounded-md transition {data.demo === demo.id
									? 'bg-blue-100 border-2 border-blue-500'
									: 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'}"
							>
								<div class="font-medium text-gray-900">{demo.name}</div>
								<div class="text-sm text-gray-600">{demo.description}</div>
							</a>
						{/each}
					</div>
				</div>

				<!-- Info Box -->
				<div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-6">
					<h3 class="font-semibold text-blue-900 mb-2">How This Works</h3>
					<ul class="text-sm text-blue-800 space-y-1">
						<li>• OAuth tokens are stored server-side</li>
						<li>• Using basic 'atproto' scope (works for Profile)</li>
						<li>• Other APIs show educational scope requirements</li>
						<li>• All API calls happen on the server (SSR)</li>
						<li>• Sessions expire after 1 week</li>
					</ul>
				</div>
			</div>

			<!-- API Response Display -->
			<div class="lg:col-span-2">
				<div class="bg-white shadow rounded-lg p-6">
					<h2 class="text-lg font-semibold text-gray-900 mb-4">
						API Response: {demos.find(d => d.id === data.demo)?.name}
					</h2>

					{#if data.apiError}
						<!-- Error Display -->
						<div class="bg-red-50 border-2 border-red-200 rounded-md p-4">
							<h3 class="text-red-800 font-semibold mb-2">Error</h3>
							<p class="text-red-700">{data.apiError}</p>
						</div>
					{:else if data.apiData}
						<!-- Success Response -->
						<div class="bg-gray-50 rounded-md p-4">
							<div class="mb-4 text-sm text-gray-600">
								<span class="font-semibold">Response Type:</span>
								<code class="ml-2 bg-gray-200 px-2 py-1 rounded">
									{data.demo}
								</code>
							</div>
							
							<!-- API Explanation -->
							<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
								<h4 class="font-semibold text-blue-900 mb-2">📖 API Explanation: {demos.find(d => d.id === data.demo)?.name}</h4>
								<div class="text-sm text-blue-800">
									{#if data.demo === 'profile'}
										<p><strong>getProfile()</strong> - Retrieves detailed profile information for a user. This includes display name, bio, follower/following counts, avatar, and verification status. Works with any user's DID or handle.</p>
									{:else if data.demo === 'timeline'}
										<p><strong>getTimeline()</strong> - Your personalized home feed showing posts from accounts you follow, plus algorithmic recommendations. This is similar to Twitter's "For You" feed. Requires authentication and may need additional OAuth scopes.</p>
									{:else if data.demo === 'author-feed'}
										<p><strong>getAuthorFeed()</strong> - Shows posts and reposts by a specific user. This includes their original posts AND posts they've reposted/shared. That's why you might see posts from others - they're posts you reposted! Reposts appear with the original author but show your repost timestamp.</p>
									{:else if data.demo === 'post-thread'}
										<p><strong>getPostThread()</strong> - Retrieves a complete conversation thread starting from a specific post. Shows the original post, all replies, and nested reply chains. Useful for understanding full conversations.</p>
									{:else if data.demo === 'likes'}
										<p><strong>getActorLikes()</strong> - Shows posts that you (or the specified user) have liked/hearted. These are posts from other users that you've marked as favorites. The posts retain their original authors but are sorted by when you liked them.</p>
									{:else if data.demo === 'following'}
										<p><strong>getFollows()</strong> - Lists users that you are following. <span class="font-semibold">Note: This API is paginated!</span> It only returns 20 users per request (we show 8 here). Your actual total is in your profile data. To get all followers, you'd need multiple API calls with cursor pagination.</p>
									{:else if data.demo === 'followers'}
										<p><strong>getFollowers()</strong> - Lists users who follow you. <span class="font-semibold">Note: This API is paginated!</span> It only returns 20 users per request (we show 8 here). Your actual total is in your profile data. To get all followers, you'd need multiple API calls with cursor pagination.</p>
									{/if}
								</div>
							</div>

							<!-- Visual Feed Display -->
							{#if data.demo === 'profile' && data.apiData}
								<div class="bg-white rounded-lg border p-6 mb-6">
									<h3 class="text-lg font-semibold mb-4 text-gray-800">Profile Preview</h3>
									<div class="flex items-start space-x-4">
										<img 
											src={data.apiData.avatar || 'https://via.placeholder.com/64x64/e5e7eb/9ca3af?text=?'} 
											alt="{data.apiData.displayName || data.apiData.handle}'s avatar"
											class="w-16 h-16 rounded-full object-cover"
										/>
										<div class="flex-1">
											<div class="flex items-center space-x-2">
												<h4 class="text-xl font-bold text-gray-900">{data.apiData.displayName || data.apiData.handle}</h4>
												{#if data.apiData.displayName}
													<span class="text-gray-500">@{data.apiData.handle}</span>
												{/if}
											</div>
											{#if data.apiData.description}
												<p class="mt-2 text-gray-700">{data.apiData.description}</p>
											{/if}
											<div class="flex space-x-6 mt-3 text-sm text-gray-600">
												<div><span class="font-semibold text-gray-900">{data.apiData.followsCount || 0}</span> Following</div>
												<div><span class="font-semibold text-gray-900">{data.apiData.followersCount || 0}</span> Followers</div>
												<div><span class="font-semibold text-gray-900">{data.apiData.postsCount || 0}</span> Posts</div>
											</div>
										</div>
									</div>
								</div>
							{:else if (data.demo === 'timeline' || data.demo === 'author-feed') && data.apiData?.feed}
								<div class="bg-white rounded-lg border mb-6">
									<h3 class="text-lg font-semibold p-4 border-b text-gray-800">
										{data.demo === 'timeline' ? 'Timeline Feed' : 'Author Posts'}
									</h3>
									<div class="divide-y">
										{#each data.apiData.feed.slice(0, 5) as item}
											<div class="hover:bg-gray-50">
												<!-- Repost indicator -->
												{#if item.reason?.$type === 'app.bsky.feed.defs#reasonRepost'}
													<div class="p-4 pb-2">
														<div class="flex items-center space-x-2 text-gray-500 text-sm">
															<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
															</svg>
															<span>You reposted</span>
															<span class="text-xs">• {new Date(item.reason.indexedAt).toLocaleDateString()}</span>
														</div>
													</div>
												{/if}
												
												<!-- Parent post if this is a reply -->
												{#if item.post.record?.reply && item.parentPost}
													<div class="p-4 pb-2 border-l-2 border-gray-200 ml-4">
														<div class="flex space-x-3">
															<img 
																src={item.parentPost.author.avatar || 'https://via.placeholder.com/32x32/e5e7eb/9ca3af?text=?'} 
																alt="{item.parentPost.author.displayName || item.parentPost.author.handle}'s avatar"
																class="w-8 h-8 rounded-full object-cover flex-shrink-0"
															/>
															<div class="flex-1 min-w-0">
																<div class="flex items-center space-x-1 text-sm">
																	<span class="font-medium text-gray-700">{item.parentPost.author.displayName || item.parentPost.author.handle}</span>
																	<span class="text-gray-500">@{item.parentPost.author.handle}</span>
																	<span class="text-gray-400">·</span>
																	<span class="text-gray-500 text-xs">
																		{new Date(item.parentPost.indexedAt).toLocaleDateString()}
																	</span>
																</div>
																<div class="mt-1 text-gray-600 text-sm whitespace-pre-wrap break-words">
																	{item.parentPost.record.text}
																</div>
															</div>
														</div>
													</div>
												{/if}
												
												<!-- Current post (indented if it's a reply) -->
												<div class="p-4 {item.post.record?.reply ? 'pt-2' : ''}">
													<div class="flex space-x-3 {item.post.record?.reply ? 'ml-4' : ''}">
														<img 
															src={item.post.author.avatar || 'https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=?'} 
															alt="{item.post.author.displayName || item.post.author.handle}'s avatar"
															class="w-12 h-12 rounded-full object-cover flex-shrink-0"
														/>
														<div class="flex-1 min-w-0">
															<!-- Reply indicator (simplified) -->
															{#if item.post.record?.reply}
																<div class="flex items-center space-x-2 mb-1 text-gray-500 text-xs">
																	<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
																	</svg>
																	<span>Replying</span>
																</div>
															{/if}
														
														<div class="flex items-center space-x-1">
															<span class="font-semibold text-gray-900">{item.post.author.displayName || item.post.author.handle}</span>
															<span class="text-gray-500">@{item.post.author.handle}</span>
															<span class="text-gray-400">·</span>
															<span class="text-gray-500 text-sm">
																{new Date(item.post.indexedAt).toLocaleDateString()}
															</span>
														</div>
														<div class="mt-1 text-gray-800 whitespace-pre-wrap break-words">
															{item.post.record.text}
														</div>
														{#if item.post.embed?.images}
															<div class="mt-3 grid grid-cols-2 gap-2 max-w-md">
																{#each item.post.embed.images as image}
																	<img 
																		src={image.thumb} 
																		alt={image.alt || 'Post image'}
																		class="rounded-lg object-cover w-full h-32"
																	/>
																{/each}
															</div>
														{/if}
														<div class="flex items-center space-x-6 mt-3 text-gray-500">
															<div class="flex items-center space-x-2">
																<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
																</svg>
																<span class="text-sm">{item.post.replyCount || 0}</span>
															</div>
															<div class="flex items-center space-x-2">
																<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
																</svg>
																<span class="text-sm">{item.post.repostCount || 0}</span>
															</div>
															<div class="flex items-center space-x-2">
																<svg class="w-5 h-5 {item.post.viewer?.like ? 'text-red-500' : ''}" fill={item.post.viewer?.like ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
																</svg>
																<span class="text-sm {item.post.viewer?.like ? 'text-red-500' : ''}">{item.post.likeCount || 0}</span>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
										{/each}
									</div>
									{#if data.apiData.feed.length > 5}
										<div class="p-4 text-center text-gray-500 border-t">
											Showing 5 of {data.apiData.feed.length} posts
										</div>
									{/if}
								</div>
							{:else if (data.demo === 'following' || data.demo === 'followers') && data.apiData}
								<div class="bg-white rounded-lg border mb-6">
									<h3 class="text-lg font-semibold p-4 border-b text-gray-800">
										{data.demo === 'following' ? 'Following' : 'Followers'}
									</h3>
									<div class="divide-y">
										{#each (data.apiData.follows || data.apiData.followers || []).slice(0, 8) as user}
											<div class="p-4 hover:bg-gray-50">
												<div class="flex items-center space-x-3">
													<img 
														src={user.avatar || 'https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=?'} 
														alt="{user.displayName || user.handle}'s avatar"
														class="w-12 h-12 rounded-full object-cover"
													/>
													<div class="flex-1">
														<div class="flex items-center space-x-2">
															<span class="font-semibold text-gray-900">{user.displayName || user.handle}</span>
															<span class="text-gray-500">@{user.handle}</span>
														</div>
														{#if user.description}
															<p class="text-gray-600 text-sm mt-1 line-clamp-2">{user.description}</p>
														{/if}
													</div>
												</div>
											</div>
										{/each}
									</div>
									<div class="p-4 text-center text-gray-500 border-t space-y-1">
										<div>
											Showing 8 of {(data.apiData.follows || data.apiData.followers || []).length} users 
											<span class="text-xs">(from API response)</span>
										</div>
										{#if data.apiData.profileTotals}
											<div class="text-xs">
												{#if data.demo === 'following'}
													<strong>Actual total following: {data.apiData.profileTotals.followsCount}</strong>
												{:else}
													<strong>Actual total followers: {data.apiData.profileTotals.followersCount}</strong>
												{/if}
												<span class="italic">(from profile data)</span>
											</div>
										{/if}
									</div>
								</div>
							{:else if data.demo === 'post-thread' && data.apiData?.thread}
								<div class="bg-white rounded-lg border mb-6">
									<h3 class="text-lg font-semibold p-4 border-b text-gray-800">Post Thread</h3>
									<div class="p-4">
										<!-- Main thread post -->
										{#if data.apiData.thread.post}
											<div class="border-l-4 border-blue-500 pl-4 mb-4">
												<div class="flex space-x-3">
													<img 
														src={data.apiData.thread.post.author.avatar || 'https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=?'} 
														alt="{data.apiData.thread.post.author.displayName || data.apiData.thread.post.author.handle}'s avatar"
														class="w-12 h-12 rounded-full object-cover flex-shrink-0"
													/>
													<div class="flex-1 min-w-0">
														<div class="flex items-center space-x-2 mb-1">
															<div class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
																THREAD ROOT
															</div>
														</div>
														<div class="flex items-center space-x-1">
															<span class="font-semibold text-gray-900">{data.apiData.thread.post.author.displayName || data.apiData.thread.post.author.handle}</span>
															<span class="text-gray-500">@{data.apiData.thread.post.author.handle}</span>
															<span class="text-gray-400">·</span>
															<span class="text-gray-500 text-sm">
																{new Date(data.apiData.thread.post.indexedAt).toLocaleDateString()}
															</span>
														</div>
														<div class="mt-1 text-gray-800 whitespace-pre-wrap break-words">
															{data.apiData.thread.post.record.text}
														</div>
														{#if data.apiData.thread.post.embed?.images}
															<div class="mt-3 grid grid-cols-2 gap-2 max-w-md">
																{#each data.apiData.thread.post.embed.images as image}
																	<img 
																		src={image.thumb} 
																		alt={image.alt || 'Post image'}
																		class="rounded-lg object-cover w-full h-32"
																	/>
																{/each}
															</div>
														{/if}
														<div class="flex items-center space-x-6 mt-3 text-gray-500">
															<div class="flex items-center space-x-2">
																<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
																</svg>
																<span class="text-sm">{data.apiData.thread.post.replyCount || 0}</span>
															</div>
															<div class="flex items-center space-x-2">
																<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
																</svg>
																<span class="text-sm">{data.apiData.thread.post.repostCount || 0}</span>
															</div>
															<div class="flex items-center space-x-2">
																<svg class="w-5 h-5 {data.apiData.thread.post.viewer?.like ? 'text-red-500' : ''}" fill={data.apiData.thread.post.viewer?.like ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
																</svg>
																<span class="text-sm {data.apiData.thread.post.viewer?.like ? 'text-red-500' : ''}">{data.apiData.thread.post.likeCount || 0}</span>
															</div>
														</div>
													</div>
												</div>
											</div>
										{/if}

										<!-- Thread replies -->
										{#if data.apiData.thread.replies && data.apiData.thread.replies.length > 0}
											<div class="space-y-4">
												<h4 class="font-semibold text-gray-700 flex items-center space-x-2">
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
													</svg>
													<span>Replies ({data.apiData.thread.replies.length})</span>
												</h4>
												{#each data.apiData.thread.replies.slice(0, 5) as reply}
													{#if reply.post}
														<div class="border-l-2 border-gray-200 pl-4 ml-4">
															<div class="flex space-x-3">
																<img 
																	src={reply.post.author.avatar || 'https://via.placeholder.com/40x40/e5e7eb/9ca3af?text=?'} 
																	alt="{reply.post.author.displayName || reply.post.author.handle}'s avatar"
																	class="w-10 h-10 rounded-full object-cover flex-shrink-0"
																/>
																<div class="flex-1 min-w-0">
																	<div class="flex items-center space-x-1">
																		<span class="font-semibold text-gray-900">{reply.post.author.displayName || reply.post.author.handle}</span>
																		<span class="text-gray-500">@{reply.post.author.handle}</span>
																		<span class="text-gray-400">·</span>
																		<span class="text-gray-500 text-sm">
																			{new Date(reply.post.indexedAt).toLocaleDateString()}
																		</span>
																	</div>
																	<div class="mt-1 text-gray-800 text-sm whitespace-pre-wrap break-words">
																		{reply.post.record.text}
																	</div>
																	<div class="flex items-center space-x-4 mt-2 text-gray-500">
																		<div class="flex items-center space-x-1 text-xs">
																			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
																			</svg>
																			<span>{reply.post.replyCount || 0}</span>
																		</div>
																		<div class="flex items-center space-x-1 text-xs">
																			<svg class="w-4 h-4 {reply.post.viewer?.like ? 'text-red-500' : ''}" fill={reply.post.viewer?.like ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
																				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
																			</svg>
																			<span class="{reply.post.viewer?.like ? 'text-red-500' : ''}">{reply.post.likeCount || 0}</span>
																		</div>
																	</div>
																	
																	<!-- Nested replies if present -->
																	{#if reply.replies && reply.replies.length > 0}
																		<div class="mt-3 pl-4 border-l border-gray-100">
																			<div class="text-xs text-gray-500 mb-2">
																				└ {reply.replies.length} nested {reply.replies.length === 1 ? 'reply' : 'replies'}
																			</div>
																			{#each reply.replies.slice(0, 2) as nestedReply}
																				{#if nestedReply.post}
																					<div class="flex space-x-2 mb-2">
																						<img 
																							src={nestedReply.post.author.avatar || 'https://via.placeholder.com/24x24/e5e7eb/9ca3af?text=?'} 
																							alt="{nestedReply.post.author.displayName || nestedReply.post.author.handle}'s avatar"
																							class="w-6 h-6 rounded-full object-cover flex-shrink-0"
																						/>
																						<div class="flex-1">
																							<div class="text-xs">
																								<span class="font-medium">{nestedReply.post.author.displayName || nestedReply.post.author.handle}</span>
																								<span class="text-gray-500">@{nestedReply.post.author.handle}</span>
																							</div>
																							<div class="text-xs text-gray-700 mt-1">{nestedReply.post.record.text}</div>
																						</div>
																					</div>
																				{/if}
																			{/each}
																			{#if reply.replies.length > 2}
																				<div class="text-xs text-gray-500 italic">... and {reply.replies.length - 2} more nested replies</div>
																			{/if}
																		</div>
																	{/if}
																</div>
															</div>
														</div>
													{/if}
												{/each}
												{#if data.apiData.thread.replies.length > 5}
													<div class="text-center text-gray-500 text-sm">
														... and {data.apiData.thread.replies.length - 5} more replies
													</div>
												{/if}
											</div>
										{:else}
											<div class="text-gray-500 text-sm italic">No replies in this thread</div>
										{/if}
									</div>
								</div>
							{:else if data.demo === 'likes' && data.apiData?.feed}
								<div class="bg-white rounded-lg border mb-6">
									<h3 class="text-lg font-semibold p-4 border-b text-gray-800">Liked Posts</h3>
									<div class="divide-y">
										{#each data.apiData.feed.slice(0, 5) as item}
											<div class="p-4 hover:bg-gray-50">
												<div class="flex space-x-3">
													<img 
														src={item.post.author.avatar || 'https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=?'} 
														alt="{item.post.author.displayName || item.post.author.handle}'s avatar"
														class="w-12 h-12 rounded-full object-cover flex-shrink-0"
													/>
													<div class="flex-1 min-w-0">
														<!-- Reply indicator -->
														{#if item.post.record?.reply}
															<div class="flex items-center space-x-2 mb-2 text-gray-500 text-sm">
																<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
																</svg>
																<span>Replying to</span>
																{#if item.post.record.reply.parent.uri !== item.post.record.reply.root.uri}
																	<span class="text-blue-600 hover:underline cursor-pointer" title="Parent post: {item.post.record.reply.parent.uri}">thread</span>
																{:else}
																	<span class="text-blue-600 hover:underline cursor-pointer" title="Original post: {item.post.record.reply.parent.uri}">original post</span>
																{/if}
															</div>
														{/if}
														
														<div class="flex items-center space-x-1">
															<span class="font-semibold text-gray-900">{item.post.author.displayName || item.post.author.handle}</span>
															<span class="text-gray-500">@{item.post.author.handle}</span>
															<span class="text-gray-400">·</span>
															<span class="text-gray-500 text-sm">
																{new Date(item.post.indexedAt).toLocaleDateString()}
															</span>
														</div>
														<div class="mt-1 text-gray-800 whitespace-pre-wrap break-words">
															{item.post.record.text}
														</div>
														<div class="flex items-center space-x-2 mt-3 text-red-500">
															<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
																<path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
															</svg>
															<span class="text-sm">You liked this</span>
														</div>
													</div>
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Raw JSON Response (Collapsible) -->
							<details class="mb-4">
								<summary class="cursor-pointer text-sm font-semibold text-gray-700 mb-2 hover:text-gray-900">
									📄 View Raw JSON Response
								</summary>
								<div class="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto mt-2">
									<pre class="text-sm"><code>{JSON.stringify(data.apiData, null, 2)}</code></pre>
								</div>
							</details>

							<!-- Detailed Stats & Context -->
							{#if data.demo === 'timeline' && data.apiData?.feed}
								<div class="mt-4 p-3 bg-blue-50 rounded-md">
									<p class="text-sm text-blue-900 font-semibold mb-1">
										📊 Timeline Analysis ({data.apiData.feed.length} items)
									</p>
									{#if data.apiData.feed.length > 0}
										{@const reposts = data.apiData.feed.filter(item => item.reason?.$type === 'app.bsky.feed.defs#reasonRepost').length}
										{@const replies = data.apiData.feed.filter(item => item.post.record?.reply).length}
										{@const originalPosts = data.apiData.feed.length - reposts - replies}
										<div class="text-xs text-blue-800 space-y-1">
											<div>• Original posts: {originalPosts}</div>
											<div>• Reposts: {reposts} (posts you shared from others)</div>
											<div>• Replies: {replies} (your responses to other posts)</div>
										</div>
									{/if}
								</div>
							{:else if data.demo === 'author-feed' && data.apiData?.feed}
								<div class="mt-4 p-3 bg-blue-50 rounded-md">
									<p class="text-sm text-blue-900 font-semibold mb-1">
										📊 Author Feed Analysis ({data.apiData.feed.length} items)
									</p>
									{#if data.apiData.feed.length > 0}
										{@const reposts = data.apiData.feed.filter(item => item.reason?.$type === 'app.bsky.feed.defs#reasonRepost').length}
										{@const replies = data.apiData.feed.filter(item => item.post.record?.reply).length}
										{@const originalPosts = data.apiData.feed.length - reposts - replies}
										<div class="text-xs text-blue-800 space-y-1">
											<div>• Your original posts: {originalPosts}</div>
											<div>• Your reposts: {reposts} (why you see others' posts here!)</div>
											<div>• Your replies: {replies}</div>
											<div class="italic mt-2">Note: Author feeds include reposts, which is why you see posts from other users mixed in.</div>
										</div>
									{/if}
								</div>
							{:else if data.demo === 'likes' && data.apiData?.feed}
								<div class="mt-4 p-3 bg-blue-50 rounded-md">
									<p class="text-sm text-blue-900 font-semibold mb-1">
										❤️ Liked Posts ({data.apiData.feed.length} items)
									</p>
									<div class="text-xs text-blue-800">
										These are posts from other users that you've liked. They're sorted by when you liked them, not when they were originally posted.
									</div>
								</div>
							{:else if data.demo === 'following' && data.apiData?.follows}
								<div class="mt-4 p-3 bg-blue-50 rounded-md">
									<p class="text-sm text-blue-900 font-semibold mb-1">
										👥 Following Analysis
									</p>
									<div class="text-xs text-blue-800 space-y-1">
										<div>• API returned: {data.apiData.follows.length} users (limit: 20)</div>
										{#if data.apiData.profileTotals}
											<div>• <strong>Your actual total: {data.apiData.profileTotals.followsCount} following</strong></div>
											<div class="italic">The difference shows this API is paginated - you'd need {Math.ceil(data.apiData.profileTotals.followsCount / 20)} API calls to get everyone.</div>
										{/if}
									</div>
								</div>
							{:else if data.demo === 'followers' && data.apiData?.followers}
								<div class="mt-4 p-3 bg-blue-50 rounded-md">
									<p class="text-sm text-blue-900 font-semibold mb-1">
										👤 Followers Analysis
									</p>
									<div class="text-xs text-blue-800 space-y-1">
										<div>• API returned: {data.apiData.followers.length} users (limit: 20)</div>
										{#if data.apiData.profileTotals}
											<div>• <strong>Your actual total: {data.apiData.profileTotals.followersCount} followers</strong></div>
											<div class="italic">The difference shows this API is paginated - you'd need {Math.ceil(data.apiData.profileTotals.followersCount / 20)} API calls to get everyone.</div>
										{/if}
									</div>
								</div>
							{:else if data.demo === 'profile' && data.apiData}
								<div class="mt-4 p-3 bg-blue-50 rounded-md">
									<p class="text-sm text-blue-900 font-semibold mb-1">
										👤 Profile Data
									</p>
									<div class="text-xs text-blue-800">
										This shows your complete profile information as stored on the AT Protocol network, including metadata and verification status.
									</div>
								</div>
							{:else if data.demo === 'post-thread' && data.apiData}
								<div class="mt-4 p-3 bg-blue-50 rounded-md">
									<p class="text-sm text-blue-900 font-semibold mb-1">
										🧵 Thread Analysis
									</p>
									<div class="text-xs text-blue-800">
										Shows the complete conversation thread, including the original post and all reply chains. Useful for understanding full conversations.
									</div>
								</div>
							{/if}
						</div>
					{:else}
						<!-- Loading State (shouldn't happen with SSR, but good to have) -->
						<div class="text-gray-500">Loading...</div>
					{/if}
				</div>

				<!-- API Documentation Links -->
				<div class="bg-gray-50 rounded-lg p-4 mt-6">
					<h3 class="font-semibold text-gray-900 mb-2">Learn More</h3>
					<ul class="text-sm space-y-1">
						<li>
							<a 
								href="https://docs.bsky.app/" 
								target="_blank" 
								class="text-blue-600 hover:text-blue-800"
							>
								Bluesky API Documentation →
							</a>
						</li>
						<li>
							<a 
								href="https://github.com/bluesky-social/atproto" 
								target="_blank"
								class="text-blue-600 hover:text-blue-800"
							>
								AT Protocol GitHub →
							</a>
						</li>
						<li>
							<a 
								href="https://atproto.com/" 
								target="_blank"
								class="text-blue-600 hover:text-blue-800"
							>
								AT Protocol Specification →
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>