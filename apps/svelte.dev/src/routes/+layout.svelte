<script lang="ts">
	import '@sveltejs/site-kit/styles/index.css';
	import { browser, dev } from '$app/environment';
	import { page } from '$app/state';
	import { Shell, Banner } from '@sveltejs/site-kit/components';
	import { Nav } from '@sveltejs/site-kit/nav';
	import { SearchBox } from '@sveltejs/site-kit/search';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { inject } from '@vercel/analytics';
	import { beforeNavigate } from '$app/navigation';

	injectSpeedInsights();
	inject({ mode: dev ? 'development' : 'production' });

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

	const sections: Record<string, string> = {
		docs: 'Docs',
		packages: 'Packages',
		playground: 'Playground',
		blog: 'Blog',
		tutorial: 'Tutorial',
		search: 'Search'
	};
</script>

<svelte:head>
	{#if !page.route.id || !(page.route.id.startsWith('/blog/') || /^\/docs\/[^\/]+\/[^\/]+$/.test(page.route.id))}
		<meta name="twitter:card" content="summary" />
		<meta name="twitter:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" />
		<meta name="og:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" />
	{/if}
</svelte:head>

<Shell nav_visible={page.route.id !== '/(authed)/playground/[id]/embed'}>
	{#snippet top_nav()}
		<Nav title={sections[page.url.pathname.split('/')[1]!] ?? ''} links={data.nav_links} />
	{/snippet}

	{#snippet children()}
		{@render layout_children()}
	{/snippet}

	{#snippet banner()}
		{#if data.banner}
			<Banner banner={data.banner} />
		{/if}
	{/snippet}
</Shell>

{#if browser}
	<SearchBox />
{/if}
