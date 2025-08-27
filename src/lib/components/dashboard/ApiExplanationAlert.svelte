<script lang="ts" context="module">
	export interface ApiExplanationAlertProps {
		currentDemo: string;
	}
</script>

<script lang="ts">
	import { Icon, InformationCircle } from 'svelte-hero-icons';

	export let currentDemo: string;
</script>

<div class="alert alert-info mb-4">
	<Icon src={InformationCircle} class="w-6 h-6" />
	<div>
		<div class="text-xs">
			{#if currentDemo === 'profile'}
				<p><strong>getProfile()</strong> - Retrieves detailed profile information for a user. This includes display name, bio, follower/following counts, avatar, and verification status. Works with any user's DID or handle.</p>
			{:else if currentDemo === 'timeline'}
				<p><strong>getTimeline()</strong> - Your personalized home feed showing posts from accounts you follow, plus algorithmic recommendations. This is similar to Twitter's "For You" feed. Requires authentication and may need additional OAuth scopes.</p>
			{:else if currentDemo === 'author-feed'}
				<p><strong>getAuthorFeed()</strong> - Shows posts and reposts by a specific user. This includes their original posts AND posts they've reposted/shared. That's why you might see posts from others - they're posts you reposted! Reposts appear with the original author but show your repost timestamp.</p>
			{:else if currentDemo === 'post-thread'}
				<p><strong>getPostThread()</strong> - Retrieves a complete conversation thread starting from a specific post. Shows the original post, all replies, and nested reply chains. Useful for understanding full conversations.</p>
			{:else if currentDemo === 'likes'}
				<p><strong>getActorLikes()</strong> - Shows posts that you (or the specified user) have liked/hearted. These are posts from other users that you've marked as favorites. The posts retain their original authors but are sorted by when you liked them.</p>
			{:else if currentDemo === 'following'}
				<p><strong>getFollows()</strong> - Lists users that you are following. <span class="font-semibold">Note: This API is paginated!</span> It only returns 20 users per request (we show 8 here). Your actual total is in your profile data. To get all followers, you'd need multiple API calls with cursor pagination.</p>
			{:else if currentDemo === 'followers'}
				<p><strong>getFollowers()</strong> - Lists users who follow you. <span class="font-semibold">Note: This API is paginated!</span> It only returns 20 users per request (we show 8 here). Your actual total is in your profile data. To get all followers, you'd need multiple API calls with cursor pagination.</p>
			{/if}
		</div>
	</div>
</div>