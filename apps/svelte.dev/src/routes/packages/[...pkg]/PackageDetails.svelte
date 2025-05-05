<script lang="ts">
	import type { Package } from '$lib/server/content';
	import { ago } from '$lib/time';
	import { format_bytes, format_number } from '../utils';

	type Props = {
		pkg: Package;
	};

	const { pkg }: Props = $props();

	const encoded_pkg = $derived(encodeURIComponent(pkg.name));
</script>

<section>
	<a href="/packages" class="raised"> &nbsp; Back &nbsp;</a>
	<h1>
		{pkg.name}

		<span class="updated">
			{pkg.version}
			<strong title={pkg.updated}>{ago(new Date(pkg.updated), true)}</strong>
		</span>
	</h1>

	<p>{pkg.description}</p>

	<div style="display: flex; gap: 0.75rem">
		<a
			href="https://npmjs.org/package/{pkg.name}"
			target="_blank"
			rel="noreferrer"
			aria-label="View on npm">npm</a
		>

		{#if pkg.repo_url}
			<a href={pkg.repo_url} target="_blank" rel="noreferrer" aria-label="View on GitHub">github</a>
		{/if}

		{#if pkg.homepage}
			<a href={pkg.homepage} target="_blank" rel="noreferrer" aria-label="View project homepage"
				>homepage</a
			>
		{/if}
	</div>

	<br /><br />

	<h2>Package Popularity</h2>

	<p class="stats">
		{#if pkg.downloads}
			<span title="{pkg.downloads} downloads">
				<span data-icon="download"></span>
				{format_number(+pkg.downloads)} (<a href="https://www.npmcharts.com/compare/{pkg.name}"
					>+99% YoY</a
				>)
			</span>
		{/if}

		{#if pkg.github_stars}
			<span title="{pkg.github_stars} Github Stars">
				<span data-icon="star"></span>
				{format_number(pkg.github_stars)} (<a
					href="https://www.star-history.com/#{pkg.repo_url!.substring(
						'https://github.com/'.length
					)}&Date">+99% YoY</a
				>)
			</span>
		{/if}

		{#if pkg.official}
			<span data-icon="svelte"></span>
		{/if}
	</p>

	<br />

	<!-- <Chart history={pkg.downloads_history} /> -->

	<h2>Package Health</h2>

	<p>
		Type definitions: {pkg.typescript ? 'included' : 'missing'}<br />
		Svelte 5 Legacy: {pkg.legacy_svelte ? 'yes' : 'no'}<br />
		Publint errors: 0
	</p>

	<h2>Package Weight</h2>
	<p>
		<a href="https://npmgraph.js.org/?q={encoded_pkg}" title="999 transitive dependencies"
			>999 dependencies</a
		>
	</p>
	<p>
		{format_bytes(pkg.dependency_tree.packages.reduce((acc, pkg) => acc + (pkg.size ?? 0), 0))} in server's
		node_modules
	</p>
	<p>
		<!-- <a href="https://bundlejs.com/?q={encoded_pkg}"
		><img
			src="https://deno.bundlejs.com/?q={encoded_pkg}&badge=minified&badge-style=for-the-badge"
		/></a
	>
	<a href="https://bundlejs.com/?q={encoded_pkg}"
		><img src="https://deno.bundlejs.com/?q={encoded_pkg}&badge&badge-style=for-the-badge" /></a
	> -->
	</p>

	<!-- <div style="width: 100%; overflow-x: auto">
	<img src="/packages/{pkg.name}/graph/dependency.svg" alt="Dependency graph" />
</div> -->

	<!-- <DependencyGraph graph={pkg.dependency_tree} /> -->

	<!-- {#if pkg.dependencies.length}
	<h2>Dependencies</h2>
	<ul>
		{#each pkg.dependencies as { name, semver }}
			<li><span>{name}</span>@<span>{semver}</span></li>
		{/each}
	</ul>
{/if} -->

	{#if pkg.readme}
		<h2>README</h2>

		{@html pkg.readme}
	{/if}
</section>

<style>
	section {
		max-width: 100%;
		width: 100%;
		min-width: 0;

		:global {
			img {
				max-width: 100%;
			}
		}
	}

	*:not(h1, h2) {
		font: var(--sk-font-ui-medium);
	}

	h1 {
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	code {
		font: var(--sk-font-mono);
	}

	.stats {
		display: flex;
		gap: 1rem;
		font: var(--sk-font-ui-medium);
		align-items: center;

		> span {
			display: flex;
			gap: 0.4rem;
			align-items: center;
		}
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
			/* height: 3rem;
			width: 3rem; */
		}

		&[data-icon='download'] {
			mask-image: url(icons/download);
		}

		&[data-icon='svelte'] {
			background: #ff3e00;
			mask-image: url(icons/svelte-cutout);
		}
	}

	.updated {
		display: flex;
		align-items: center;
		gap: 0.8rem;

		color: var(--sk-fg-3);

		strong {
			color: var(--sk-fg-1);
		}
	}
</style>
