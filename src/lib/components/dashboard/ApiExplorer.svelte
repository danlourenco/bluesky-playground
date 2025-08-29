<script lang="ts" context="module">
	export interface ApiDemo {
		id: string;
		name: string;
		description: string;
	}

	export interface ApiExplorerProps {
		demos: ApiDemo[];
		currentDemo?: string;
	}
</script>

<script lang="ts">
	import { Icon, CodeBracket } from 'svelte-hero-icons';
	import { navigating } from '$app/stores';
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	
	export let demos: ApiDemo[];
	export let currentDemo: string = '';
	
	const dispatch = createEventDispatcher();
	let optimisticDemo: string = '';
	
	// Handle click with immediate optimistic feedback
	function handleDemoClick(demoId: string, event: Event) {
		event.preventDefault();
		
		// Immediately show this demo as active (optimistic UI)
		optimisticDemo = demoId;
		
		// Dispatch event so parent can show skeleton
		dispatch('demoSelected', { demoId });
		
		// Navigate to get SSR data
		goto(`/dashboard?demo=${demoId}`, { 
			keepFocus: true,
			noScroll: true 
		});
	}
	
	// Determine which demo should appear active
	$: activeDemo = optimisticDemo || currentDemo;
	
	// Clear optimistic state when navigation completes
	$: if (!$navigating && optimisticDemo) {
		// Small delay to prevent flashing
		setTimeout(() => {
			optimisticDemo = '';
		}, 50);
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title text-lg">
			<Icon src={CodeBracket} class="w-5 h-5" />
			API Demonstrations
		</h2>
		<p class="text-sm opacity-70 mb-4">
			Click on any API below to see it in action. The response will appear on the right.
		</p>
		
		<div class="space-y-2">
			{#each demos as demo}
				<button
					type="button"
					on:click={(e) => handleDemoClick(demo.id, e)}
					class="block w-full text-left p-3 rounded-lg transition-all relative {activeDemo === demo.id
						? 'bg-primary text-primary-content'
						: 'bg-base-200 hover:bg-base-300'} {$navigating && optimisticDemo === demo.id ? 'pointer-events-none' : ''}"
				>
					{#if $navigating && optimisticDemo === demo.id}
						<div class="absolute top-3 right-3">
							<div class="loading loading-spinner loading-sm"></div>
						</div>
					{/if}
					<div class="font-medium">{demo.name}</div>
					<div class="text-sm opacity-70">{demo.description}</div>
				</button>
			{/each}
		</div>
	</div>
</div>

