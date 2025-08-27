<script lang="ts" context="module">
	export interface UserData {
		handle: string;
		displayName?: string;
		description?: string;
		avatar?: string;
	}

	export interface UserListDisplayProps {
		title: string;
		users: UserData[];
		maxItems?: number;
	}
</script>

<script lang="ts">
	export let title: string;
	export let users: UserData[];
	export let maxItems: number = 8;
</script>

<div class="card bg-base-100 border mb-6">
	<div class="card-body">
		<h3 class="card-title text-base mb-4">{title}</h3>
		<div class="grid gap-4">
			{#each users.slice(0, maxItems) as person}
				<div class="flex items-center space-x-3 p-3 bg-base-200 rounded-lg">
					{#if person.avatar}
						<div class="avatar">
							<div class="w-10 h-10 rounded-full">
								<img 
									src={person.avatar} 
									alt="{person.displayName || person.handle}'s avatar"
									class="w-full h-full object-cover"
								/>
							</div>
						</div>
					{:else}
						<div class="avatar placeholder">
							<div class="bg-neutral text-neutral-content w-10 h-10 rounded-full">
								<span class="text-xs">{(person.displayName || person.handle).charAt(0).toUpperCase()}</span>
							</div>
						</div>
					{/if}
					<div class="flex-1 min-w-0">
						<div class="font-semibold truncate">{person.displayName || person.handle}</div>
						<div class="text-sm text-base-content/70 truncate">@{person.handle}</div>
						{#if person.description}
							<div class="text-xs text-base-content/60 mt-1 line-clamp-2">{person.description}</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
		{#if users.length > maxItems}
			<div class="text-center text-base-content/70 mt-4">
				Showing {maxItems} of {users.length} users
			</div>
		{/if}
		{#if users.length === 0}
			<div class="text-center text-base-content/70 py-8">
				No users to display
			</div>
		{/if}
	</div>
</div>