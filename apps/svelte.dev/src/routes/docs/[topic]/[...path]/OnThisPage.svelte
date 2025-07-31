<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import type { Document } from '@sveltejs/site-kit';

	let { content, document }: { content: HTMLElement; document: Document } = $props();

	let headings: NodeListOf<HTMLHeadingElement>;
	let current = $state('');

	afterNavigate(() => {
		current = location.hash.slice(1);
		headings = content.querySelectorAll('h2');
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
</script>

<svelte:window onscroll={update} onhashchange={() => (current = location.hash.slice(1))} />

<aside class="on-this-page">
	<label>
		<input type="checkbox" aria-label="Toggle 'on this page' menu" />
		<h3>On this page</h3>
	</label>

	<nav>
		<ul>
			<li>
				<a href="/{document.slug}" class:active={current === ''}>
					{document.metadata.title}
				</a>
			</li>

			{#each document.sections as section}
				<li>
					<a href="#{section.slug}" class:active={current === section.slug}>{@html section.title}</a
					>
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

			/* Only show the title link if it's in the sidebar */
			li:first-child {
				display: none;
			}

			a {
				color: var(--sk-fg-2);
			}
		}

		@media (max-width: 1199px) {
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
		}

		@media (min-width: 1200px) {
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
				display: block;
				overflow-y: auto;
				scrollbar-width: none;
				margin-left: -1rem; /* negative margin avoids focus rings being cut off */
				padding: 0 var(--sk-page-padding-side) var(--sk-page-padding-top) 1rem;

				li {
					text-indent: 1ch hanging;
				}

				li:first-child {
					display: list-item;
				}

				a.active {
					color: var(--sk-fg-1);
					text-decoration: underline;
				}
			}
		}
	}
</style>
