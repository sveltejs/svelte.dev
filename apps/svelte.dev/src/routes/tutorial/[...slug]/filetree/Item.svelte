<script lang="ts">
	import { tick } from 'svelte';
	import { open } from './ContextMenu.svelte';
	import type { MenuItem } from '$lib/tutorial';
	import { forcefocus } from '@sveltejs/site-kit/actions';

	interface Props {
		basename?: string;
		icon?: string;
		depth?: number;
		selected?: boolean;
		can_rename?: boolean;
		renaming: boolean;
		actions?: MenuItem[];
		onclick?: (e: MouseEvent) => void;
		onkeydown?: (e: KeyboardEvent) => void;
		onrename?: (basename: string) => void;
		oncancel?: () => void;
		onedit?: () => void;
	}

	let {
		basename = '',
		icon = '',
		depth = 0,
		selected = false,
		can_rename = false,
		renaming,
		actions = [],
		onclick,
		onkeydown,
		onrename,
		oncancel,
		onedit
	}: Props = $props();

	let cancelling = $state(false);

	function commit(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.value && input.value !== basename) {
			onrename?.(input.value);
		}

		cancel();
	}

	async function cancel() {
		cancelling = true;
		oncancel?.();
		await tick();
		cancelling = false;
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<li
	aria-current={selected ? 'true' : undefined}
	style:--depth={depth}
	style:--icon="url(&quot;{icon}&quot;)"
	{onkeydown}
>
	{#if renaming}
		<!-- svelte-ignore a11y_autofocus -->
		<input
			type="text"
			use:forcefocus
			autocomplete="off"
			spellcheck="false"
			value={basename}
			onblur={(e) => {
				if (!cancelling) {
					commit(e);
				}
			}}
			onkeyup={(e) => {
				if (e.key === 'Enter') {
					commit(e);
				}

				if (e.key === 'Escape') {
					cancel();
				}
			}}
		/>
	{:else}
		<button
			class="basename"
			{onclick}
			ondblclick={() => {
				if (can_rename) {
					onedit?.();
				}
			}}
			oncontextmenu={(e) => {
				e.preventDefault();
				open(e.clientX, e.clientY, actions);
			}}
		>
			{basename}
		</button>

		{#if actions.length > 0}
			<div class="actions">
				{#each actions as action}
					<button aria-label={action.label} class="icon {action.icon}" onclick={action.fn}></button>
				{/each}
			</div>
		{/if}
	{/if}
</li>

<style>
	li {
		--bg: var(--sk-bg-3);
		--inset: calc((var(--depth) * 1.2rem) + 1.5rem);
		display: flex;
		position: relative;
		width: calc(100% - 1px);
		height: 2.4rem;
		z-index: 1;
		background: var(--bg) var(--icon) no-repeat;
		background-position: calc(var(--inset) - 0.5rem) 50%;
		background-size: 1.2rem;
	}

	button,
	input {
		background-size: 1.2rem 1.2rem;
		background-position: 0 45%;
		background-repeat: no-repeat;
	}

	:focus-visible {
		outline-offset: -2px;
	}

	input {
		background: var(--sk-bg-3);
		margin: 0 0.5rem 0 calc(0.5rem + var(--inset));
		border: 2px solid transparent;
		padding: 0 0.5rem;
		font: inherit;
	}

	.basename {
		display: block;
		position: relative;
		margin: 0;
		padding: 0 1rem 0 calc(1rem + var(--inset));
		color: inherit;
		flex: 1;
		height: 100%;
		text-align: left;
		border: 2px solid transparent;
		white-space: nowrap;
		overflow: hidden;
		line-height: 1;
	}

	input {
		width: 100%;
		height: 100%;
	}

	.actions {
		display: flex;
		right: 0;
		top: 0;
		height: 100%;
		padding-right: 1rem;
		background-color: var(--bg);
		white-space: pre;
	}

	.icon {
		height: 100%;
		width: 1.5rem;

		&.rename {
			background-image: url(icons/rename);
		}

		&.delete {
			background-image: url(icons/delete);
		}

		&.file-new {
			background-image: url(icons/file-new);
		}

		&.folder-new {
			background-image: url(icons/folder-new);
		}
	}

	[aria-current='true'] {
		color: var(--sk-fg-accent);
	}

	[aria-current='true']:has(:focus-visible)::after,
	:global(.mobile-filetree) [aria-current='true']::after {
		display: none;
	}
</style>
