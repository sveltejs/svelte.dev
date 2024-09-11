<script lang="ts">
	import { persisted } from 'svelte-persisted-store';

	const show = persisted('svelte:show-legacy-notes', true);

	$effect(() => {
		document.body.classList.toggle('hide-legacy-notes', !$show);
	});
</script>

<label class="legacy-toggle" class:unchecked={!$show}>
	<input type="checkbox" bind:checked={$show} />
	<span>Show Legacy Docs</span>
</label>

<style>
	.legacy-toggle {
		position: relative;
		display: flex;
		gap: 0.5em;
		align-items: center;
		height: var(--legacy-toggle-height);
		z-index: 2;
		padding: 0 var(--sk-page-padding-side);
		margin: 0 auto;
		&.unchecked {
			opacity: 0.8;
		}
	}

	@media (min-width: 832px) {
		.legacy-toggle {
			padding: 0 0 0 2rem;
			width: var(--sidebar-menu-width);
			margin: 0 0 0 auto;
		}
	}
</style>
