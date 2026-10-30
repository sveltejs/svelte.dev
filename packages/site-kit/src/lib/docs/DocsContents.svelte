<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { Document, DocumentSummary } from '../types';

	interface Props {
		contents: DocumentSummary[];
		show_ts_toggle?: boolean;
	}

	let { contents }: Props = $props();

	let nav: HTMLElement;

	afterNavigate(({ from, to }) => {
		const from_topic = from?.params?.topic;
		const to_topic = to?.params?.topic;

		if (from_topic !== undefined && to_topic !== undefined && from_topic !== to_topic) {
			nav.scrollTo(0, 0);
		}
	});
</script>

<nav aria-label="Docs" bind:this={nav}>
	<ul class="sidebar">
		{#each contents ?? [] as section}
			<li>
				<h3>
					{section.metadata.title}
				</h3>

				<ul>
					{#each section.children as { metadata, slug }}
						<li>
							<a
								class="page"
								aria-current={`/${slug}` === page.url.pathname ? 'page' : undefined}
								href="/{slug}"
							>
								{metadata.title}
							</a>
						</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ul>
</nav>

<style>
	nav {
		top: 0;
		left: 0;
		color: var(--sk-fg-2);
		position: relative;
	}

	.sidebar {
		padding: 3.2rem 3.2rem calc(3.2rem + var(--sk-banner-height)) 3.2rem;
		font-family: var(--sk-font-family-body);
		height: 100%;
		bottom: auto;
		width: 100%;
		margin: 0;
	}

	li {
		position: relative;
		display: block;
		margin: 0;
		margin-bottom: 4rem;
		padding-right: 0.5rem; /* leave space for focus ring */
	}

	li:last-child {
		margin-bottom: 0;
	}

	a {
		position: relative;
		transition: color 0.2s;
		border-bottom: none;
		padding: 0;
		color: inherit;
		user-select: none;
	}

	h3 {
		margin: 0 0 0.3rem 0;
	}

	.page {
		display: block;
		font: var(--sk-font-body-small);
	}

	[aria-current='page'] {
		color: var(--sk-fg-accent);
		text-decoration: underline;
	}

	ul ul,
	ul ul li {
		margin: 0;
	}

	@media (min-width: 832px) {
		.sidebar {
			columns: 1;
			padding-left: 3.2rem;
			padding-right: 0;
			padding-top: var(--sk-page-padding-top);
			width: var(--sidebar-menu-width);
			margin: 0 0 0 auto;
		}

		nav {
			max-height: calc(100vh - var(--sk-nav-height));
			overflow-x: hidden;
			overflow-y: auto;
		}

		:global(.scrollbars-invisible) li:has(> [aria-current='page'])::after {
			--size: 1.8rem;
			content: '';
			position: absolute;
			width: var(--size);
			height: var(--size);
			top: calc(1.4rem - var(--size) * 0.5);
			right: calc(-0.5rem - 0.5 * var(--size));
			background-color: var(--sk-bg-1);
			z-index: 2;
			position: absolute;
			rotate: 45deg;
			box-shadow: 0 0 3px rgba(0, 0, 0, 0.12);
		}
	}
</style>
