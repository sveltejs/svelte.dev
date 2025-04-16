<script lang="ts">
	import type { Package } from '$lib/server/content';
	import { ago } from '$lib/time';
	import { format_number } from './utils';

	type Props = {
		pkg: Package;
	};

	let { pkg }: Props = $props();
</script>

<article data-pubdate={pkg.updated}>
	<header>
		<h3>
			{#if pkg.official}
				<!-- TODO use svelte logo -->
				<span class="pill official">official</span>
			{/if}

			<span>{pkg.name}</span>
		</h3>

		<span class="updated">
			<strong>{pkg.version}</strong>
			{ago(new Date(pkg.updated), true)} ago
		</span>
	</header>

	<p class="description">{pkg.description}</p>

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

		<span style="display: flex; gap: 0.75rem">
			<a
				href="https://npmjs.org/package/{pkg.name}"
				target="_blank"
				rel="noreferrer"
				data-icon="npm"
				aria-label="View on npm"
				onclick={(e) => e.stopPropagation()}
			></a>

			{#if pkg.repo_url}
				<a
					href={pkg.repo_url}
					target="_blank"
					rel="noreferrer"
					data-icon="github"
					aria-label="View on GitHub"
					onclick={(e) => e.stopPropagation()}
				></a>
			{/if}

			{#if pkg.homepage}
				<a
					href={pkg.homepage}
					target="_blank"
					rel="noreferrer"
					data-icon="external-link"
					aria-label="View project homepage"
					onclick={(e) => e.stopPropagation()}
				></a>
			{/if}
		</span>
	</p>
</article>

<style>
	header {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
		justify-content: space-between;
		gap: 2rem;

		.updated {
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

		small {
			color: var(--sk-fg-3);
		}

		&.faded {
			color: var(--sk-fg-3);
		}
	}

	article {
		display: grid;
		grid-template-rows: auto 1fr auto;
		box-sizing: border-box;

		height: 100%;
		min-height: 0;

		background-color: var(--sk-bg-2);

		border: 1px solid var(--sk-bg-4);
		border-radius: var(--sk-border-radius);
		padding: 1rem;

		min-height: 16em;

		&:hover {
			filter: drop-shadow(0.2rem, 0.4rem, 1rem rgb(0 0 0 / 0.1));
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

			&:focus {
				/* TODO use a focus ring instead (right now the mask breaks it) */
				background: var(--sk-fg-accent);
			}

			&[data-icon='star'] {
				mask-image: url(icons/star);
			}

			&[data-icon='typescript'] {
				mask-image: url(icons/typescript);
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

			&[data-icon='external-link'] {
				mask-image: url(icons/external-link);
				mask-size: 1.7rem;
			}
		}

		.pill {
			font: var(--sk-font-ui-small);
			border-radius: 9999px;
			padding: 0.2rem 1rem;
			width: fit-content;
			border: 1px solid var(--sk-border);

			&.official {
				border-color: var(--sk-fg-accent);
				color: var(--sk-fg-accent);
				background-color: color-mix(in hsl, var(--sk-fg-accent), transparent 95%);
			}
			&.runes {
				border-color: #4a8cca;
				color: #4a8cca;
				background: linear-gradient(135deg, rgba(74, 140, 202, 0.15), rgba(100, 178, 255, 0.2));
				position: relative;
				overflow: hidden;
				transition: all 0.3s ease;
			}
		}

		.status {
			display: flex;
			align-items: center;
			gap: 0.5rem;

			margin-left: 0.5rem;
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
