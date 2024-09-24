<script>
	import '@sveltejs/site-kit/styles/index.css';

	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { Icon, Shell, Banners } from '@sveltejs/site-kit/components';
	import { Nav, Separator } from '@sveltejs/site-kit/nav';
	import { Search, SearchBox } from '@sveltejs/site-kit/search';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	injectSpeedInsights();

	let { data, children: layout_children } = $props();
</script>

<svelte:head>
	{#if !$page.route.id?.startsWith('/blog/')}
		<meta name="twitter:card" content="summary" />
		<meta name="twitter:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" />
		<meta name="og:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" />
	{/if}
</svelte:head>

<Shell nav_visible={$page.route.id !== '/(authed)/repl/[id]/embed'}>
	{#snippet top_nav()}
		<Nav title={data.nav_title} links={data.nav_links}>
			{#snippet search()}
				{#if $page.url.pathname !== '/search'}
					<Search />
				{/if}
			{/snippet}

			{#snippet external_links()}
				<a href="/chat" title="Discord Chat">
					<span class="small">Discord</span>
					<span class="large"><Icon name="discord" /></span>
				</a>

				<a href="https://github.com/sveltejs/svelte" title="GitHub Repo">
					<span class="small">GitHub</span>
					<span class="large"><Icon name="github" /></span>
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
</style>
