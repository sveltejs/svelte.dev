<script>
	import { SearchResults } from '@sveltejs/site-kit/search';

	export let data;
</script>

<svelte:head>
	<title>Search • Svelte</title>
</svelte:head>

<main>
	<form>
		<input
			name="q"
			value={data.query}
			type="search"
			aria-label="Search"
			placeholder="Search"
			spellcheck="false"
		/>
	</form>

	<SearchResults results={data.results} query={data.query} />
</main>

<style>
	main {
		--padding: 1rem;
		max-width: 64rem;
		margin: 0 auto;
		padding: 8rem 1rem;
		font-family: var(--sk-font-ui);
	}

	form {
		--size: 2rem;
		position: relative;
		width: 100%;
		margin: 0 0 2rem 0;
	}

	input {
		display: block;
		width: 100%;
		height: 100%;
		font-family: inherit;
		font-size: var(--sk-font-size-h2);
		border: none;
		border-radius: var(--sk-border-radius);
		padding: 2rem 2rem 2rem 5rem;
		background: no-repeat 1rem 50% / 3rem 3rem url(/icons/search.svg);
		color: var(--sk-text-1);
	}
</style>
