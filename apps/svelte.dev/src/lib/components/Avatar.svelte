<script lang="ts">
	let {
		src,
		name,
		size = '2.4rem'
	}: { src?: string | null; name: string; size?: string } = $props();
</script>

{#if src}
	<img class="avatar" alt="{name} avatar" {src} style:width={size} style:height={size} />
{:else}
	<span class="avatar fallback" aria-label="{name} avatar" style:width={size} style:height={size}>
		{name[0]?.toUpperCase() ?? '?'}
	</span>
{/if}

<style>
	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(128, 128, 128, 0.3);
		border-radius: var(--sk-border-radius);
		object-fit: cover;
		flex-shrink: 0;
	}

	.fallback {
		background: var(--sk-bg-accent);
		color: white;
		font: var(--sk-font-ui-small);
		font-weight: 600;
		line-height: 1;
	}
</style>
