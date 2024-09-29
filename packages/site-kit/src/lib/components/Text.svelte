<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="text">{@render children()}</div>

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
			font-size: var(--sk-text-m);
		}

		/* TODO is this still used? don't think so */
		section {
			max-width: var(--sk-line-max-width);
			padding: 0 0 0 1rem;

			h2,
			h3,
			h4 {
				margin-left: -1rem;
			}

			a code {
				color: inherit;
			}
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

			.filename {
				content: attr(data-file);
				display: block;
				width: 100%;
				font-family: var(--sk-font-mono);
				font-size: 1.2rem;
				font-weight: 400;
				padding: 1rem 1rem 0.8rem 1rem;
				color: var(--sk-text-2);
				background: var(--sk-back-4);
				border-radius: var(--sk-border-radius) var(--sk-border-radius) 0 0;
				box-sizing: border-box;
			}

			pre {
				margin-top: 0;
				border-radius: 0 0 var(--sk-border-radius) var(--sk-border-radius);
			}
		}

		pre {
			position: relative;
			margin: 1em 0;
			width: 100%;
			padding: 1rem;
			box-sizing: border-box;
			color: var(--sk-code-base);
			border-radius: var(--sk-border-radius);
			font-size: var(--sk-text-s);
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

		.ts-block pre {
			margin: 0;
		}

		p code {
			max-width: 100%;
			display: inline-flex;
			overflow-x: auto;
			padding-top: 0;
			padding-bottom: 0;
		}

		/* TODO what is this for? */
		.copy-code-block {
			box-shadow: 1px 2px 1rem hsla(0 0 0 / 0.08);
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
			height: 1em;
			bottom: 0.25em;

			@media (max-width: 767px) {
				right: 0;
				scale: 0.8;
			}

			@media (min-width: 768px) {
				left: -1.3em;
				opacity: 0;
				transition: opacity 0.2s;

				:where(h2, h3, h4, h5, h6):hover & {
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
				margin-top: 0.8rem;
				margin-left: -1.8rem;
				background-color: var(--sk-back-5);
				width: 0.6rem;
				height: 0.6rem;
				border-radius: 2px;
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
			line-height: 1.5;
			margin: 0 0 0.5em 0;
		}

		table {
			margin: 1em 0;
		}

		small {
			font-size: var(--sk-text-s);
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

				&::before {
					content: 'Deprecated';
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
				font-family: var(--sk-font-heading);
				font-style: normal;
				font-size: var(--sk-text-xs);
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
