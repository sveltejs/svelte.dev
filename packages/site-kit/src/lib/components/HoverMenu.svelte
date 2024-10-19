<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="hover-menu">
	{@render children()}
</div>

<style>
	.hover-menu {
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
					border-radius: var(--sk-border-radius) var(--sk-border-radius) 0 0;
				}

				&:last-child {
					padding-bottom: 1.3rem;
					border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
				}
			}

			a:hover,
			button:hover {
				background-color: var(--sk-back-4);
			}
		}
	}
</style>
