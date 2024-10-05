<script lang="ts">
	let { data } = $props();

	const featured = data.posts.filter((post) => !post.metadata.title.startsWith('What’s new'));
	const top = data.posts[0];
</script>

<svelte:head>
	<title>Blog • Svelte</title>
	<link
		rel="alternate"
		type="application/rss+xml"
		title="Svelte blog"
		href="https://svelte.dev/blog/rss.xml"
	/>

	<meta name="twitter:title" content="Svelte blog" />
	<meta name="twitter:description" content="Articles about Svelte and UI development" />
	<meta name="Description" content="Articles about Svelte and UI development" />
</svelte:head>

<h1 class="visually-hidden">Blog</h1>

<div class="container">
	{#snippet article(post: any)}
		<article class:feature={!post.metadata.title.startsWith('What’s new')} data-pubdate={post.date}>
			<a href="/{post.slug}" title="Read the article »">
				<h2>{post.metadata.title.replace('What’s new in Svelte: ', '')}</h2>
				<p>{post.metadata.description}</p>
			</a>
		</article>
	{/snippet}

	<article class="top" data-pubdate={top.date}>
		<a href="/{top.slug}" title="Read the article »">
			<h2>{top.metadata.title}</h2>
			<p>{top.metadata.description}</p>
		</a>
	</article>

	<div class="grid">
		<div class="featured posts">
			{#each featured.slice(1) as post}
				<article
					class:feature={!post.metadata.title.startsWith('What’s new')}
					data-pubdate={post.date}
				>
					<a href="/{post.slug}" title="Read the article »">
						<h2>{post.metadata.title}</h2>
						<p>{post.metadata.description}</p>
					</a>
				</article>
			{/each}
		</div>

		<div class="feed posts">
			{#each data.posts.filter((post) => post !== top) as post}
				<article
					class:feature={!post.metadata.title.startsWith('What’s new')}
					data-pubdate={post.date}
				>
					<a href="/{post.slug}" title="Read the article »">
						<h2>{post.metadata.title.replace('What’s new in Svelte: ', '')}</h2>
						<p>{post.metadata.description}</p>
					</a>
				</article>
			{/each}
		</div>
	</div>
</div>

<style>
	.container {
		max-width: var(--sk-page-content-width);
		box-sizing: content-box;
		margin: 0 auto;
		text-wrap: balance;
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side);
	}

	h2 {
		display: inline-block;
		color: var(--sk-text-2);
		font-size: var(--sk-font-size-h3);
	}

	article {
		margin: 2em 0;

		/* we need to use :global because snippets don't currently cause a deopt */
		&.top {
			margin: 0 0 2rem 0;
			padding: 0 0 4rem 0;

			h2 {
				font-size: var(--sk-font-size-h1);
				color: var(--sk-text-2);
			}
		}

		a {
			display: block;
			text-decoration: none;

			&:hover h2 {
				text-decoration: underline;
			}
		}

		p {
			font-size: var(--sk-font-size-body-small);
			color: var(--sk-text-3);
			margin: 0;
		}
	}

	.featured {
		display: none;
	}

	@media (max-width: 799px) {
		article:not(.feature) h2::before {
			content: 'What’s new in Svelte: ';
		}
	}

	@media (min-width: 800px) {
		.grid {
			display: grid;
			grid-template-columns: 2fr 1fr;
			gap: 3em;
		}

		.featured {
			display: block;

			&::before {
				content: 'Featured posts';
				font-family: var(--sk-font-ui);
				font-size: var(--sk-font-size-ui-medium);
				text-transform: uppercase;
				color: var(--sk-text-4);
			}

			article {
				h2 {
					font-size: var(--sk-font-size-h2);
				}
			}
		}

		.feed {
			&::before {
				content: 'What’s new';
				font-family: var(--sk-font-ui);
				font-size: var(--sk-font-size-ui-medium);
				text-transform: uppercase;
				color: var(--sk-text-4);
			}

			.feature {
				display: none;
			}

			article {
				h2 {
					font-size: var(--sk-font-size-h3);
				}

				p {
					display: none;
				}
			}
		}
	}
</style>
