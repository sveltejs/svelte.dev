<script>
	export let data;
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
<div class="posts stretch">
	{#each data.posts as post}
		{#if !post.metadata.draft}
			<article class="post" data-pubdate={post.date}>
				<a href="/{post.slug}" title="Read the article »">
					<h2>{post.metadata.title}</h2>
					<p>{post.metadata.description}</p>
				</a>
			</article>
		{/if}
	{/each}
</div>

<style>
	.posts {
		grid-template-columns: 1fr 1fr;
		grid-gap: 1em;
		min-height: calc(100vh - var(--sk-nav-height) - var(--sk-banner-bottom-height));
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 6rem var(--sk-page-padding-side);
		max-width: var(--sk-page-main-width);
		margin: 0 auto;
		text-wrap: balance;
	}

	h2 {
		display: inline-block;
		color: var(--sk-text-2);
		font-size: var(--sk-font-size-h3);
	}

	.post {
		margin: 2em 0;

		&:where(:first-child, :nth-child(2))::before {
			content: 'Latest post • ' attr(data-pubdate);
			color: var(--sk-text-4);
			font-family: var(--sk-font-ui);
			font-size: var(--sk-font-size-ui-small);
			font-weight: 400;
			text-transform: uppercase;
		}

		&:nth-child(2)::before {
			content: 'Older posts';
		}

		&:first-child {
			margin: 0 0 2rem 0;
			padding: 0 0 4rem 0;

			h2 {
				font-size: 4rem;
				font-weight: 400;
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
</style>
