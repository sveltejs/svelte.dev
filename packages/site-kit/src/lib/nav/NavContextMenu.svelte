<script lang="ts">
	import { page } from '$app/stores';
	import type { NavigationLink } from '../types';
	import { onMount } from 'svelte';

	let { contents = [] }: { contents?: NavigationLink['sections'] } = $props();

	let nav = $state() as HTMLElement;

	onMount(() => {
		scrollToActive();
	});

	export async function scrollToActive() {
		const active = nav.querySelector('[aria-current="true"]') as HTMLElement;

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
	{#if contents}
		{#each contents as { sections, title }, index}
			<section>
				<h2>{title}</h2>

				{#if sections.length !== 0}
					<ul>
						{#each sections as { title, sections: subsections }}
							<li>
								{#if title}
									<h3>
										{title}
									</h3>
								{/if}

								<ul>
									{#each subsections as { path, title }}
										<li>
											<a href={path} aria-current={path === $page.url.pathname}>
												{title}
											</a>
										</li>
									{/each}
								</ul>
							</li>
						{/each}
					</ul>
				{/if}

				{#if contents.length !== 1 && index !== contents.length - 1}
					<hr />
				{/if}
			</section>
		{/each}
	{/if}
</nav>

<style>
	nav {
		padding: 0.29rem;
		padding-top: 0;
		font-family: var(--sk-font-family-ui);
		overflow-y: auto;

		height: 100%;
	}

	section > ul {
		padding: 1rem;
		padding-bottom: 0rem;
		margin-bottom: 0;
	}

	section:not(:first-child) {
		padding-top: 1.5rem;
	}

	hr {
		border: none;
		border-top: 1px solid var(--sk-back-5);
		margin: 0;
		margin-top: 1rem;
		margin-bottom: 1rem;
		width: 95%;
		transform: translateX(2.5%);
	}

	h2,
	h3 {
		display: block;
		padding-bottom: 0.8rem;
		font: var(--sk-font-ui-medium);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--sk-text-3);
	}

	h2 {
		position: sticky;
		top: -1px;
		z-index: 1;
		background-color: var(--sk-back-3);
		width: 98%;
		padding: 1rem 1rem 1rem 4px;
		margin-left: 4px;

		border-radius: 1rem 1rem 0 0;
	}

	ul {
		list-style-type: none;
		margin: 0;
		margin-bottom: 2.5rem;
	}

	li {
		display: block;
	}

	a {
		display: flex;
		align-items: center;
		border-radius: var(--sk-border-radius);
		color: var(--sk-text-2);
		padding: 0 0.75rem !important;
		transition: 0.1s ease;
		transition-property: background-color, color;

		&[aria-current='true'] {
			color: var(--sk-theme-1) !important;
		}
	}

	a:hover {
		text-decoration: none;
		background-color: var(--sk-back-4);
	}
</style>
