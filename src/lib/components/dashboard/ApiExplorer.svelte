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
	
	export let demos: ApiDemo[];
	export let currentDemo: string = '';
	
	let loadingDemo: string = '';
	
	// Handle click with loading state
	function handleDemoClick(demoId: string) {
		loadingDemo = demoId;
		// The actual navigation happens via the href, but we show loading feedback
		setTimeout(() => {
			loadingDemo = '';
		}, 100);
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
				<a
					href="/dashboard?demo={demo.id}"
					on:click={() => handleDemoClick(demo.id)}
					class="block p-3 rounded-lg transition-all relative {currentDemo === demo.id
						? 'bg-primary text-primary-content'
						: 'bg-base-200 hover:bg-base-300'} {loadingDemo === demo.id ? 'pointer-events-none opacity-75' : ''}"
				>
					{#if loadingDemo === demo.id}
						<div class="absolute inset-0 flex items-center justify-center">
							<div class="loading loading-spinner loading-sm"></div>
						</div>
					{/if}
					<div class="font-medium {loadingDemo === demo.id ? 'opacity-50' : ''}">{demo.name}</div>
					<div class="text-sm opacity-70 {loadingDemo === demo.id ? 'opacity-30' : ''}">{demo.description}</div>
				</a>
			{/each}
		</div>
	</div>
</div>

