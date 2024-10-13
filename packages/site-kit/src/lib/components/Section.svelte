<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<section>
	<div class="inner">{@render children?.()}</div>
</section>

<style>
	section {
		position: relative;
		padding: 6rem 0;
		background: var(--background, transparent);
	}

	section::after {
		content: '';
		display: table;
		clear: both;
	}

	.inner {
		max-width: var(--max-width, 120rem);
		padding: 0 var(--sk-page-padding-side);
		margin: 0 auto;
	}

	@media (min-width: 900px) {
		section {
			padding: 10rem 0;
		}
	}
</style>
