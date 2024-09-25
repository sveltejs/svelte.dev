<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import type { Document } from '@sveltejs/site-kit';

	let { content, document }: { content: HTMLElement; document: Document } = $props();

	let headings: NodeListOf<HTMLHeadingElement>;
	let current = $state('');

	afterNavigate(() => {
		current = location.hash.slice(1);
		headings = content.querySelectorAll('h2');
	});

	function update() {
		// a section is 'active' when it crosses the threshold
		const threshold = (innerHeight * 1) / 3;

		for (let i = 0; i < headings.length; i += 1) {
			const heading = headings[i];
			const next = headings[i + 1];

			if (
				next &&
				heading.getBoundingClientRect().top < threshold &&
				next.getBoundingClientRect().top > threshold
			) {
				current = heading.id;
				break;
			}
		}
	}
</script>

<svelte:window onscroll={update} onhashchange={() => (current = location.hash.slice(1))} />

<aside class="on-this-page">
	<label>
		<input type="checkbox" checked aria-label="Toggle 'on this page' menu" />
		On this page
	</label>

	<nav>
		<!-- TODO hide top link on mobile -->
		<a href="/{document.slug}" class:active={current === ''}>
			{document.metadata.title}
		</a>

		{#each document.sections as section}
			<a href="#{section.slug}" class:active={current === section.slug}>{section.title}</a>
		{/each}
	</nav>
</aside>

<style>
	.on-this-page {
		nav {
			padding-top: 0.8rem;

			a {
				display: block;
				color: var(--sk-text-3);
				box-shadow: none; /* unfortunate hack to unset some other CSS */

				/* Only show the title link if it's in the sidebar */
				&:first-child {
					display: none;
				}
			}
		}

		label {
			text-transform: uppercase;
			display: block;
		}

		@media (max-width: 1199px) {
			margin: 4rem 0;
			background: var(--sk-back-3);
			padding: 1rem;

			&:not(:has(a:nth-child(2))) {
				/* hide widget if there are no subheadings */
				display: none;
			}

			label {
				position: relative;

				&::before {
					content: '';
					position: absolute;
					right: 0;
					top: calc(50% - 0.5em);
					width: 1em;
					height: 1em;
					background: url($lib/icons/chevron.svg);
					background-size: contain;
					rotate: 0deg;
					transition: rotate 0.2s;
				}
			}

			label:has(:checked) {
				&::before {
					rotate: -90deg;
				}

				& + nav {
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
			}
		}

		@media (min-width: 1200px) {
			position: fixed;
			top: 14rem;
			right: 0;
			width: var(--sidebar-width);
			padding: 0 var(--sk-page-padding-side) 0 0;
			box-sizing: border-box;

			input {
				display: none;
			}

			& label {
				font-size: var(--sk-text-s);

				letter-spacing: 0.1em;
				font-weight: 600;
				display: block;

				&::before {
					content: none !important;
				}
			}

			nav {
				display: block;

				a:first-child {
					display: block;
				}

				a.active {
					color: var(--sk-text-1);
				}
			}
		}
	}
</style>
