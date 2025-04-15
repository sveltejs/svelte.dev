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
		</h3>
		<span class="status">
			{#if pkg.typescript}
				<span style="translate: 0 2px;">
					{#if pkg.typescript}
						<svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24"
							><!-- Icon from Simple Icons by Simple Icons Collaborators - https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md --><path
								fill="currentColor"
								d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75q.918 0 1.627.111a6.4 6.4 0 0 1 1.306.34v2.458a4 4 0 0 0-.643-.361a5 5 0 0 0-.717-.26a5.5 5.5 0 0 0-1.426-.2q-.45 0-.819.086a2.1 2.1 0 0 0-.623.242q-.254.156-.393.374a.9.9 0 0 0-.14.49q0 .294.156.529q.156.234.443.444c.287.21.423.276.696.41q.41.203.926.416q.705.296 1.266.628q.561.333.963.753q.402.418.614.957q.213.538.214 1.253q0 .986-.373 1.656a3 3 0 0 1-1.012 1.085a4.4 4.4 0 0 1-1.487.596q-.85.18-1.79.18a10 10 0 0 1-1.84-.164a5.5 5.5 0 0 1-1.512-.493v-2.63a5.03 5.03 0 0 0 3.237 1.2q.5 0 .872-.09q.373-.09.623-.25q.249-.162.373-.38a1.02 1.02 0 0 0-.074-1.089a2.1 2.1 0 0 0-.537-.5a5.6 5.6 0 0 0-.807-.444a28 28 0 0 0-1.007-.436q-1.377-.575-2.053-1.405t-.676-2.005q0-.92.369-1.582q.368-.662 1.004-1.089a4.5 4.5 0 0 1 1.47-.629a7.5 7.5 0 0 1 1.77-.201m-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"
							/></svg
						>
					{/if}
				</span>
			{/if}

			<span style="flex: 1 1 auto"></span>

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
	}

	h3 {
		display: inline-block;
		font: var(--sk-font-ui-medium);

		/* flex: 1 1 auto; */

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

		.status {
			flex: 1 1 auto;

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

			[data-icon] {
				display: flex;
				width: 1.4rem;
				height: 1.4rem;
				background: currentColor;
				mask: no-repeat 50% 50%;
				mask-size: contain;
			}

			[data-icon='star'] {
				mask-image: url(icons/star);
			}

			[data-icon='download'] {
				mask-image: url(icons/download);
			}

			[data-icon='github'] {
				mask-image: url(icons/github);
			}

			[data-icon='npm'] {
				mask-image: url(icons/npm);
			}

			[data-icon='external-link'] {
				mask-image: url(icons/external-link);
				mask-size: 1.7rem;
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
