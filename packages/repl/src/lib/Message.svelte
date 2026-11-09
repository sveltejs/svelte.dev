<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { MessageDetails } from './types.js';

	interface Props {
		kind?: 'info' | 'error';
		details?: any | undefined;
		filename?: string | undefined;
		truncate?: boolean;
		children?: import('svelte').Snippet;
	}

	let {
		kind = 'info',
		details = undefined,
		filename = undefined,
		truncate = false,
		children
	}: Props = $props();

	function message(details: MessageDetails) {
		let str = details.message || '[missing message]';

		let loc = [];

		if (details.filename && details.filename !== filename) loc.push(details.filename);

		if (details.start) loc.push(details.start.line, details.start.column);

		return str + (loc.length ? ` (${loc.join(':')})` : ``);
	}
</script>

<div
	transition:slide={{ duration: 100 }}
	class="message"
	class:info={kind === 'info'}
	class:error={kind === 'error'}
	class:truncate
>
	{#if details}
		{message(details)}
	{:else}
		{@render children?.()}
	{/if}
</div>

<style>
	.message {
		position: relative;
		color: white;
		padding: 12px 16px 12px 44px;
		font: var(--sk-font-ui-small);
		margin: 0;
		border-top: 1px solid var(--sk-border);
	}

	.message::before {
		content: '!';
		position: absolute;
		left: 12px;
		top: 10px;
		text-align: center;
		line-height: 1;
		padding: 4px;
		border-radius: 50%;
		color: white;
		border: 2px solid white;
		box-sizing: content-box;
		width: 10px;
		height: 10px;
		font-size: 1.1rem;
		font-weight: 700;
	}

	.info::before {
		content: 'i';
		font-family: serif;
	}

	/* filled with a cross, so errors differ from info by more than colour */
	.error::before {
		content: '';
		background: white
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M2 2l6 6M8 2l-6 6' stroke='%23da106e' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")
			50% 50% / 10px no-repeat;
	}

	.truncate {
		white-space: pre;
		overflow-x: hidden;
		text-overflow: ellipsis;
	}

	.error {
		background-color: #da106e;
	}

	.info {
		background-color: var(--sk-fg-4);
	}
</style>
