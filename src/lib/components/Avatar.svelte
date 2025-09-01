<script lang="ts">
	export let src: string | undefined = undefined;
	export let alt: string = 'Avatar';
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let placeholder: string | undefined = undefined;
	export let shape: 'circle' | 'square' = 'circle';
	
	// Size mapping for consistent sizing
	const sizeClasses = {
		xs: 'w-8',
		sm: 'w-12', 
		md: 'w-16',
		lg: 'w-24',
		xl: 'w-32'
	};
	
	const textSizeClasses = {
		xs: 'text-xs',
		sm: 'text-sm',
		md: 'text-xl',
		lg: 'text-2xl', 
		xl: 'text-4xl'
	};
	
	$: sizeClass = sizeClasses[size];
	$: textSizeClass = textSizeClasses[size];
	$: shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';
</script>

{#if src}
	<!-- Image Avatar -->
	<div class="avatar">
		<div class="{sizeClass} {shapeClass}">
			<img {src} {alt} />
		</div>
	</div>
{:else if placeholder}
	<!-- Placeholder Avatar -->
	<div class="avatar avatar-placeholder">
		<div class="bg-primary text-primary-content {sizeClass} {shapeClass}">
			<span class="{textSizeClass}">{placeholder}</span>
		</div>
	</div>
{:else}
	<!-- Default placeholder -->
	<div class="avatar avatar-placeholder">
		<div class="bg-neutral text-neutral-content {sizeClass} {shapeClass}">
			<span class="{textSizeClass}">?</span>
		</div>
	</div>
{/if}