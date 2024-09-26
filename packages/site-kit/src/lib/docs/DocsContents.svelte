<script lang="ts">
	import { page } from '$app/stores';
	import type { Document } from '../types';

	interface Props {
		contents: Document[];
		show_ts_toggle?: boolean;
	}

	let { contents }: Props = $props();
</script>

<nav aria-label="Docs">
	<ul class="sidebar">
		{#each contents ?? [] as section}
			<li>
				<span class="section">
					{section.metadata.title}
				</span>

				<ul>
					{#each section.children as { metadata, slug }}
						<li>
							<a
								class="page"
								aria-current={`/${slug}` === $page.url.pathname ? 'page' : undefined}
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
		color: var(--sk-text-3);
		position: relative;
	}

	.sidebar {
		padding: 3.2rem;
		font-family: var(--sk-font-body);
		height: 100%;
		bottom: auto;
		width: 100%;
		/* columns: 2; */
		margin: 0;
	}

	li {
		display: block;
		line-height: 1.2;
		margin: 0;
		margin-bottom: 4rem;
	}

	li:last-child {
		margin-bottom: 0;
	}

	a {
		position: relative;
		transition: color 0.2s;
		border-bottom: none;
		padding: 0;
		color: var(--sk-text-3);
		user-select: none;
	}

	.section {
		display: block;
		padding-bottom: 0.8rem;
		font-size: var(--sk-text-m);
		font-family: var(--sk-font-heading);
		font-weight: 500;
		color: var(--sk-text-2);
	}

	.page {
		display: block;
		font-size: 1.6rem;
		font-family: var(--sk-font-body);
		padding-bottom: 0.6em;
	}

	[aria-current='page'] {
		/* font-weight: 700; */
		color: var(--sk-text-1);
	}

	ul ul,
	ul ul li {
		margin: 0;
	}

	@media (max-width: 831px) {
		.sidebar {
			padding: 1rem;
			padding-top: 1rem;
		}

		li {
			margin-bottom: 2.5rem;
		}

		a {
			border-radius: var(--sk-border-radius);
			line-height: 1;
			vertical-align: center;
			padding: 0.9rem 0.75rem !important;
			transition: 0.1s ease;
			transition-property: background-color, color;
		}

		a:hover {
			text-decoration: none;

			background-color: var(--sk-back-4);
		}

		[aria-current='page'] {
			background-color: hsla(var(--sk-theme-1-hsl), 0.1) !important;
			color: var(--sk-theme-1) !important;
			font-weight: 400;
		}
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

		:global(.scrollbars-invisible) [aria-current='page']::after {
			--size: 1.8rem;
			content: '';
			position: absolute;
			width: var(--size);
			height: var(--size);
			top: calc(0.8rem - var(--size) * 0.5);
			right: calc(-0.5 * var(--size));
			background-color: var(--sk-back-1);
			z-index: 2;
			position: absolute;
			rotate: 45deg;
			/** needed to synchronise with transition on `*` in `base.css` */
			transition: background-color 0.5s var(--quint-out);
			box-shadow: 0 0 3px rgba(0, 0, 0, 0.12);
		}
	}
</style>
