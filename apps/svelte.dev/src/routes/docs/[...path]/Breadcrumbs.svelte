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
		font-family: var(--sk-font-ui);
		font-size: var(--sk-text-xs);
		color: var(--sk-text-4);
		text-transform: uppercase;
		line-height: 1.35;

		span:not(:last-child)::after {
			content: ' • ';
		}
	}
</style>
