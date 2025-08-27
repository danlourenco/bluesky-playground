<script lang="ts" context="module">
	export interface DashboardHeaderProps {
		user: string;
		showTvGuide?: boolean;
		showDebug?: boolean;
	}
</script>

<script lang="ts">
	export let user: string;
	export let showTvGuide: boolean = true;
	export let showDebug: boolean = true;
</script>

<div class="card bg-base-100 shadow-xl mb-8">
	<div class="card-body">
		<div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
			<!-- Title and Status -->
			<div>
				<h1 class="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
					Bluesky Dashboard
				</h1>
				<div class="flex items-center gap-2 mt-2">
					<div class="badge badge-success gap-1">
						<div class="w-2 h-2 bg-success rounded-full animate-pulse"></div>
						Connected
					</div>
					<div class="text-sm opacity-70">
						as <kbd class="kbd kbd-sm">{user}</kbd>
					</div>
				</div>
			</div>
			
			<!-- Navigation Buttons -->
			<div class="flex gap-2">
				{#if showTvGuide}
					<a href="/tv-guide" class="btn btn-secondary btn-outline hover:btn-secondary">
						TV Guide
					</a>
				{/if}
				{#if showDebug}
					<a href="/debug" class="btn btn-primary btn-outline hover:btn-primary">
						Debug
					</a>
				{/if}
				<a href="/auth/logout" class="btn btn-ghost hover:btn-error">
					Logout
				</a>
			</div>
		</div>
	</div>
</div>