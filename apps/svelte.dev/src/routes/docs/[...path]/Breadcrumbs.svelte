<script lang="ts">
	let { breadcrumbs }: { breadcrumbs: Array<{ title: string }> } = $props();
</script>

<div class="breadcrumbs">
	{#each breadcrumbs as { title }}
		<span>{title}</span>
	{/each}
</div>

<style>
	.breadcrumbs {
		font: var(--sk-font-ui-small);
		color: var(--sk-fg-4);
		text-transform: uppercase;

		span:not(:last-child)::after {
			content: ' • ';
		}
	}
</style>
