<script lang="ts">
	import '@sveltejs/site-kit/styles/index.css';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { Shell, Banners } from '@sveltejs/site-kit/components';
	import { Nav } from '@sveltejs/site-kit/nav';
	import { Search, SearchBox } from '@sveltejs/site-kit/search';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { beforeNavigate } from '$app/navigation';

	injectSpeedInsights();

	// Make all navigations between SvelteKit-tutorial and non-SvelteKit-tutorial pages (and vice versa)
	// a full page navigation to ensure webcontainers get the correct origin restriction headers while
	// ensuring those headers don't interfere with the rest of the page. These headers would have bad
	// consequences on how we have to handle integration of images etc from other domains for example.
	beforeNavigate(({ from, to, cancel }) => {
		if (!from || !to) return;

		if (
			from.url.pathname.startsWith('/tutorial/kit/') !== to.url.pathname.startsWith('/tutorial/kit')
		) {
			cancel();
			location.href = to.url.href;
		}
	});

	let { data, children: layout_children } = $props();
</script>

<svelte:head>
	{#if !$page.route.id?.startsWith('/blog/')}
		<meta name="twitter:card" content="summary" />
		<meta name="twitter:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" />
		<meta name="og:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" />
	{/if}
</svelte:head>

<Shell nav_visible={$page.route.id !== '/(authed)/playground/[id]/embed'}>
	{#snippet top_nav()}
		<Nav
			title={data.nav_title}
			links={data.nav_links}
			shadow={!$page.route.id?.startsWith('/(authed)/playground')}
		>
			{#snippet search()}
				<Search />
			{/snippet}

			{#snippet external_links()}
				<a href="/chat" data-icon="discord" title="Discord Chat">
					<span>Discord</span>
				</a>

				<a href="https://github.com/sveltejs/svelte" data-icon="github" title="GitHub Repo">
					<span>GitHub</span>
				</a>
			{/snippet}
		</Nav>
	{/snippet}

	{#snippet children()}
		{@render layout_children()}
	{/snippet}

	{#snippet banner_bottom()}
		<Banners data={data.banner} />
	{/snippet}
</Shell>

{#if browser}
	<SearchBox />
{/if}

<style>
	:global(:root) {
		color-scheme: light dark;
	}

	:global(html, body) {
		height: 100%;
		width: 100%;
	}

	@media (min-width: 800px) {
		[data-icon] {
			background: no-repeat 50% 50%;
			background-size: calc(100% - 1rem) auto;
			padding: 0 0.5rem;
			opacity: 0.6;

			:global(.dark) & {
				opacity: 0.8;
			}

			/* visually hidden, but visible to screen readers */
			span {
				clip: rect(0 0 0 0);
				clip-path: inset(50%);
				height: 1px;
				overflow: hidden;
				position: absolute;
				white-space: nowrap;
				width: 1px;
			}
		}

		[data-icon='discord'] {
			width: 3.4rem;
			background-image: url($lib/icons/discord-black.svg);

			:global(.dark) & {
				background-image: url($lib/icons/discord-white.svg);
			}
		}

		[data-icon='github'] {
			width: 3rem;
			background-image: url($lib/icons/github-black.svg);

			:global(.dark) & {
				background-image: url($lib/icons/github-white.svg);
			}
		}
	}
</style>
