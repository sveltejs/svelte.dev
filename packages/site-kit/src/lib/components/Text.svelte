<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import { code_preference } from '../state/code_preference';
	import { fix_position } from '../actions/utils';

	let { children }: { children: Snippet } = $props();

	let container: HTMLElement;

	afterNavigate(update);

	function update() {
		const inputs = container.querySelectorAll('.ts-toggle') as NodeListOf<HTMLInputElement>;

		for (const input of inputs) {
			input.checked = code_preference.current === 'typescript';
		}
	}

	function toggle(e: Event) {
		if ((e.target as HTMLElement).classList.contains('ts-toggle')) {
			const input = e.target as HTMLInputElement;
			code_preference.current = input.checked ? 'typescript' : 'javascript';
			fix_position(input, update);
		}
	}

	async function copy(e: Event) {
		if ((e.target as HTMLButtonElement).classList.contains('copy-to-clipboard')) {
			const parent = e
				.composedPath()
				.find((node) => (node as HTMLElement).classList.contains('code-block')) as HTMLElement;

			const ts = !!parent.querySelector('.ts-toggle:checked');
			const code = parent.querySelectorAll(':scope > pre > code')[ts ? 1 : 0] as HTMLElement;
			navigator.clipboard.writeText(get_text(code));
		}
	}

	function get_text(node: HTMLElement) {
		let result = '';

		for (const child of node.childNodes ?? []) {
			if (child.nodeType === 3) {
				result += (child as Text).data;
			}

			if (child.nodeType === 1) {
				const classes = (child as HTMLElement).classList;

				if (classes.contains('deleted') || classes.contains('twoslash-popup-container')) {
					continue;
				}

				if (classes.contains('twoslash-meta-line') || classes.contains('twoslash-error-line')) {
					result += '\n';
				} else {
					result += get_text(child as HTMLElement);
				}
			}
		}

		return result;
	}
</script>

<div onclickcapture={copy} onchangecapture={toggle} bind:this={container} class="text">
	{@render children()}
</div>

