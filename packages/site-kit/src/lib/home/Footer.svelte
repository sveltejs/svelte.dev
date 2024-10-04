<script lang="ts">
	import Section from '../components/Section.svelte';
	import type { Snippet } from 'svelte';

	let {
		links,
		copyright,
		license
	}: {
		links: Record<string, { href: string; title: string }[]>;
		copyright?: Snippet;
		license?: Snippet;
	} = $props();
</script>

<Section --background="var(--sk-back-4)">
	<footer>
		<div class="logo"></div>

		{#each Object.entries(links) as [title, inner_links]}
			<div class="links">
				<h2>{title}</h2>
				{#each inner_links as { href, title }}
					<a {href}>{title}</a>
				{/each}
			</div>
		{/each}

		<div class="copyright">
			{#if copyright}{@render copyright()}{:else}
				© 2024 <a href="https://github.com/sveltejs/svelte/graphs/contributors">
					Svelte contributors
				</a>
			{/if}
		</div>

		<div class="open-source">
			{@render license?.()}
		</div>
	</footer>
</Section>

<style>
	footer {
		max-width: 120rem;
		font-size: var(--sk-font-size-body-small);
		padding: 0 var(--sk-page-padding-side);
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: 1fr;
		grid-row-gap: 6rem;
	}

	footer .logo {
		display: none;
		background: url('@sveltejs/site-kit/branding/svelte-logo.svg');
		background-repeat: no-repeat;
		background-size: 8rem;
		filter: grayscale(100%) opacity(84%);
	}

	footer h2 {
		font-size: var(--sk-font-size-h3);
		padding-bottom: 1rem;
	}

	.links a {
		color: var(--sk-text-2);
		font-size: var(--sk-font-size-body-small);
		display: block;
		line-height: 1.8;
	}

	.open-source {
		display: none;
		grid-column: span 2;
	}

	.copyright {
		grid-column: span 2;
	}

	@media (min-width: 500px) {
		footer {
			grid-template-columns: repeat(3, 1fr);
		}

		footer .logo {
			display: block;
		}

		.copyright {
			grid-column: span 1;
		}

		.open-source {
			display: block;
		}
	}
</style>
