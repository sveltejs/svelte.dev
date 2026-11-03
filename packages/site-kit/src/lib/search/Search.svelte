<!-- @component
Renders a search widget which when clicked (or the corresponding keyboard shortcut is pressed) opens a search overlay.
-->
<script lang="ts">
	import { BROWSER } from 'esm-env';
	import { search } from '../state/search.svelte';

	let { q = '', label = 'Search' }: { q?: string; label?: string } = $props();

	const id = $props.id();
</script>

<form class="search-container" action="/search">
	<label for={id} class:hidden={q}>{label}</label>

	<input
		{id}
		value={q}
		oninput={(e) => {
			search.query = e.currentTarget.value;
			search.active = true;
			e.currentTarget.value = '';
			e.currentTarget.blur();
		}}
		onmousedown={(event) => {
			event.preventDefault();
			event.currentTarget.blur();
			search.active = true;
		}}
		ontouchend={(event) => {
			event.preventDefault();
			event.currentTarget.blur();
			search.active = true;
		}}
		type="search"
		name="q"
		spellcheck="false"
	/>

	{#if BROWSER}
		<div class="shortcut">
			<kbd>{navigator.platform === 'MacIntel' ? '⌘' : 'Ctrl'}</kbd> <kbd>K</kbd>
		</div>
	{/if}
</form>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.search-container {
		position: relative;
		display: flex;
		align-items: center;
		width: 11rem;
		font-size: 1.4rem;
	}

	input {
		position: relative;
		padding: 0.5em 0.5em 0.4em 2em;
		border: none;
		font-family: inherit;
		font-size: 1em;
		appearance: none;
		-webkit-appearance: none;
		width: 100%;
		height: 3.4rem;
		border-radius: 5.6rem;
		background:
			no-repeat 0.6em 55% / 1.2em 1.2em url(icons/search),
			var(--sk-bg-4);
	}

	input:focus + .shortcut {
		display: none;
	}

	/* clicks must reach the input, which opens the search */
	label {
		position: absolute;
		left: 2.8rem;
		z-index: 1;
		pointer-events: none;
		text-transform: lowercase;
		color: var(--sk-fg-4);
	}

	label.hidden {
		clip-path: inset(50%);
		width: 1px;
		height: 1px;
		overflow: hidden;
		white-space: nowrap;
	}

	@media (max-width: 59.9375em) {
		label {
			clip-path: inset(50%);
			width: 1px;
			height: 1px;
			overflow: hidden;
			white-space: nowrap;
		}
	}

	.shortcut {
		position: absolute;
		top: calc(50% - 0.9rem);
		right: 1.6rem;
		width: 100%;
		text-align: right;
		pointer-events: none;
		font-size: 1.2rem;
		text-transform: uppercase;
		animation: fade-in 0.2s;
	}

	kbd {
		color: var(--sk-fg-4);
		font-size: inherit;
		font-family: inherit;
	}

	@media (min-width: 60em) {
		.search-container {
			width: 19rem;
		}
	}
</style>
