<script>
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<section>
	<div class="inner">{@render children?.()}</div>
</section>

<style>
	section {
		padding: 6rem 0;
		background: var(--background, white);
	}

	section::after {
		content: '';
		display: table;
		clear: both;
	}

	.inner {
		max-width: 120rem;
		padding: 0 var(--sk-page-padding-side);
		margin: 0 auto;
	}

	@media (min-width: 900px) {
		section {
			padding: 10rem 0;
		}
	}
</style>
