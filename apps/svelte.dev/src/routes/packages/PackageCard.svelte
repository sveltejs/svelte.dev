<script lang="ts">
	import type { Package } from '$lib/server/content';
	import { format_number } from './utils';

	type Props = {
		pkg: Package;
	};

	let { pkg }: Props = $props();
</script>

<article data-pubdate={pkg.updated}>
	<span class="header">
		<h3 class={[(pkg.outdated || pkg.deprecated) && 'faded']}>
			{pkg.name}

			{#if pkg.typescript}
				<span data-icon="typescript"></span>
			{/if}
		</h3>

		<span class="status">
			{#if pkg.runes}
				<span class="pill runes">runes</span>
			{/if}
			{#if pkg.outdated}
				<span class="pill">outdated</span>
			{/if}
			{#if pkg.deprecated}
				<span class="pill">deprecated</span>
			{/if}
			{#if pkg.official}
				<span class="pill official">official</span>
			{/if}
		</span>
	</span>

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
	.header {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
		justify-content: space-between;
	}

	h3 {
		display: inline-block;
		font: var(--sk-font-ui-medium);

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

		.status {
			display: flex;
			align-items: center;
			gap: 0.5rem;

			margin-left: 0.5rem;

			> .pill {
				font: var(--sk-font-ui-small);
				border-radius: 9999px;
				padding: 0.2rem 1rem;
				width: fit-content;
				border: 1px solid var(--sk-border);
			}

			.official {
				border-color: var(--sk-fg-accent);
				color: var(--sk-fg-accent);
				background-color: color-mix(in hsl, var(--sk-fg-accent), transparent 95%);
			}
			.runes {
				border-color: #4a8cca;
				color: #4a8cca;
				background: linear-gradient(135deg, rgba(74, 140, 202, 0.15), rgba(100, 178, 255, 0.2));
				position: relative;
				overflow: hidden;
				transition: all 0.3s ease;
			}
			.runes:hover::before,
			.runes:hover::after {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				pointer-events: none;
			}
			.runes::before {
				background-image: radial-gradient(circle at 15% 20%, #7ab5e8 1px, transparent 1px),
					radial-gradient(circle at 85% 30%, #7ab5e8 1px, transparent 1px),
					radial-gradient(circle at 25% 75%, #7ab5e8 1px, transparent 1px),
					radial-gradient(circle at 70% 80%, #7ab5e8 1px, transparent 1px),
					radial-gradient(circle at 45% 10%, #7ab5e8 1px, transparent 1px),
					radial-gradient(circle at 90% 60%, #7ab5e8 1px, transparent 1px);
				opacity: 0.35;
			}
			.runes::after {
				background-image: radial-gradient(circle at 60% 15%, #a3d0ff 1.2px, transparent 1.2px),
					radial-gradient(circle at 30% 65%, #a3d0ff 1.2px, transparent 1.2px),
					radial-gradient(circle at 80% 40%, #a3d0ff 1.5px, transparent 1.5px);
				opacity: 0.4;
			}
			.runes:hover::after {
				animation: twinkle 4s infinite alternate;
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
			/* max-width: calc(100% - var(--sidebar-width)); */
		}
	}

	@keyframes twinkle {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.7;
		}
	}
</style>
