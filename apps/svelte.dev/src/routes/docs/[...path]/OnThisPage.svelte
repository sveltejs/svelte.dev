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
		margin: 4rem 0;
		background: var(--sk-back-3);
		padding: 1rem;

		label {
			position: relative;
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

			a {
				display: block;
				color: inherit;
				box-shadow: none; /* unfortunate hack to unset some other CSS */

				/* Only show the title link if it's in the sidebar */
				&:first-child {
					display: none;
				}

				&.active {
					font-weight: bold;
				}
			}
		}

		label {
			display: block;
			text-transform: uppercase;

			&::before {
				content: '▶';
			}
		}

		label:has(:checked) {
			&::before {
				content: '▼';
			}

			& + nav {
				display: block;
			}
		}

		@media (min-width: 1200px) {
			position: fixed;
			top: 14rem;
			right: 0;
			margin: 0;
			width: var(--sidebar-width);
			padding: 0 var(--sk-page-padding-side) 0 0;
			box-sizing: border-box;
			background: none;

			input {
				display: none;
			}

			& label {
				&::before {
					content: none !important;
				}
			}

			nav {
				display: block;

				a:first-child {
					display: block;
				}
			}
		}
	}
</style>
