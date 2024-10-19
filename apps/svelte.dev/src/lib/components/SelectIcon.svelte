<script lang="ts">
	import { Icon } from '@sveltejs/site-kit/components';
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	let { children, value, ...props }: HTMLSelectAttributes & { children: Snippet } = $props();

	export { value }; // allow it to be temporarily overwritten
</script>

<div class="examples-select">
	<span class="raised icon"><Icon name="menu" /></span>
	<select {...props} {value}>
		{@render children()}
	</select>
</div>

<style>
	.examples-select {
		position: relative;

		&:has(select:focus-visible) .raised.icon {
			outline: 2px solid hsla(var(--sk-theme-1-hsl), 0.6);
			border-radius: var(--sk-border-radius);
		}

		span {
			pointer-events: none;
		}
	}

	select {
		opacity: 0.0001;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	span.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
	}

	.icon {
		position: relative;
		color: var(--sk-text-3);
		line-height: 1;
		background-size: 1.8rem;
		z-index: 999;
	}

	.icon:hover,
	.icon:focus-visible {
		opacity: 1;
	}
</style>
