<script lang="ts" context="module">
	export interface ApiDemo {
		id: string;
		name: string;
		description: string;
	}

	export interface ApiResponseDisplayProps {
		demos: ApiDemo[];
		currentDemo?: string;
		apiData?: any;
		apiError?: string;
		copyPostJson: (postData: any, postIndex?: string | number) => Promise<void>;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { page } from '$app/stores';
	import ProfileDisplay from './ProfileDisplay.svelte';
	import PostThreadDisplay from './PostThreadDisplay.svelte';
	import FeedDisplay from './FeedDisplay.svelte';
	import UserListDisplay from './UserListDisplay.svelte';
	import ApiExplanationAlert from './ApiExplanationAlert.svelte';
	import { Icon, ExclamationTriangle, ArrowLeft } from 'svelte-hero-icons';

	export let demos: ApiDemo[];
	export let currentDemo: string = '';
	export let apiData: any = null;
	export let apiError: string = '';
	export let copyPostJson: (postData: any, postIndex?: string | number) => Promise<void>;

	$: currentDemoName = demos.find(d => d.id === currentDemo)?.name || 'Unknown';
	
	// Track loading state
	let isLoading = false;
	let previousDemo = currentDemo;
	
	// Watch for demo changes to show loading state
	$: if (currentDemo !== previousDemo) {
		previousDemo = currentDemo;
		// Show loading for a brief moment to indicate change
		isLoading = true;
		setTimeout(() => {
			isLoading = false;
		}, 150);
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title text-lg">
			API Response: {currentDemoName}
		</h2>

		{#if isLoading}
			<!-- Loading State -->
			<div class="flex items-center justify-center py-8" in:fade={{ duration: 200 }}>
				<div class="loading loading-spinner loading-md"></div>
				<span class="ml-2">Loading {currentDemoName}...</span>
			</div>
		{:else if apiError}
			<!-- Error Display -->
			<div class="alert alert-error" in:fade={{ duration: 300 }}>
				<Icon src={ExclamationTriangle} class="w-6 h-6" />
				<div>
					<h3 class="font-bold">Error</h3>
					<div class="text-xs">{apiError}</div>
				</div>
			</div>
		{:else if apiData}
			<!-- Success Response -->
			<div class="bg-base-200 rounded-lg p-4" in:slide={{ duration: 400 }}>
				<!-- API Explanation -->
				<ApiExplanationAlert {currentDemo} />

				<!-- Visual Feed Display -->
				{#if currentDemo === 'profile' && apiData}
					<ProfileDisplay profileData={apiData} {copyPostJson} />
				{:else if (currentDemo === 'timeline' || currentDemo === 'author-feed') && apiData?.feed}
					<FeedDisplay 
						title={currentDemo === 'timeline' ? 'Timeline Feed' : 'Author Posts'}
						feedData={apiData.feed}
						{copyPostJson}
						showCopyButton={true}
						showRepostIndicator={true}
						copyButtonPrefix={currentDemo === 'timeline' ? 'timeline' : 'author'}
					/>
				{:else if (currentDemo === 'following' || currentDemo === 'followers') && apiData}
					<UserListDisplay 
						title={currentDemo === 'following' ? 'People You Follow' : 'Your Followers'}
						users={currentDemo === 'following' ? apiData.follows : apiData.followers}
						maxItems={8}
					/>
				{:else if currentDemo === 'post-thread' && apiData?.thread}
					<PostThreadDisplay threadData={apiData.thread} />
				{:else if currentDemo === 'likes' && apiData?.feed}
					<FeedDisplay 
						title="Liked Posts"
						feedData={apiData.feed}
						{copyPostJson}
						showCopyButton={true}
						showRepostIndicator={true}
						copyButtonPrefix="like"
					/>
				{:else}
					<!-- Default JSON Display -->
					<div class="mockup-code text-xs">
						<pre><code>{JSON.stringify(apiData, null, 2)}</code></pre>
					</div>
				{/if}
			</div>
		{:else}
			<!-- No Data State -->
			<div class="alert" in:fade={{ duration: 300 }}>
				<Icon src={ArrowLeft} class="w-6 h-6" />
				<span>Select an API demo from the left to see the response here.</span>
			</div>
		{/if}
	</div>
</div>