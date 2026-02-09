<script lang="ts">
	import { page } from '$app/stores';
	import type { NavigationLink } from '../types';
	import { onMount } from 'svelte';

	let { title, contents = [] }: { title: string; contents: NavigationLink['sections'] } = $props();

	let nav = $state() as HTMLElement;

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

<nav bind:this={nav}>
	{#each contents as section, i}
		<h2 style="--index: {i}; --reverse-index: {contents.length - i - 1}">
			<a href="#{section.title}">{section.title} <span class="visually-hidden">{title}</span></a>
		</h2>

		{#if section.sections.length !== 0}
			<ul id={section.title} style="--index: {i}">
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
									<a href={path} aria-current={path === $page.url.pathname ? 'page' : undefined}>
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
</nav>

<style>
	nav {
		--header-padding: 1rem;

		container-type: size;
		font-family: var(--sk-font-family-ui);
		overflow-y: auto;
		height: 100%;
		padding: 0 var(--sk-page-padding-side) 3rem;
	}

	ul {
		--block-height: calc(1lh + var(--header-padding) * 2);

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

	li {
		display: block;
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
		top: calc(var(--index, 0) * (1lh + var(--header-padding) * 2));
		bottom: calc(var(--reverse-index, 0) * (1lh + var(--header-padding) * 2));
		z-index: calc(var(--index, 1) + 1);
		padding: var(--header-padding) 0;
		background-color: var(--sk-bg-2);
	}

	a {
		display: flex;
		align-items: center;

		&[aria-current='page'] {
			color: var(--sk-fg-accent) !important;
		}
	}

	h2 a {
		padding: 0 !important;

		&::before {
			content: '#';
			margin-right: 1ch;
			color: var(--sk-fg-3);
		}

		&:hover::before,
		&:focus::before {
			color: var(--sk-fg-1);
		}
	}

	/* Hide stacked heading experience on very small screens */
	@container (height < 500px) {
		ul {
			scroll-margin-top: var(--block-height);
		}

		h2 {
			top: 0;
			bottom: initial;
		}
	}
</style>
