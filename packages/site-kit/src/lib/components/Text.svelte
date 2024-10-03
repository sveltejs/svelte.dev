<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import { prefers_ts } from '../stores/prefers_ts';
	import { fix_position } from '../actions/utils';

	let { children }: { children: Snippet } = $props();

	let container: HTMLElement;

	afterNavigate(update);

	function update() {
		const inputs = container.querySelectorAll('.ts-toggle') as NodeListOf<HTMLInputElement>;

		for (const input of inputs) {
			input.checked = $prefers_ts;
		}
	}

	function toggle(e: Event) {
		if ((e.target as HTMLElement).classList.contains('ts-toggle')) {
			const input = e.target as HTMLInputElement;
			$prefers_ts = input.checked;
			fix_position(input, update);
		}
	}

	async function copy(e: Event) {
		if ((e.target as HTMLButtonElement).classList.contains('copy-to-clipboard')) {
			const parent = e
				.composedPath()
				.find((node) => (node as HTMLElement).classList.contains('code-block')) as HTMLElement;

			const ts = !!parent.querySelector('.ts-toggle:checked');
			const code = parent.querySelector(`pre:${ts ? 'last' : 'first'}-of-type code`) as HTMLElement;

			let result = '';
			for (const node of code.childNodes ?? []) {
				if (!(node as HTMLElement).classList.contains('deleted')) {
					result += node.textContent!.trimEnd() + '\n';
				}
			}

			navigator.clipboard.writeText(result.trim());
		}
	}
</script>

<div onclickcapture={copy} onchangecapture={toggle} bind:this={container} class="text">
	{@render children()}
</div>

<style>
	.text :global {
		h2 {
			margin-top: 7rem;
		}

		h3 {
			margin-top: 5rem;
		}

		p,
		ol,
		ul {
			margin: 1em 0;
		}

		code {
			white-space: pre-wrap;
			padding: 0.2rem 0.4rem;
			margin: 0 0.2rem;
			top: -0.1rem;
			background: var(--sk-back-4);
		}

		.code-block {
			position: relative;
			box-shadow: 1px 2px 1rem hsla(0 0 0 / 0.08);
			border-radius: var(--sk-border-radius);
			overflow: hidden;
			margin: 2rem 0;

			.controls {
				--height: 3.6rem;
				display: flex;
				align-items: center;
				position: absolute;
				top: 0;
				height: var(--height);
				padding: 0.3rem;
				width: 100%;
				z-index: 2;
				justify-content: end;
				box-sizing: border-box;

				&:has(.filename) {
					position: relative;
					background: var(--sk-back-4);
				}

				.filename {
					content: attr(data-file);
					display: block;
					flex: 1;
					font-family: var(--sk-font-mono);
					font-size: 1.2rem;
					font-weight: 400;
					padding: 0 1rem;
					color: var(--sk-text-2);

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
					height: calc(var(--height) - 0.6rem);
					outline-offset: 0;
					padding: 0 0.4rem;

					&::before,
					&::after {
						width: 2rem;
						display: flex;
						justify-content: center;
						align-items: center;
						font-size: 1.2rem;
						font-family: var(--sk-font-mono);
						color: var(--sk-text-2);
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
					height: calc(var(--height) - 0.6rem);
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
						background: no-repeat 50% 50% / 1.6rem 1.6rem;
						transition: opacity 0.2s;
						transition-delay: 0.6s;
					}

					&::before {
						background-image: url(../icons/copy-to-clipboard-light.svg);
					}

					&::after {
						background-image: url(../icons/check-light.svg);
						opacity: 0;

						html.dark & {
							background-image: url(../icons/check-dark.svg);
						}
					}

					html.dark &::before {
						background-image: url(../icons/copy-to-clipboard-dark.svg);
					}

					html.dark &::after {
						background-image: url(../icons/check-dark.svg);
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
				color: var(--sk-code-base);
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
					border-bottom: 1px solid var(--sk-theme-1);
					text-decoration: none;
				}

				/* TODO what is this for? */
				&.border {
					border-left: 5px solid var(--sk-theme-2);
				}

				&.language-diff code {
					color: var(--sk-code-diff-base);
				}
			}
		}

		p code {
			max-width: 100%;
			display: inline-flex;
			overflow-x: auto;
			padding-top: 0;
			padding-bottom: 0;
		}

		a:not(.permalink) {
			color: inherit;
			text-decoration: underline;
			transition: box-shadow 0.1s ease-in-out;

			/* TODO what is this for? */
			code {
				all: unset !important;
				color: inherit;
				background-color: transparent !important;
			}
		}

		/* permalinks */
		[id] {
			scroll-margin-top: calc(var(--sk-nav-height) + 4rem);
		}

		a.permalink {
			position: absolute !important;
			display: block;
			background: url(../icons/link.svg) 0 50% no-repeat;
			background-size: 1em 1em;
			width: 1.4em;
			height: 1.2em;
			top: 0;

			@media (max-width: 767px) {
				right: 0;
				scale: 0.8;
			}

			@media (min-width: 768px) {
				left: -1.3em;
				opacity: 0;
				transition: opacity 0.2s;

				:where(h2, h3):hover & {
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
				top: 1.4rem;
				left: -1.8rem;
				background-color: var(--sk-back-5);
				width: 0.6rem;
				height: 0.6rem;
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
			max-width: calc(var(--sk-line-max-width) - var(--list-padding));
			margin: 0 0 0.5em 0;
		}

		table {
			margin: 1em 0;
		}

		small {
			font-size: var(--sk-font-size-body-small);
			float: right;
			pointer-events: all;
			color: var(--sk-theme-1);
			cursor: pointer;
		}

		blockquote {
			--primary-hsl: var(--sk-theme-1-hsl);
			color: var(--sk-text-1);
			padding: 0 0 0 4.5rem;
			font-style: italic;

			&:first-child {
				margin-top: 0;
			}

			&:last-child {
				margin-bottom: 0;
			}

			&::before {
				content: '';
				display: block;
				width: 3rem;
				height: 3rem;
				position: absolute;
				left: 0.5rem;
				top: 0;
				background: url($lib/icons/lightbulb.svg) no-repeat 50% 50% / contain;
			}

			&.deprecated {
				--primary-hsl: var(--sk-text-warning-hsl);
				--color: var(--primary-hsl);

				p:first-child::before {
					content: 'Deprecated ';
					display: block;
					font-style: normal;
				}

				a {
					--color: var(--primary-hsl);
				}
			}

			em,
			i {
				font-style: normal;
			}

			code {
				font-style: normal;
			}

			@media (max-width: 767px) {
				* {
					word-break: break-word;
				}
			}
		}

		details.legacy {
			&::after {
				content: '';
				background: url(../icons/chevron.svg);
				background-size: contain;
				position: absolute;
				right: 0.5rem;
				top: 0.5rem;
				width: 2rem;
				height: 2rem;
				rotate: -90deg;
				transition: rotate 0.2s;
				pointer-events: none;
			}

			& > summary {
				position: relative;
				display: flex;
				align-items: center;
				height: 3rem;
				color: var(--sk-text-4);
				font-family: var(--sk-font-ui);
				font-style: normal;
				font-size: var(--sk-font-size-ui-small);
				user-select: none;

				&:hover {
					color: var(--sk-text-3);
				}

				&::after {
					position: absolute;
					display: flex;
					align-items: center;
					right: 3rem;
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

					&::after {
						content: 'hide all';
					}
				}
			}

			& > :last-child {
				margin-bottom: 0;
			}
		}
	}
</style>
