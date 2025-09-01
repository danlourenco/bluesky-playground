<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { PageData } from './$types';
	import DashboardHeader from '$lib/components/dashboard/DashboardHeader.svelte';
	import ApiExplorer from '$lib/components/dashboard/ApiExplorer.svelte';
	import ApiResponseDisplay from '$lib/components/dashboard/ApiResponseDisplay.svelte';

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


	// Optimistic demo state
	let optimisticDemo: string = '';
	
	// Handle demo selection from ApiExplorer
	function handleDemoSelected(event: CustomEvent<{ demoId: string }>) {
		optimisticDemo = event.detail.demoId;
	}
	
	// Copy JSON to clipboard function
	async function copyPostJson(postData: any, postIndex?: string | number) {
		const jsonString = JSON.stringify(postData, null, 2);
		
		try {
			await navigator.clipboard.writeText(jsonString);
			
			// Show success feedback (temporary)
			const buttonId = `copy-btn-${postIndex || 'single'}`;
			const button = document.getElementById(buttonId);
			if (button) {
				const originalText = button.innerHTML;
				button.innerHTML = '✓ Copied!';
				button.classList.add('bg-green-600', 'hover:bg-green-700');
				button.classList.remove('bg-gray-600', 'hover:bg-gray-700');
				
				setTimeout(() => {
					button.innerHTML = originalText;
					button.classList.remove('bg-green-600', 'hover:bg-green-700');
					button.classList.add('bg-gray-600', 'hover:bg-gray-700');
				}, 2000);
			}
		} catch (error) {
			console.error('Failed to copy JSON:', error);
			alert('Failed to copy JSON to clipboard');
		}
	}
</script>

<div class="min-h-screen py-8" data-theme="light">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<DashboardHeader user={data.user} />

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- API Demo Selector -->
			<div class="lg:col-span-1">
				<ApiExplorer {demos} currentDemo={data.demo} on:demoSelected={handleDemoSelected} />
			</div>

			<!-- API Response Display -->
			<div class="lg:col-span-2">
				{#key data.demo}
					<div in:fade={{ duration: 200, delay: 100 }}>
						<ApiResponseDisplay 
							{demos} 
							currentDemo={data.demo || ''} 
							apiData={data.apiData} 
							apiError={data.apiError || ''} 
							{copyPostJson}
							{optimisticDemo}
						/>
					</div>
				{/key}
			</div>
	</div>
</div>
</div>
