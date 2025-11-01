<script lang="ts">
	import type { Package } from '$lib/server/content';
	import { ago } from '$lib/time';
	import { format_number } from './utils';
	import { logos } from 'logos';

	type Props = {
		pkg: Package;
	};

	let { pkg }: Props = $props();

	const formatter = new Intl.DateTimeFormat(undefined, {
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	});

	const href = $derived(
		pkg.homepage?.replace('https://svelte.dev', '') ||
			pkg.repo_url ||
			`https://npmjs.org/package/${pkg.name}`
	);
</script>

<article>
	<a
		class="contents"
		{href}
		target={href.startsWith('/') ? null : '_blank'}
		rel="noreferrer"
		aria-label="View project homepage"
		onclick={(e) => e.stopPropagation()}
	>
		<header>
			<h3>
				{#if pkg.official}
					<span data-icon="svelte"></span>
				{/if}

				<span>{pkg.name}</span>
			</h3>

			<span class="updated">
				{pkg.version}

				<strong title={formatter.format(new Date(pkg.updated))}>
					{ago(new Date(pkg.updated), true)}
				</strong>
			</span>
		</header>

		<p class="description">{pkg.description}</p>

		{#if pkg.svAlias}
			<img class="logo" alt="{pkg.name} logo" src={logos[pkg.svAlias]} />
		{:else}
			<p class="stats">
				{#if pkg.downloads}
					<span title="{pkg.downloads} downloads">
						<span data-icon="download"></span>
						{format_number(+pkg.downloads)}
					</span>
				{/if}

				{#if pkg.github_stars}
					<span title="{pkg.github_stars} Github Stars">
						<span data-icon="star"></span>
						{format_number(pkg.github_stars)}
					</span>
				{/if}

				<span style="flex: 1 1 auto"></span>
			</p>
		{/if}
	</a>

	<!-- this is a sibling element so that we don't have links inside links -->
	{#if !pkg.svAlias}
		<div class="links">
			<span>
				<a
					href="https://npmjs.org/package/{pkg.name}"
					target="_blank"
					rel="noreferrer"
					aria-label="View on npm"
					onclick={(e) => e.stopPropagation()}
				>
					<span data-icon="npm"></span>
				</a>

				{#if pkg.repo_url}
					<a
						href={pkg.repo_url}
						target="_blank"
						rel="noreferrer"
						aria-label="View on GitHub"
						onclick={(e) => e.stopPropagation()}
					>
						<span data-icon="github"></span>
					</a>
				{/if}
			</span>
		</div>
	{/if}
</article>

<style>
	header {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
		justify-content: space-between;
		gap: 1.5rem;

		.updated {
			display: flex;
			gap: 0.8rem;
			font: var(--sk-font-ui-small);
			color: var(--sk-fg-3);

			strong {
				color: var(--sk-fg-1);
			}
		}
	}

	h3 {
		display: inline-block;
		font: var(--sk-font-ui-medium);

		a:hover & span:not([data-icon]) {
			text-decoration: underline;
		}
	}

	article {
		display: grid;
		background-color: var(--sk-bg-1);

		border-radius: var(--sk-border-radius);
		filter: drop-shadow(0.2rem 0.4rem 0.6rem rgb(0 0 0 / 0.07));

		min-height: 16em;

		:root:not(.light) & {
			@media (prefers-color-scheme: dark) {
				background-color: var(--sk-bg-3);
			}
		}

		:root.dark & {
			background-color: var(--sk-bg-3);
		}

		&:hover {
			filter: drop-shadow(0.3rem 0.5rem 0.7rem rgb(0 0 0 / 0.1));
		}

		.contents {
			display: grid;
			grid-template-rows: auto 1fr auto;
			box-sizing: border-box;
			padding: 1rem;

			height: 100%;
			min-height: 0;
		}

		.links {
			position: absolute;
			right: 1.3rem;
			bottom: 1.3rem;

			a {
				width: 1.4rem;
				height: 1.4rem;

				@media screen and (max-width: 768px) {
					width: 2.4rem;
					height: 2.4rem;
				}
			}

			a:focus-visible {
				outline: 2px solid var(--sk-fg-accent);
			}

			> span {
				display: flex;
				gap: 0.75rem;
				@media screen and (max-width: 768px) {
					gap: 1rem;

					[data-icon] {
						width: 2.4rem;
						height: 2.4rem;
					}
				}
			}
		}

		a {
			display: block;
			text-decoration: none;
			color: inherit;
		}

		[data-icon] {
			position: relative;
			display: inline-flex;
			width: 1.4rem;
			height: 1.4rem;
			background: currentColor;
			mask: no-repeat 50% 50%;
			mask-size: contain;

			&[data-icon='star'] {
				mask-image: url(icons/star);
			}

			&[data-icon='download'] {
				mask-image: url(icons/download);
			}

			&[data-icon='github'] {
				mask-image: url(icons/github);
			}

			&[data-icon='npm'] {
				mask-image: url(icons/npm);
			}

			&[data-icon='svelte'] {
				background: #ff3e00;
				mask-image: url(icons/svelte-cutout);
				top: 0.2rem;
			}
		}

		.stats {
			display: flex;
			gap: 1rem;
			font: var(--sk-font-ui-small);

			> span {
				display: flex;
				gap: 0.4rem;
				align-items: center;
			}
		}

		.logo {
			width: 3rem;
			height: 3rem;

			:root:not(.light) &[alt='drizzle logo'],
			:root:not(.light) &[alt='paraglide logo'] {
				@media (prefers-color-scheme: dark) {
					filter: invert(1);
				}
			}

			:root.dark &[alt='drizzle logo'],
			:root.dark &[alt='paraglide logo'] {
				filter: invert(1);
			}
		}

		.description {
			font: var(--sk-font-ui-small);
			color: var(--sk-fg-3);
			margin: 0 0 0.5em 0;
			flex: 1;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			line-clamp: 2;
			overflow: hidden;
			text-overflow: ellipsis;
			max-height: 2lh;
		}
	}
</style>
