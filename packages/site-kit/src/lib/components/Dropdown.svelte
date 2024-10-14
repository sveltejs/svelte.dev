<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		dropdown,
		align = 'left'
	}: { children: Snippet; dropdown: Snippet; align?: 'left' | 'right' } = $props();
</script>

<div class="dropdown">
	{@render children()}

	<nav class="dropdown-content" class:align-right={align === 'right'}>
		{@render dropdown()}
	</nav>
</div>

<style>
	.dropdown {
		position: relative;
		display: inline-block;
		height: 100%;
	}

	.dropdown-content {
		opacity: 0;
		pointer-events: none;
		position: absolute;
		left: -1rem;
		/* this is a bit of a kludge, but it ensures a contiguous hit area (50% + 50%) while also working for tall links like `Docs` (50% + 1.5rem) */
		top: calc(50% + min(50%, 1.5rem));
		background-color: var(--sk-back-2);
		z-index: 1;
		box-shadow: var(--sk-shadow);
		border-radius: var(--sk-border-radius);
		overflow: hidden;
		z-index: 999;

		&.align-right {
			left: auto;
			right: -1rem;
		}

		:global {
			a,
			button {
				color: var(--sk-text-2);
				padding: 1rem 1.3rem;
				display: block;
				font: var(--sk-font-ui-medium);
				text-decoration: none;
				line-height: 1;
				width: 100%;
				text-align: left;

				&:first-child {
					padding-top: 1.3rem;
				}

				&:last-child {
					padding-bottom: 1.3rem;
				}
			}

			a:hover,
			button:hover {
				background-color: var(--sk-back-4);
			}
		}
	}

	.dropdown:hover .dropdown-content,
	.dropdown:focus-within .dropdown-content {
		opacity: 1;
		pointer-events: all;
	}
</style>
