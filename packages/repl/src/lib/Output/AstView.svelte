<script lang="ts">
	import { Checkbox } from '@sveltejs/site-kit/components';
	import Message from '../Message.svelte';
	import AstNode from './AstNode.svelte';
	import type { CompileResult } from 'svelte/compiler';
	import type { Workspace } from 'editor';

	type Ast = CompileResult['ast'];

	interface Props {
		workspace: Workspace;
		ast: Ast;
		active?: boolean;
	}

	let { workspace, ast, active = true }: Props = $props();

	let cursor = $state(0);

	let path_nodes = $derived(find_deepest_path(cursor, [ast]) || []);

	function find_deepest_path(cursor: number, paths: Ast[]): Ast[] | undefined {
		const value = paths[paths.length - 1];

		if (!value) return;

		for (const v of Object.values(value)) {
			if (typeof v === 'object') {
				const result = find_deepest_path(cursor, paths.concat([v]));
				if (result) return result;
			}
		}

		if (
			'start' in value &&
			'end' in value &&
			typeof value.start === 'number' &&
			typeof value.end === 'number' &&
			value.start <= cursor &&
			cursor <= value.end
		) {
			return paths;
		}
	}

	workspace.onhover((pos) => {
		cursor = pos;
	});
</script>

<div class="ast-view">
	<pre>
		<code>
			{#if typeof ast === 'object'}
				<ul>
					<AstNode
						value={ast}
						{path_nodes}
						{active}
						onhover={(node) => {
							if (
								node === null ||
								(node.type !== undefined && node.start !== undefined && node.end !== undefined)
							) {
								workspace.highlight_range(node);
							}
						}}
					/>
				</ul>
			{:else}
				<p>No AST available</p>
			{/if}
		</code>
	</pre>

	<Message kind="info">The AST is not public API and may change at any point in time</Message>

	<label>
		modern

		<Checkbox
			checked={workspace.compiler_options.modernAst}
			onchange={(modernAst) => {
				workspace.update_compiler_options({ modernAst });
			}}
		/>
	</label>
</div>

<style>
	.ast-view {
		--base: hsl(45, 7%, 45%);
		--string: hsl(41, 37%, 45%);
		--number: hsl(102, 27%, 50%);
		background: var(--sk-bg-3);
		color: var(--shiki-color-text);
		display: flex;
		flex-direction: column;
	}

	.ast-view,
	pre,
	code {
		height: 100%;
		block-size: 100%;
		font: var(--sk-font-mono);
	}

	pre {
		white-space: normal;
		padding: 1rem;
		tab-size: 2;
		-moz-tab-size: 2;
	}

	ul {
		padding: 0;
		margin: 0;
		list-style-type: none;
	}

	label {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: inline-flex;
		gap: 1rem;
		align-items: center;
		font: var(--sk-font-ui-small);
	}
</style>
