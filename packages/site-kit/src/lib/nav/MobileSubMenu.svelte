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
	{#each contents as section}
		<section>
			<h2>{title} • {section.title}</h2>

			{#if section.sections.length !== 0}
				<ul>
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
		</section>
	{/each}
</nav>

<style>
	nav {
		padding: 0 0 3rem 0;
		font-family: var(--sk-font-family-ui);
		overflow-y: auto;
		height: 100%;
	}

	section {
		padding: 1rem var(--sk-page-padding-side);

		& > ul {
			margin-bottom: 0 0 2rem 0;
		}

		ul {
			list-style-type: none;
			margin: 0;
			margin-bottom: 2.5rem;
		}

		li {
			display: block;
		}
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
		top: 0;
		z-index: 1;
		padding: 1rem 0;
		background-color: var(--sk-bg-2);
	}

	a {
		display: flex;
		align-items: center;

		&[aria-current='page'] {
			color: var(--sk-fg-accent) !important;
		}
	}
</style>
