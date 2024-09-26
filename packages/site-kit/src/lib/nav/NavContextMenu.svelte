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
				<h3>{title}</h3>

				{#if sections.length !== 0}
					<ul>
						{#each sections as { title, sections: subsections }}
							<li>
								{#if title}
									<h4>
										{title}
									</h4>
								{/if}

								<ul>
									{#each subsections as { path, title, badge }}
										<li>
											<a href={path} aria-current={path === $page.url.pathname}>
												{title}

												{#if badge}
													<span style="flex: 1 1 auto"></span>
													<span class="badge">{badge}</span>
												{/if}
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
		font-family: var(--sk-font-body);
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

	h3,
	h4 {
		display: block;

		padding-bottom: 0.8rem;

		font-size: var(--sk-text-xs);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-weight: 600;
		color: var(--sk-text-3);
	}

	h3 {
		position: sticky;
		top: -1px;
		z-index: 1;

		font-size: var(--sk-text-s);

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
		line-height: 1;
		color: var(--sk-text-2);
		padding: 0.9rem 0.75rem !important;
		transition: 0.1s ease;
		transition-property: background-color, color;
	}

	a:hover {
		text-decoration: none;
		background-color: var(--sk-back-4);
	}

	[aria-current='true'] {
		background-color: hsla(var(--sk-theme-1-hsl), 0.1) !important;
		color: var(--sk-theme-1) !important;
		font-weight: 400;
	}

	.badge {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0.5rem 0.75rem;
		border-radius: 30px;
		font-size: 1.1rem;
		font-weight: 600;
		letter-spacing: 1px;
		font-family: var(--sk-font-body);
		line-height: 1;
		color: var(--sk-theme-1);
		background: hsla(var(--sk-theme-1-hsl), 0.1);
	}
</style>
