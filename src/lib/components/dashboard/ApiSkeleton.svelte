<script lang="ts">
	export let demoType: string;
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<!-- Title skeleton -->
		<div class="skeleton h-6 w-48 mb-4"></div>
		
		{#if demoType === 'profile'}
			<!-- Profile skeleton -->
			<div class="flex items-center space-x-4 mb-6">
				<div class="skeleton w-20 h-20 rounded-full flex-shrink-0"></div>
				<div class="space-y-2">
					<div class="skeleton h-5 w-32"></div>
					<div class="skeleton h-4 w-24"></div>
					<div class="skeleton h-3 w-16"></div>
				</div>
			</div>
			<div class="skeleton h-4 w-full mb-2"></div>
			<div class="skeleton h-4 w-3/4"></div>
		
		{:else if demoType === 'timeline' || demoType === 'author-feed' || demoType === 'likes'}
			<!-- Feed skeleton -->
			<div class="space-y-4">
				{#each Array(3) as _}
					<div class="border border-base-200 rounded-lg p-4">
						<div class="flex space-x-3">
							<div class="skeleton w-10 h-10 rounded-full flex-shrink-0"></div>
							<div class="flex-1 space-y-2">
								<div class="flex space-x-2">
									<div class="skeleton h-4 w-24"></div>
									<div class="skeleton h-3 w-16"></div>
								</div>
								<div class="skeleton h-4 w-full"></div>
								<div class="skeleton h-4 w-5/6"></div>
								<div class="skeleton h-32 w-full"></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		
		{:else if demoType === 'following' || demoType === 'followers'}
			<!-- User list skeleton -->
			<div class="space-y-3">
				{#each Array(6) as _}
					<div class="flex items-center space-x-3 p-3 border border-base-200 rounded-lg">
						<div class="skeleton w-12 h-12 rounded-full flex-shrink-0"></div>
						<div class="flex-1 space-y-1">
							<div class="skeleton h-4 w-32"></div>
							<div class="skeleton h-3 w-24"></div>
						</div>
						<div class="skeleton h-8 w-20"></div>
					</div>
				{/each}
			</div>
		
		{:else if demoType === 'post-thread'}
			<!-- Thread skeleton -->
			<div class="space-y-4">
				<div class="border border-base-200 rounded-lg p-4">
					<div class="flex space-x-3">
						<div class="skeleton w-12 h-12 rounded-full flex-shrink-0"></div>
						<div class="flex-1 space-y-2">
							<div class="skeleton h-4 w-32"></div>
							<div class="skeleton h-4 w-full"></div>
							<div class="skeleton h-4 w-4/5"></div>
							<div class="skeleton h-40 w-full"></div>
						</div>
					</div>
				</div>
				<!-- Reply skeletons -->
				{#each Array(2) as _}
					<div class="border border-base-200 rounded-lg p-4 ml-6">
						<div class="flex space-x-3">
							<div class="skeleton w-10 h-10 rounded-full flex-shrink-0"></div>
							<div class="flex-1 space-y-2">
								<div class="skeleton h-3 w-24"></div>
								<div class="skeleton h-3 w-full"></div>
								<div class="skeleton h-3 w-3/4"></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		
		{:else}
			<!-- Generic skeleton -->
			<div class="space-y-3">
				<div class="skeleton h-4 w-full"></div>
				<div class="skeleton h-4 w-5/6"></div>
				<div class="skeleton h-4 w-4/5"></div>
				<div class="skeleton h-32 w-full"></div>
			</div>
		{/if}
	</div>
</div>