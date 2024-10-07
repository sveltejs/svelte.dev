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
					<a href="#{section.slug}" class:active={current === section.slug}>{section.title}</a>
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
				margin: 0;
				list-style: none;
				font-size: var(--sk-font-size-body-small);
			}

			/* Only show the title link if it's in the sidebar */
			li:first-child {
				display: none;
			}

			a {
				color: var(--sk-text-3);
			}
		}

		@media (max-width: 1199px) {
			margin: 4rem 0;

			&:not(:has(li:nth-child(2))) {
				/* hide widget if there are no subheadings */
				display: none;
			}

			label {
				position: relative;
				display: flex;
				align-items: center;
				background: url($lib/icons/contents.svg) 0 50% no-repeat;
				background-size: 2rem 2rem;
				padding: 0.2rem 0 0 3rem;
				height: 3rem;
				text-transform: uppercase;
				color: var(--sk-text-4);

				&:hover {
					color: var(--sk-text-3);
				}

				&::before {
					content: '';
					position: absolute;
					right: 0;
					top: calc(50% - 0.5em);
					width: 2rem;
					height: 2rem;
					background: url($lib/icons/chevron.svg);
					background-size: contain;
					rotate: -90deg;
					transition: rotate 0.2s;
				}

				h3 {
					font-family: var(--sk-font-ui);
					font-size: var(--sk-font-size-ui-small);
					color: var(--sk-text-4);
					margin: 0;
					display: block;
				}
			}

			label:has(:checked) {
				&::before {
					rotate: 90deg;
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
				font-family: var(--sk-font-heading);
				font-size: var(--sk-font-size-h3);
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
				padding: 0 0 var(--sk-page-padding-top) 1rem;

				li:first-child {
					display: list-item;
				}

				li {
					font-size: var(--sk-font-size-body-small);
				}

				a.active {
					color: var(--sk-text-1);
					text-decoration: underline;
				}
			}
		}
	}
</style>
