<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import type { Document } from '@sveltejs/site-kit';

	let { content, document }: { content: HTMLElement; document: Document } = $props();

	let headings: NodeListOf<HTMLHeadingElement>;
	let current = $state('');
	let nav: HTMLElement | undefined = $state();
	let thumb: { top: number; height: number } | null = $state(null);
	let thumb_placed = $state(false);

	afterNavigate(() => {
		current = location.hash.slice(1);
		headings = content.querySelectorAll('h2, h3');
		update(); // Ensure active link is set correctly on navigation
	});

	// Update function to activate the correct section link
	function update() {
		const threshold = (innerHeight * 1) / 3;
		let found = false;

		for (let i = 0; i < headings.length; i++) {
			const heading = headings[i];
			const next = headings[i + 1];

			// If the current heading is above the threshold and the next heading is below it
			if (
				heading.getBoundingClientRect().top < threshold &&
				(!next || next.getBoundingClientRect().top > threshold)
			) {
				current = heading.id;
				found = true;
				break;
			}
		}

		// Handle case when scrolled to the top of the page
		if (!found && scrollY === 0) {
			current = '';
		}
	}

	function place_thumb() {
		const link = nav?.querySelector('a.active');
		if (!nav || !link) return (thumb = null);

		const nav_rect = nav.getBoundingClientRect();
		const link_rect = link.getBoundingClientRect();
		thumb = { top: link_rect.top - nav_rect.top + nav.scrollTop, height: link_rect.height };
		requestAnimationFrame(() => (thumb_placed = true));
	}

	$effect(() => {
		current;
		place_thumb();
	});

	$effect(() => {
		const list = nav?.querySelector(':scope > ul');
		if (!list) return;
		const observer = new ResizeObserver(place_thumb);
		observer.observe(list);
		return () => observer.disconnect();
	});
</script>

<svelte:window
	onscroll={update}
	onresize={place_thumb}
	onhashchange={() => (current = location.hash.slice(1))}
/>

<aside class="on-this-page">
	<label>
		<input type="checkbox" />
		<h3>On this page</h3>
	</label>

	<nav bind:this={nav}>
		{#if thumb}
			<span
				class="thumb"
				class:animate={thumb_placed}
				style:translate="0 {thumb.top}px"
				style:height="{thumb.height}px"
			></span>
		{/if}

		<ul>
			<li>
				<a href="/{document.slug}" class:active={current === ''}>
					{document.metadata.title}
				</a>
			</li>

			{#each document.sections as section}
				<li>
					<a href="#{section.slug}" class:active={current === section.slug}>
						{@html section.title}
					</a>

					{#if section.subsections.length > 0}
						<ul
							data-active={current === section.slug ||
								section.subsections.some((subsection) => subsection.slug === current)}
						>
							{#each section.subsections as subsection}
								<li>
									<a href="#{subsection.slug}" class:active={current === subsection.slug}>
										{@html subsection.title}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ul>
	</nav>
</aside>

<style>
	.on-this-page {
		nav {
			padding-top: 0.8rem;

			ul {
				list-style: none;
				font: var(--sk-font-body-small);
			}

			li ul {
				margin: 0 0 0 1.6rem;
			}

			/* Only show the title link if it's in the sidebar */
			& > ul > li:first-child {
				display: none;
			}

			a {
				color: var(--sk-fg-2);
			}
		}

		@media (max-width: 74.9375em) {
			margin: 4rem 0;

			/* TODO remove :global once https://github.com/sveltejs/svelte/issues/13779 is fixed */
			:global(&:not(:has(li:nth-child(2)))) {
				/* hide widget if there are no subheadings */
				display: none;
			}

			label {
				position: relative;
				display: flex;
				align-items: center;
				background: url(icons/contents) 0 50% no-repeat;
				background-size: 2rem 2rem;
				padding: 0.2rem 0 0 3rem;
				height: 3rem;
				text-transform: uppercase;
				user-select: none;

				&::before,
				&::after {
					content: '';
					position: absolute;
					right: 0;
					top: 0.3rem;
					width: 2.4rem;
					height: 2.4rem;
				}

				&::before {
					border-radius: var(--sk-border-radius);
					border-style: solid;
					border-color: var(--sk-raised-color);
					border-width: var(--sk-raised-width);
				}

				&:hover::before {
					border-color: var(--sk-raised-hover-color);
				}

				&:active::before {
					border-color: var(--sk-raised-active-color);
					border-width: var(--sk-raised-active-width);
				}

				&::after {
					background: currentColor;
					mask: url(icons/chevron) 50% 50% no-repeat;
					mask-size: 2rem;
					top: 0.4rem;
					right: 0.2rem;
					rotate: -90deg;
					transition: rotate 0.2s;
					transition: rotate 0.2s;
				}

				&:active::after {
					top: 0.5rem;
					right: 0.1rem;
				}

				h3 {
					font: var(--sk-font-ui-small);
					color: var(--sk-fg-4);
					margin: 0;
					display: block;

					&:hover {
						color: var(--sk-fg-3);
					}
				}
			}

			label:has(:checked) {
				&::after {
					rotate: 90deg;
				}

				/* TODO remove :global once https://github.com/sveltejs/svelte/issues/13779 is fixed */
				:global(& + nav) {
					display: block;
				}
			}

			input {
				appearance: none;
				position: absolute;
				width: 100%;
				height: 100%;
				left: 0;
				top: 0;
			}

			nav {
				display: none;
				padding: 0 0 0 3rem;
			}

			.thumb {
				display: none;
			}
		}

		@media (min-width: 75em) {
			position: fixed;
			display: flex;
			flex-direction: column;
			top: 14rem;
			height: calc(100vh - 14rem);
			left: calc(100dvw - var(--sidebar-width));
			width: var(--sidebar-width);
			box-sizing: border-box;

			input {
				display: none;
			}

			& label {
				font: var(--sk-font-h3);
				display: block;

				&::before {
					content: none !important;
				}

				h3 {
					margin: 0 0 0.3rem 0;
				}
			}

			nav {
				position: relative;
				display: block;
				overflow-y: auto;
				scrollbar-width: none;
				margin-left: -1rem; /* negative margin avoids focus rings being cut off */
				padding: 0 var(--sk-page-padding-side) var(--sk-page-padding-top) 1rem;

				li {
					text-indent: 1ch hanging;
				}

				& > ul > li:first-child {
					display: list-item;
				}

				li ul {
					display: none;
				}

				li ul[data-active='true'] {
					display: block;
				}

				& > ul {
					position: relative;

					&::before {
						content: '';
						position: absolute;
						left: calc(-0.8rem + 1px);
						top: 0;
						bottom: 0;
						width: 1px;
						background: var(--sk-border);
					}
				}

				a.active {
					color: var(--sk-fg-1);
				}
			}

			.thumb {
				position: absolute;
				top: 0;
				left: 0.2rem;
				width: 3px;
				background: var(--sk-fg-accent);
				z-index: 1;

				@media (prefers-reduced-motion: no-preference) {
					&.animate {
						transition:
							translate 0.2s,
							height 0.2s;
					}
				}
			}
		}
	}
</style>
