<!-- @component
     A context menu for the tutorial's file tree
-->
<script module>
	import { writable } from 'svelte/store';

	/**
	 * @type {import("svelte/store").Writable<{x: number; y: number; items: import('$lib/tutorial').MenuItem[]} | null>}
	 */
	let menu_items = writable(null);

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {import('$lib/tutorial').MenuItem[]} items
	 */
	export function open(x, y, items) {
		if (items.length > 0) {
			menu_items.set({ x, y, items });
		}
	}
</script>

{#if $menu_items}
	<nav style="position: fixed; z-index: 5; top:{$menu_items.y}px; left:{$menu_items.x}px">
		<div class="context-menu">
			<ul>
				{#each $menu_items.items as item}
					<li>
						<button on:click={item.fn}>{item.label}</button>
					</li>
				{/each}
			</ul>
		</div>
	</nav>
{/if}

<svelte:window on:click={() => menu_items.set(null)} />

<style>
	.context-menu {
		display: inline-flex;
		background-color: var(--sk-bg-2);
		border-radius: var(--sk-border-radius);
		overflow: hidden;
		flex-direction: column;
		filter: var(--sk-shadow);
	}

	ul {
		margin: 0;
		padding: 0.5rem;
		background-color: var(--sk-bg-2);
	}

	li {
		display: block;
		list-style-type: none;

		&:hover {
			background-color: var(--sk-bg-4);
		}
	}

	button {
		display: block;
		width: 100%;
		height: 100%;
		text-align: left;
		border: 0px;
		padding: 1rem;
		font: var(--sk-font-ui-small);
		line-height: 1;
		border-radius: var(--sk-border-radius);
	}
</style>
