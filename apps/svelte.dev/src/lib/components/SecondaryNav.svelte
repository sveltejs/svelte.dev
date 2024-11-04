<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="secondary-nav">
	{@render children()}
</div>

<style>
	.secondary-nav {
		width: 100%;
		height: var(--sk-secondary-nav-height);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.6rem var(--sk-page-padding-side);
		background-color: var(--sk-bg-1);
		white-space: nowrap;
		flex: 0;
		gap: 1rem;

		@media (min-width: 800px) {
			padding-top: 1rem;
		}
	}
</style>
