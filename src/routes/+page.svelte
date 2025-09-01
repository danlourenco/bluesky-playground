<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Icon, CheckCircle, XCircle, ArrowRightOnRectangle } from 'svelte-hero-icons';
	import Avatar from '$lib/components/Avatar.svelte';
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	// Get error state from server load function
	const hasError = data.hasError;
	
	// Handle for pre-filling the OAuth login (optional)
	let handle = '';
	
	// Handle OAuth success redirect
	onMount(() => {
		if (data.success && data.redirectTo) {
			// Small delay to ensure cookie is set, then redirect
			setTimeout(() => {
				goto(data.redirectTo);
			}, 100);
		}
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 flex items-center justify-center p-4" data-theme="light">
	<div class="w-full max-w-md">
		<!-- Main Card -->
		<div class="card bg-base-100 shadow-2xl">
			<div class="card-body p-8">
				<!-- Logo/Title -->
				<div class="text-center mb-6">
					<div class="flex justify-center mb-4">
						<Avatar placeholder="🦋" size="md" />
					</div>
					<h1 class="card-title text-2xl justify-center mb-2">Bluesky Playground</h1>
					<p class="text-base-content/70">
						Connect your Bluesky account to explore the AT Protocol
					</p>
				</div>

				<!-- Success Message -->
				{#if data.success}
					<div class="alert alert-success mb-6">
						<Icon src={CheckCircle} class="w-6 h-6" />
						<span>Authentication successful! Redirecting...</span>
					</div>
				{:else if hasError}
					<!-- Error Message -->
					<div class="alert alert-error mb-6">
						<Icon src={XCircle} class="w-6 h-6" />
						<span>Authentication failed. Please try again.</span>
					</div>
				{/if}

				<!-- OAuth Login Form -->
				<form action="/auth/login" method="GET" class="space-y-6">
					<div class="form-control w-full">
						<label class="label" for="handle">
							<span class="label-text">Bluesky Handle</span>
							<span class="label-text-alt text-base-content/50">Optional</span>
						</label>
						<input
							type="text"
							id="handle"
							name="handle"
							bind:value={handle}
							placeholder="username.bsky.social"
							class="input input-bordered w-full focus:input-primary"
						/>
						<label class="label">
							<span class="label-text-alt text-base-content/60">Pre-fill your handle or leave blank</span>
						</label>
					</div>

					<button type="submit" class="btn btn-primary btn-lg w-full">
						<Icon src={ArrowRightOnRectangle} class="w-5 h-5" />
						Connect with Bluesky
					</button>
				</form>

				<!-- Simple Explanation -->
				<div class="divider">What happens next</div>
				
				<div class="space-y-3">
					<div class="flex items-center space-x-3">
						<div class="badge badge-primary badge-sm">1</div>
						<span class="text-sm text-base-content/80">You'll be redirected to Bluesky to sign in</span>
					</div>
					<div class="flex items-center space-x-3">
						<div class="badge badge-primary badge-sm">2</div>
						<span class="text-sm text-base-content/80">Authorize this app to access your account</span>
					</div>
					<div class="flex items-center space-x-3">
						<div class="badge badge-primary badge-sm">3</div>
						<span class="text-sm text-base-content/80">Return here to explore the AT Protocol APIs</span>
					</div>
				</div>

			</div>
		</div>

		<!-- Technical Documentation Link -->
		<div class="mt-6 text-center">
			<div class="card bg-base-200/50">
				<div class="card-body py-4 px-6">
					<p class="text-sm text-base-content/70 mb-2">
						For developers: Learn how OAuth with Bluesky works
					</p>
					<a href="/README_OAUTH.md" target="_blank" class="link link-primary text-sm font-medium">
						View Technical Documentation →
					</a>
				</div>
			</div>
		</div>
	</div>
</div>

