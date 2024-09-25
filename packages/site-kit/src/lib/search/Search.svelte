<!-- @component
Renders a search widget which when clicked (or the corresponding keyboard shortcut is pressed) opens a search overlay.
-->
<script lang="ts">
	import { BROWSER } from 'esm-env';
	import { search_query, searching } from '../stores/search';

	let { q = '', label = 'Search' }: { q?: string; label?: string } = $props();
</script>

<form class="search-container" action="/search">
	<input
		value={q}
		oninput={(e) => {
			$searching = true;
			$search_query = e.currentTarget.value;
			e.currentTarget.value = '';
		}}
		onmousedown={(event) => {
			event.preventDefault();
			$searching = true;
		}}
		ontouchend={(event) => {
			event.preventDefault();
			$searching = true;
		}}
		type="search"
		name="q"
		placeholder={label}
		aria-label={label}
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
		width: 100%;
	}

	input {
		position: relative;
		padding: 0.5em 0.5em 0.4em 2em;
		border: none;
		font-family: inherit;
		font-size: 1.4rem;
		appearance: none;
		-webkit-appearance: none;
		width: 100%;
		height: 4.2rem;
		border-radius: 3.5rem;
		background:
			no-repeat 1rem 50% / 1em 1em url(../icons/search.svg),
			var(--sk-back-4);
		color: var(--sk-text-3);
	}

	input:focus + .shortcut {
		display: none;
	}

	input::placeholder {
		font-size: 1.2rem;
		text-transform: lowercase;
		color: var(--sk-text-3);
		transform: translateY(-1px);
	}

	.shortcut {
		color: var(--sk-text-3);
		position: absolute;
		top: calc(50% - 0.9rem);
		right: 0;
		width: 100%;
		text-align: right;
		pointer-events: none;
		font-size: 1.2rem;
		text-transform: uppercase;
		animation: fade-in 0.2s;
	}

	kbd {
		display: none;
		color: var(--sk-text-3);
		font-size: inherit;
		font-family: inherit;
	}

	@media (min-width: 800px) {
		.search-container {
			width: 11rem;
			margin: 0 1rem;
		}

		.shortcut {
			padding: 0 1.6rem 0 0;
		}

		input {
			height: 3.4rem;
			border-radius: 5.6rem;
		}

		input::placeholder {
			opacity: 0;
		}

		/* we're using media query as an imperfect proxy for mobile/desktop */
		kbd {
			display: inline;
		}
	}

	@media (min-width: 960px) {
		.search-container {
			width: 19rem;
		}

		input::placeholder {
			opacity: 1;
		}
	}

	@media (min-width: 1240px) {
		.search-container {
			width: 19rem;
		}
	}
</style>
