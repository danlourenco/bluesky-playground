<script lang="ts" context="module">
	export interface ProfileData {
		handle: string;
		displayName?: string;
		description?: string;
		avatar?: string;
		followsCount?: number;
		followersCount?: number;
		postsCount?: number;
	}

	export interface ProfileDisplayProps {
		profileData: ProfileData;
		copyPostJson?: (postData: any, postIndex?: string | number) => Promise<void>;
	}
</script>

<script lang="ts">
	export let profileData: ProfileData;
	export let copyPostJson:
		| ((postData: any, postIndex?: string | number) => Promise<void>)
		| undefined = undefined;
</script>

<div class="group card mb-6 border bg-base-100">
	<div class="relative card-body">
		<!-- Copy JSON Button for Profile -->
		{#if copyPostJson}
			<button
				class="btn absolute top-2 right-2 opacity-0 btn-ghost transition-opacity btn-xs group-hover:opacity-100"
				on:click={() => copyPostJson?.(profileData, 'profile')}
				title="Copy profile JSON to clipboard"
			>
				Copy JSON
			</button>
		{/if}

		<h3 class="mb-4 card-title text-base">Profile Preview</h3>
		<div class="flex items-start space-x-4">
			{#if profileData.avatar}
				<div class="avatar">
					<div class="w-16 rounded-full">
						<img
							src={profileData.avatar}
							alt="{profileData.displayName || profileData.handle}'s avatar"
						/>
					</div>
				</div>
			{:else}
				<div class="placeholder avatar">
					<div class="w-16 rounded-full bg-neutral text-neutral-content">
						<span class="text-xl">
							{(profileData.displayName || profileData.handle).charAt(0).toUpperCase()}
						</span>
					</div>
				</div>
			{/if}
			<div class="flex-1">
				<div class="flex items-center space-x-2">
					<h4 class="text-xl font-bold">{profileData.displayName || profileData.handle}</h4>
					{#if profileData.displayName}
						<span class="text-base-content/70">@{profileData.handle}</span>
					{/if}
				</div>
				{#if profileData.description}
					<p class="mt-2">{profileData.description}</p>
				{/if}
				<div class="mt-3 flex space-x-6 text-sm">
					<div><span class="font-semibold">{profileData.followsCount || 0}</span> Following</div>
					<div><span class="font-semibold">{profileData.followersCount || 0}</span> Followers</div>
					<div><span class="font-semibold">{profileData.postsCount || 0}</span> Posts</div>
				</div>
			</div>
		</div>
	</div>
</div>
