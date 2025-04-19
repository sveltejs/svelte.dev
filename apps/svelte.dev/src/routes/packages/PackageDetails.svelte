<script lang="ts">
	import type { Package } from '$lib/server/content';
	import { ago } from '$lib/time';
	import { format_bytes, format_number } from './utils';

	type Props = {
		pkg: Package;
		deselect: () => void;
	};

	const { pkg, deselect }: Props = $props();
</script>

<button onclick={deselect} class="raised"> &nbsp; Back &nbsp;</button>
<h1>
	{pkg.name}

	<span class="updated">
		{pkg.version}
		<strong title={pkg.updated}>{ago(new Date(pkg.updated), true)}</strong>
	</span>
</h1>

<p>{pkg.description}</p>

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

	{#if pkg.typescript}
		<span data-icon="typescript"></span>
	{/if}

	{#if pkg.official}
		<span data-icon="svelte"></span>
	{/if}

	<span style="display: flex; gap: 0.75rem">
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
	</span>
</p>

<code>pnpm add {pkg.name}</code>

<br /><br /><br />

{#if pkg.dependencies.length}
	<h2>Dependencies</h2>
	<ul>
		{#each pkg.dependencies as { name, semver }}
			<li><span>{name}</span>@<span>{semver}</span></li>
		{/each}
	</ul>
{/if}

<br /><br />

<h2>Size</h2>
<p>{format_bytes(pkg.unpacked_size)}</p>

<style>
	*:not(h1, h2) {
		font: var(--sk-font-ui-medium);
	}

	h1 {
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	button {
		font: var(--sk-font-ui-medium);
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
