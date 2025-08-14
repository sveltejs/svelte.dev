<script lang="ts">
	import { page } from '$app/stores';
	import { Text } from '@sveltejs/site-kit/components';
	import { setupDocsHovers } from '@sveltejs/site-kit/docs';
	import Byline from '../Byline.svelte';

	let { data } = $props();

	setupDocsHovers();
</script>

<svelte:head>
	<title>{data.metadata.title}</title>

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.metadata.title} />
	<meta name="twitter:description" content={data.metadata.description} />
	<meta name="description" content={data.metadata.description} />

	<meta name="twitter:image" content="https://svelte.dev/blog/{$page.params.slug}/card.png" />
	<meta name="og:image" content="https://svelte.dev/blog/{$page.params.slug}/card.png" />
</svelte:head>

<article>
	<header>
		<h1>{data.metadata.title}</h1>
		<p class="standfirst">{@html data.metadata.description}</p>
		<Byline post={data} />
	</header>

	<Text>{@html data.body}</Text>
</article>

<style>
	article {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) var(--sk-page-padding-bottom);
		max-width: var(--sk-page-content-width);
		box-sizing: content-box;
		margin: 0 auto;

		:global {
			figure {
				margin: 1.6rem 0 3.2rem 0;

				img {
					max-width: 100%;
				}
			}

			video {
				width: 100%;
			}

			aside {
				float: right;
				margin: 0 0 1em 1em;
				width: 16rem;
				z-index: 2;
				color: var(--sk-fg-4);
				font: var(--sk-font-body-small);

				p {
					color: inherit;
					font: inherit;
				}
			}

			.max {
				width: 100%;
			}

			iframe {
				width: 100%;
				height: 420px;
				margin: 2em 0;
				border-radius: var(--sk-border-radius);
				border: 0.8rem solid var(--sk-theme-4);
				box-shadow: 1px 2px 1rem hsla(0 0 0 / 0.08);
			}

			hr {
				position: relative;
				border: none;
				height: 1px;
				background: radial-gradient(circle at center, var(--sk-fg-4), transparent);
				margin: 7rem 0;
				overflow: visible;

				&::after {
					content: '';
					position: absolute;
					width: 0.8rem;
					height: 0.8rem;
					left: 50%;
					top: 2px;
					transform: rotate(45deg) translate(-50%, -50%);
					background: var(--sk-bg-1);
					border: 1px solid var(--sk-fg-4);
				}
			}
		}
	}

	h1 {
		font: var(--sk-font-h1);
	}

	.standfirst {
		font: var(--sk-font-body-small);
		color: var(--sk-fg-3);
		margin: 0 0 1em 0;
	}

	@media (min-width: 960px) {
		article :global {
			.max {
				width: 100vw;
				/* padding: 0 var(--sk-page-padding-side); */
				margin-left: calc(var(--sk-page-content-width) / 2 - 50vw);
				text-align: center;

				& > * {
					width: 100%;
					max-width: 1200px;
				}
			}

			iframe {
				width: 100%;
				max-width: 1100px;
				margin: 2em auto;
			}
		}
	}
</style>
