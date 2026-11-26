<script lang="ts">
	import { page } from '$app/state';
	import type { NavigationLink } from '../types';
	import { onMount } from 'svelte';
	import { is_active } from './utils';

	let {
		title,
		contents = [],
		height = $bindable(0)
	}: {
		title: string;
		contents: NavigationLink['sections'];
		/** The rendered height of the menu, which is less than the available space if the contents are short */
		height?: number;
	} = $props();

	let nav = $state() as HTMLElement;
	const submenu_id = $props.id();
	let expanded = $derived(contents.map(section_is_active));

	function section_is_active(section: NonNullable<NavigationLink['sections']>[number]) {
		return section.sections.some(({ sections }) =>
			sections.some(({ path }) => path && is_active(page.url.pathname, path))
		);
	}

	function toggle_section(index: number) {
		expanded = expanded.map((open, i) => (i === index ? !open : open));
	}

	onMount(() => {
		scrollToActive();
	});

	export async function scrollToActive() {
		const active = nav.querySelector('[aria-current="page"]') as HTMLElement;

		if (!active) {
			nav.scrollTop = 0;
			return;
		}

		const nav_center = nav.offsetHeight / 2;
		const child_center = active.offsetHeight / 2;
		const offset_top = active.offsetTop;
		const scroll_position = offset_top - nav_center + child_center;

		const update_scroll = () => (nav.scrollTop = scroll_position);

		requestAnimationFrame(update_scroll);
	}
</script>

<div class="container">
	<nav bind:this={nav} bind:clientHeight={height}>
		{#if contents.every((section) => section.path && section.sections.length === 0)}
			<ul class="flat">
				{#each contents as { path, title, match }}
					<li>
						<a
							href={path}
							aria-current={is_active(page.url.pathname, path!, match) ? 'page' : undefined}
						>
							{title}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			{@render sections()}
		{/if}
	</nav>
</div>

{#snippet sections()}
	{#each contents as section, i}
		{@const section_id = `${submenu_id}-section-${i}`}
		{@const has_links = section.sections.some(({ sections }) => sections.length > 0)}
		<h2 style="--index: {i}; --reverse-index: {contents.length - i - 1}">
			{#if has_links}
				<button
					type="button"
					aria-expanded={expanded[i] ?? false}
					aria-controls={section_id}
					onclick={() => toggle_section(i)}
				>
					{section.title} <span class="visually-hidden">{title}</span>
				</button>
			{:else if section.path}
				<a
					href={section.path}
					aria-current={is_active(page.url.pathname, section.path, section.match)
						? 'page'
						: undefined}
				>
					{section.title}
				</a>
			{:else}
				{section.title}
			{/if}
		</h2>

		{#if has_links}
			<ul id={section_id} hidden={!expanded[i]} style="--index: {i}">
				{#each section.sections as { title, sections: subsections }}
					<li>
						{#if title}
							<h3>
								{title}
							</h3>
						{/if}

						<ul>
							{#each subsections as { path, title }}
								<li>
									<a href={path} aria-current={path === page.url.pathname ? 'page' : undefined}>
										{title}
									</a>
								</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ul>
		{/if}
	{/each}
{/snippet}

<style>
	.container {
		/* the container fills the available space, and the nav sits at the bottom of it */
		container-type: size;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: end;
	}

	nav {
		--header-padding: 1rem;

		/* shrink to fit the contents, but scroll if they exceed the available space */
		flex: 0 1 auto;
		min-height: 0;
		font-family: var(--sk-font-family-ui);
		overflow-y: auto;
		padding: 0 var(--sk-page-padding-side) 3rem;
		pointer-events: all;
	}

	ul {
		--block-height: calc(1lh + var(--header-padding));

		/*
		* Necessary values to match `scroll-margin-top`
		* with `h2` heights.
		*/
		font-size: 1.6rem;
		line-height: 1.5;

		list-style-type: none;
		margin: 0;
		margin-bottom: 2.5rem;
		scroll-margin-top: calc((var(--index, 1) + 1) * var(--block-height));
	}

	.flat {
		padding-top: 1rem;
	}

	li {
		display: block;
	}

	h2 + ul > li {
		/* h2 anchor padding - margin-left - border width */
		padding-left: calc(1.75rem - 1px);
		margin-left: 0.25rem;
		border-left: 1px solid var(--sk-border);
	}

	h2,
	h3 {
		display: block;
		padding-bottom: 0.8rem;
		font: var(--sk-font-ui-medium);
		text-transform: uppercase;
	}

	h2 {
		position: sticky;
		top: calc(var(--index, 0) * calc(1lh + var(--header-padding)));
		bottom: calc(var(--reverse-index, 0) * calc(1lh + var(--header-padding)));
		z-index: calc(var(--index, 1) + 1);
		padding: calc(var(--header-padding) / 2) 0;
		margin: calc(var(--header-padding) / 2) 0;
		background-color: var(--sk-bg-2);
	}

	a {
		display: flex;
		align-items: center;
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}

		&[aria-current='page'] {
			color: var(--sk-fg-accent) !important;
			text-decoration: underline;
			text-underline-offset: 0.15em;
		}
	}

	h2 button {
		position: relative;
		display: block;
		width: 100%;
		padding: 0 0 0 2rem;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		text-transform: inherit;
		cursor: pointer;

		&::before {
			content: '#';
			position: absolute;
			left: 0;
			color: var(--sk-fg-3);
		}

		&:hover::before,
		&:focus-visible::before {
			color: var(--sk-fg-1);
		}
	}

	/* Hide stacked heading experience on very small screens */
	@container (height < 450px) {
		ul {
			scroll-margin-top: var(--block-height);
		}

		h2 {
			top: 0;
			bottom: initial;
		}
	}
</style>
