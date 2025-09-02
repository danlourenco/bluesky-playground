<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Icon, CheckCircle, XCircle, ArrowRightOnRectangle, Sparkles, ShieldCheck, CodeBracket } from 'svelte-hero-icons';
	import Avatar from '$lib/components/Avatar.svelte';
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	// Get error state from server load function
	const hasError = data.hasError;
	
	// Handle for pre-filling the OAuth login (required)
	let handle = '';
	
	// Validation state
	$: isValidHandle = handle.trim().length > 0;
	
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

<div class="hero min-h-screen bg-gradient-to-br from-primary to-secondary" data-theme="corporate">
	<div class="hero-overlay bg-opacity-60"></div>
	<div class="hero-content text-center">
		<div class="max-w-md">
			<!-- Main Card -->
			<div class="card bg-base-100 shadow-2xl">
			<div class="card-body p-8">
				<!-- Logo/Title -->
				<div class="text-center mb-8">
					<div class="flex justify-center mb-6">
						<Avatar placeholder="🦋" size="xl" />
					</div>
					<h1 class="card-title text-4xl font-bold text-primary justify-center mb-3">
						Bluesky Playground
					</h1>
					<p class="text-base-content/70 text-lg">
						Explore the decentralized social web
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
					<div class="form-control w-full text-left">
						<label class="label justify-start" for="handle">
							<span class="label-text font-medium text-base">Bluesky Handle</span>
						</label>
						<input
							type="text"
							id="handle"
							name="handle"
							bind:value={handle}
							placeholder="username.bsky.social"
							class="input input-bordered input-lg w-full focus:input-primary {!isValidHandle && handle.length > 0 ? 'input-error' : ''}"
							required
						/>
						<label class="label justify-start">
							<span class="label-text-alt text-base-content/60">Enter your Bluesky handle (e.g., alice.bsky.social)</span>
						</label>
					</div>

					<button type="submit" class="btn btn-primary btn-lg btn-block" disabled={!isValidHandle}>
						<Icon src={ArrowRightOnRectangle} class="w-5 h-5" />
						Connect with Bluesky
					</button>
				</form>

				<!-- Features grid -->
				<div class="divider">Why Bluesky Playground?</div>
				
				<div class="stats stats-vertical lg:stats-horizontal shadow w-full">
					<div class="stat place-items-center py-4">
						<div class="stat-figure text-success">
							<Icon src={ShieldCheck} class="w-8 h-8" />
						</div>
						<div class="stat-title text-xs">Secure OAuth</div>
						<div class="stat-desc text-xs">Industry standard</div>
					</div>
					
					<div class="stat place-items-center py-4">
						<div class="stat-figure text-secondary">
							<Icon src={Sparkles} class="w-8 h-8" />
						</div>
						<div class="stat-title text-xs">Developer Tools</div>
						<div class="stat-desc text-xs">Explore & build</div>
					</div>
					
					<div class="stat place-items-center py-4">
						<div class="stat-figure text-primary">
							<Icon src={CodeBracket} class="w-8 h-8" />
						</div>
						<div class="stat-title text-xs">Open Source</div>
						<div class="stat-desc text-xs">MIT licensed</div>
					</div>
				</div>

			</div>
		</div>

			<!-- Technical Documentation Link -->
			<div class="card bg-base-200 shadow-xl mt-6">
				<div class="card-body p-4">
					<p class="text-sm text-base-content/70">
						For developers: Learn how OAuth with Bluesky works
					</p>
					<div class="card-actions justify-center">
						<a href="https://github.com/danlourenco/bluesky-playground/blob/main/README_OAUTH.md" target="_blank" class="link link-primary">
							View Technical Documentation →
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

