<!-- @component
     A context menu for the tutorial's file tree
-->
<script module lang="ts">
	import type { MenuItem } from '$lib/tutorial';

	let menu_items: { x: number; y: number; items: MenuItem[] } | null = $state(null);

	export function open(x: number, y: number, items: MenuItem[]) {
		if (items.length > 0) {
			menu_items = { x, y, items };
		}
	}
</script>

{#if menu_items}
	<nav style="position: fixed; z-index: 5; top:{menu_items.y}px; left:{menu_items.x}px">
		<div class="context-menu">
			<ul>
				{#each menu_items.items as item}
					<li>
						<button onclick={item.fn}>{item.label}</button>
					</li>
				{/each}
			</ul>
		</div>
	</nav>
{/if}

<svelte:window onclick={() => (menu_items = null)} />

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
