<script lang="ts">
	import Icon from '../components/Icon.svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	let { code }: { code: string } = $props();

	let copying = $state(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
		} catch {
			/**
			 * This is the fallback deprecated way of copying text to the clipboard. Only runs if it can't find the clipboard API.
			 * Taken from https://github.com/ghostdevv/svelte-copy/blob/main/src/lib/copy.ts
			 */
			const element = document.createElement('input');

			element.type = 'text';
			element.disabled = true;

			element.style.cssText = `position: fixed;z-index: -100;pointer-events: none;opacity: 0;`;

			element.value = code;

			document.body.appendChild(element);

			element.click();
			element.select();
			document.execCommand('copy');

			document.body.removeChild(element);
		} finally {
			copying = true;

			setTimeout(() => {
				copying = false;
			}, 1000);
		}
	}
</script>

<button class="copy-to-clipboard-button" onclick={copy}>
	{#if copying}
		<span transition:fade={{ easing: cubicOut, duration: 400 }}>
			<Icon name="copy-to-clipboard-filled" />
		</span>
	{:else}
		<span transition:fade={{ easing: cubicOut, duration: 400 }}>
			<Icon name="copy-to-clipboard-empty" />
		</span>
	{/if}
	<span class="visually-hidden">copy to clipboard</span>
</button>

<style>
	:global(.code-block .copy-to-clipboard-button) {
		top: 5px;
	}

	button {
		position: absolute;
		top: 1rem;
		right: 1rem;

		display: grid;
		place-items: center;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;

		opacity: 0.5;

		height: 2.4rem;
		width: 2.4rem;

		overflow: hidden;

		transition: opacity 0.1s ease-in-out;
	}

	button:hover {
		opacity: 0.7;
	}

	span {
		grid-column: 1 / span 1;
		grid-row: 1 / span 1;
	}

	button :global(svg) {
		stroke-width: 0 !important;
	}
</style>