<style>
	.text :global {
		h2,
		h3 {
			max-width: 100%;
			padding: 0 2.4rem 0 0;

			@media (min-width: 768px) {
				margin: 0 0 0 -4.8rem;
				padding: 0 2.4rem 0 4.8rem;
			}

			/* we can't use `text-overflow` on the heading itself,
			   because `overflow: hidden` defeats `scroll-margin` */
			& > span {
				display: block;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		img {
			max-width: 100%;
			object-fit: contain;
		}

		h2 {
			margin-top: 7rem;
		}

		h3 {
			margin-top: 5rem;
		}

		code:not(pre *),
		kbd {
			white-space: pre-wrap;
			padding: 0.2rem 0.4rem;
			margin: 0 0.2rem;
			top: -0.1rem;
			background: var(--sk-bg-4);
		}

		.code-block {
			position: relative;
			background: var(--sk-bg-2);
			border: 1px solid var(--sk-border);
			border-radius: var(--sk-border-radius);
			overflow: hidden;
			margin: calc(0.5 * var(--sk-line-height-body)) 0;
			/* background: var(--sk-bg-3); */

			@media (min-width: 767px) {
				margin: var(--sk-line-height-body) 0;
			}

			.controls {
				--height: 3.6rem;
				display: flex;
				align-items: center;
				position: absolute;
				top: 0;
				right: 0;
				height: var(--height);
				padding: 0.3rem 0.5rem;
				gap: 0.5rem;
				z-index: 2;
				justify-content: end;
				box-sizing: border-box;

				&:has(.filename) {
					position: relative;
					background: var(--sk-bg-3);
					padding-left: 1rem;
				}

				&:not(:has(.filename)) {
					background: inherit;
				}

				.filename {
					content: attr(data-file);
					display: block;
					position: relative;
					top: 0.1rem;
					flex: 1;
					font: var(--sk-font-ui-small);
					color: var(--sk-fg-3);
					text-overflow: ellipsis;
					overflow: hidden;
					white-space: nowrap;

					&::after {
						content: attr(data-ext);
					}
				}

				&:has(.ts-toggle:checked) {
					.filename[data-ext='.js']::after {
						content: '.ts';
					}
				}

				.ts-toggle {
					appearance: none;
					display: flex;
					align-items: center;
					height: calc(var(--height) - 1rem);
					outline-offset: 0;
					padding: 0 0.6rem;

					&::before,
					&::after {
						width: 2rem;
						display: flex;
						justify-content: center;
						align-items: center;
						font-size: 1.2rem;
						font-family: var(--sk-font-family-mono);
						color: inherit;
					}

					&::before {
						content: 'JS';
					}

					&::after {
						content: 'TS';
						border-left: none;
						opacity: 0.3;
					}

					&:checked {
						&::before {
							opacity: 0.3;
						}

						&::after {
							opacity: 1;
						}
					}
				}

				.copy-to-clipboard {
					position: relative;
					height: calc(var(--height) - 1rem);
					aspect-ratio: 1;
					border-radius: var(--sk-border-radius);

					&[disabled] {
						opacity: 1;
					}

					&::before,
					&::after {
						content: '';
						display: block;
						position: absolute;
						width: 100%;
						height: 100%;
						left: 0;
						top: 0;
						background: currentColor;
						mask: no-repeat 50% 50% / 1.6rem 1.6rem;
						transition: opacity 0.2s;
						transition-delay: 0.6s;
					}

					&::before {
						mask-image: url(icons/copy-to-clipboard);
					}

					&::after {
						mask-image: url(icons/check);
						opacity: 0;
					}

					&:active::before {
						opacity: 0;
						transition: none;
					}

					&:active::after {
						opacity: 1;
						transition: none;
					}
				}
			}

			&:has(.ts-toggle:checked) pre:first-of-type {
				display: none;
			}

			&:has(.ts-toggle:not(:checked)) pre:last-of-type {
				display: none;
			}

			pre {
				position: relative;
				margin: 0;
				width: 100%;
				padding: 0.7rem 1rem;
				box-sizing: border-box;
				color: var(--shiki-color-text);
				border-radius: var(--sk-border-radius);
				overflow-x: auto;

				code {
					display: block;
					padding: 0;
					margin: 0;
					top: 0;
					width: 100%;
					background: transparent;
				}

				a:hover {
					border-bottom: 1px solid var(--sk-fg-accent);
					text-decoration: none;
				}

				.highlight {
					--color: rgba(220, 220, 0, 0.2);
					background: var(--color);
					outline: 2px solid var(--color);
					border-radius: 2px;

					&.add {
						--color: rgba(0, 255, 0, 0.18);
					}

					&.remove {
						--color: rgba(255, 0, 0, 0.1);

						:root:not(.light) & {
							@media (prefers-color-scheme: dark) {
								--color: rgba(255, 0, 0, 0.27);
							}
						}
						:root.dark & {
							--color: rgba(255, 0, 0, 0.27);
						}
					}
				}
			}
		}

		p code {
			max-width: 100%;
			overflow-x: auto;
			padding-top: 0.2em;
			padding-bottom: 0.2em;
		}

		a:not(.permalink) {
			color: inherit;
			text-decoration: underline;
			transition: box-shadow 0.1s ease-in-out;
		}

		/* permalinks */
		[id] {
			scroll-margin-top: calc(var(--sk-nav-height) + 4rem);
		}

		a.permalink {
			position: absolute !important;
			display: block;
			background: var(--sk-fg-1);
			mask: url(icons/hash) 50% 50% no-repeat;
			mask-size: 2.4rem 2.4rem;
			width: 2.6rem;
			height: 2.2rem;
			top: calc(50% - 1rem);

			@media (max-width: 767px) {
				right: 0;
				scale: 0.8;
			}

			@media (min-width: 768px) {
				left: 1.6rem;
				opacity: 0;
				transition: opacity 0.2s;

				:where(h2, h3):hover &,
				&:focus {
					opacity: 1;
				}
			}
		}

		ol,
		ul {
			--list-padding: 3rem;
			margin-left: var(--list-padding);
		}

		ul {
			list-style: none;

			li::before {
				content: '';
				position: absolute;
				top: 0.65em;
				left: -1.8rem;
				background-color: var(--sk-fg-4);
				width: 0.3em;
				height: 0.3em;
				border-radius: 50%;
				opacity: 0.7;
			}

			ul {
				margin-bottom: 0;
			}
		}

		ol {
			list-style: decimal;
		}

		li {
			position: relative;
			max-width: calc(var(--sk-page-content-width) - var(--list-padding));
			margin: 0 0 0.5em 0;
		}

		table {
			margin: 1em 0;
		}

		small {
			font: var(--sk-font-body-small);
			float: right;
			pointer-events: all;
			color: var(--sk-fg-accent);
			cursor: pointer;
		}

		blockquote {
			padding: 0 0 0 4.5rem;

			&.note,
			&:has(details.legacy) {
				&::before {
					content: '';
					display: block;
					width: 2em;
					height: 2em;
					top: 0.05em;
					background: var(--sk-fg-accent);
					mask: url(icons/lightbulb) no-repeat 0.5rem 0 / 2.6rem;
					pointer-events: none;
				}
			}

			&:first-child {
				margin-top: 0;
			}

			&:last-child {
				margin-bottom: 0;
			}

			&.deprecated {
				p:first-child::before {
					content: 'Deprecated ';
					font: var(--sk-font-ui-medium);
					text-transform: uppercase;
					color: var(--sk-fg-4);
				}
			}

			&::before {
				content: '“';
				position: absolute;
				font-size: 6.4em;
				line-height: 1;
				left: 0;
				top: 0;
				font-family: var(--sk-font-family-heading);
				color: var(--sk-fg-4);
			}

			@media (max-width: 767px) {
				* {
					word-break: break-word;
				}
			}
		}

		.since p {
			font: var(--sk-font-ui-medium);
			text-transform: uppercase;
			color: var(--sk-fg-4);
		}

		details {
			position: relative;

			&::before,
			&::after {
				content: '';
				position: absolute;
				right: 0.6rem;
				top: 0.1rem;
				width: 2.4rem;
				height: 2.4rem;
				pointer-events: none;
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

			&:has(summary:active)::before {
				border-color: var(--sk-raised-active-color);
				border-width: var(--sk-raised-active-width);
			}

			&::after {
				background: currentColor;
				mask: url(icons/chevron) 50% 50% no-repeat;
				mask-size: 2rem;
				rotate: -90deg;
				transition: rotate 0.2s;
				top: 0.2rem;
				right: 0.8rem;
			}

			&:has(summary:active)::after {
				top: 0.3rem;
				right: 0.7rem;
			}

			& > summary {
				position: relative;
				display: flex;
				align-items: center;
				height: 3rem;
				color: var(--sk-fg-3);
				font: var(--sk-font-body-small);
				user-select: none;

				&::-webkit-details-marker {
					display: none;
				}

				.legacy &::after {
					position: absolute;
					display: flex;
					align-items: center;
					right: 4rem;
					top: 0;
					height: 100%;
					content: 'show all';
					float: right;
				}
			}

			&[open] {
				&::after {
					rotate: 90deg;
				}

				& > summary {
					margin-bottom: 1.4rem;

					.legacy &::after {
						content: 'hide all';
					}
				}
			}

			& > :last-child {
				margin-bottom: 0;
			}
		}

		figcaption {
			font: var(--sk-font-ui-medium);
			color: var(--sk-fg-3);
		}
	}
</style>
