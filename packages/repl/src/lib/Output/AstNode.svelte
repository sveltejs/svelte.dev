<script lang="ts">
	import AstNode from './AstNode.svelte';
	import { get_repl_context } from '../context';
	import { tick } from 'svelte';
	import type { CompileResult } from 'svelte/compiler';

	type Ast = CompileResult['ast'];

	interface Props {
		key?: string;
		value: Ast;
		path_nodes?: Ast[];
		autoscroll?: boolean;
		depth?: number;
	}

	let { key = '', value, path_nodes = [], autoscroll = true, depth = 0 }: Props = $props();

	const { toggleable } = get_repl_context();

	let root = depth === 0;
	let open = $state(root);

	let list_item_el = $state() as HTMLLIElement;

	let is_leaf = $derived(path_nodes[path_nodes.length - 1] === value);
	let is_array = $derived(Array.isArray(value));
	let is_primitive = $derived(value === null || typeof value !== 'object');
	let is_markable = $derived(
		!is_primitive &&
			'start' in value &&
			'end' in value &&
			typeof value.start === 'number' &&
			typeof value.end === 'number'
	);
	let key_text = $derived(key ? `${key}:` : '');

	$effect(() => {
		open = path_nodes.includes(value);
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
	class:marked={!root && is_leaf}
	onmouseover={handle_mark_text}
	onfocus={handle_mark_text}
	onmouseleave={handle_unmark_text}
>
	{#if is_primitive || (is_array && value.length === 0)}
		<span class="value">
			{#if key_text}
				<span>{key_text}</span>
			{/if}

			{#if value == undefined}
				<span class="token comment">{String(value)}</span>
			{:else}
				<span class="token {typeof value}">
					{typeof value === 'bigint' ? `${value}n` : JSON.stringify(value)}
				</span>
			{/if}
		</span>
	{:else}
		<details bind:open>
			<summary>
				{#if key}
					<span class="key">{key}</span>:
				{/if}

				{#if is_array}
					[{#if !open}
						<span class="token comment">...</span>]
						<span class="token comment">({value.length})</span>
					{/if}
				{:else}
					{#if value.type}
						<span class="token comment">{value.type}</span>
					{/if}
					{'{'}{#if !open}<span class="token comment">...</span>}{/if}
				{/if}
			</summary>

			<ul>
				{#each Object.entries(value) as [k, v]}
					<AstNode
						key={is_array ? undefined : k}
						value={v}
						{path_nodes}
						{autoscroll}
						depth={depth + 1}
					/>
				{/each}
			</ul>

			<span>{is_array ? ']' : '}'}</span>
		</details>
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

	summary {
		position: relative;
		display: block;
		cursor: pointer;

		.key {
			text-decoration: underline;
		}

		&:hover .key {
			text-decoration: underline;
		}
	}

	.token {
		color: var(--shiki-color-text);
	}

	.token.string {
		color: var(--shiki-token-string);
	}

	.token.number,
	.token.bigint {
		color: var(--shiki-token-constant);
	}

	.token.comment {
		color: var(--shiki-token-comment);
	}
</style>
