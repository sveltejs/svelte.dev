<script lang="ts">
	import AstNode from './AstNode.svelte';
	import { get_repl_context } from '../context';
	import { tick } from 'svelte';
	import type { CompileResult } from 'svelte/compiler';

	type Ast = CompileResult['ast'];

	interface Props {
		key?: string;
		value: Ast;
		collapsed?: boolean;
		path_nodes?: Ast[];
		autoscroll?: boolean;
	}

	let {
		key = '',
		value,
		collapsed = $bindable(true),
		path_nodes = [],
		autoscroll = true
	}: Props = $props();

	const { toggleable } = get_repl_context();

	let list_item_el = $state() as HTMLLIElement;

	let is_root = $derived(path_nodes[0] === value);
	let is_leaf = $derived(path_nodes[path_nodes.length - 1] === value);
	let is_ast_array = $derived(Array.isArray(value));
	let is_collapsable = $derived(value && typeof value === 'object');
	let is_markable = $derived(
		is_collapsable &&
			'start' in value &&
			'end' in value &&
			typeof value.start === 'number' &&
			typeof value.end === 'number'
	);
	let key_text = $derived(key ? `${key}:` : '');

	let preview_text = $state('');

	$effect(() => {
		if (!is_collapsable || !collapsed) return;

		if (is_ast_array) {
			if (!('length' in value)) return;

			preview_text = `[ ${value.length} element${value.length === 1 ? '' : 's'} ]`;
		} else {
			preview_text = `{ ${Object.keys(value).join(', ')} }`;
		}
	});

	$effect(() => {
		collapsed = !path_nodes.includes(value);
	});

	$effect(() => {
		if (autoscroll && is_leaf && !$toggleable) {
			// wait for all nodes to render before scroll
			tick().then(() => {
				if (list_item_el) {
					list_item_el.scrollIntoView();
				}
			});
		}
	});

	function handle_mark_text(e: MouseEvent | FocusEvent) {
		if (is_markable) {
			e.stopPropagation();

			if (
				'start' in value &&
				'end' in value &&
				typeof value.start === 'number' &&
				typeof value.end === 'number'
			) {
				// TODO
				// $module_editor?.markText({ from: value.start ?? 0, to: value.end ?? 0 });
			}
		}
	}

	function handle_unmark_text(e: MouseEvent) {
		if (is_markable) {
			e.stopPropagation();
			// TODO
			// $module_editor?.unmarkText();
		}
	}
</script>

<li
	bind:this={list_item_el}
	class:marked={!is_root && is_leaf}
	onmouseover={handle_mark_text}
	onfocus={handle_mark_text}
	onmouseleave={handle_unmark_text}
>
	{#if !is_root && is_collapsable}
		<button class="ast-toggle" class:open={!collapsed} onclick={() => (collapsed = !collapsed)}>
			{key_text}
		</button>
	{:else if key_text}
		<span>{key_text}</span>
	{/if}
	{#if is_collapsable}
		{#if collapsed && !is_root}
			<button class="preview" onclick={() => (collapsed = !collapsed)}>
				{preview_text}
			</button>
		{:else}
			<span>{is_ast_array ? '[' : '{'}</span>
			<ul>
				{#each Object.entries(value) as [k, v]}
					<AstNode key={is_ast_array ? '' : k} value={v} {path_nodes} {autoscroll} />
				{/each}
			</ul>
			<span>{is_ast_array ? ']' : '}'}</span>
		{/if}
	{:else}
		<span class="token {typeof value}">
			{JSON.stringify(value)}
		</span>
	{/if}
</li>

<style>
	* {
		font: var(--sk-font-mono);
	}

	ul {
		padding: 0 0 0 2ch;
		margin: 0;
		list-style-type: none;
	}

	.marked {
		background-color: var(--sk-highlight-color);
	}

	button {
		&:hover {
			text-decoration: underline;
		}
	}

	.ast-toggle {
		position: relative;
	}

	.ast-toggle::before {
		content: '\25B6';
		position: absolute;
		bottom: 0;
		left: -1.3rem;
		opacity: 0.7;
	}

	.ast-toggle.open::before {
		content: '\25BC';
	}

	.token {
		color: var(--sk-code-base);
	}

	.token.string {
		color: var(--sk-code-string);
	}

	.token.number {
		color: var(--sk-code-number);
	}
</style>
