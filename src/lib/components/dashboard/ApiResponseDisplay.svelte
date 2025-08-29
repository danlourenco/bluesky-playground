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
	import ApiSkeleton from './ApiSkeleton.svelte';
	import { Icon, ExclamationTriangle, ArrowLeft } from 'svelte-hero-icons';
	import { navigating } from '$app/stores';

	export let demos: ApiDemo[];
	export let currentDemo: string = '';
	export let apiData: any = null;
	export let apiError: string = '';
	export let copyPostJson: (postData: any, postIndex?: string | number) => Promise<void>;
	export let optimisticDemo: string = '';

	$: currentDemoName = demos.find(d => d.id === currentDemo)?.name || 'Unknown';
	$: optimisticDemoName = demos.find(d => d.id === optimisticDemo)?.name || 'Unknown';
	
	// Determine what to show - optimistic demo takes priority
	$: displayDemo = optimisticDemo || currentDemo;
	$: displayDemoName = optimisticDemo ? optimisticDemoName : currentDemoName;
	
	// Show skeleton when navigating and we have optimistic state
	$: showSkeleton = $navigating && optimisticDemo;
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title text-lg">
			API Response: {displayDemoName}
		</h2>

		{#if showSkeleton}
			<!-- Optimistic skeleton loading -->
			<div in:fade={{ duration: 150 }}>
				<ApiSkeleton demoType={optimisticDemo} />
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