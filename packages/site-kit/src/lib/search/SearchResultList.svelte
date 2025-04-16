<script lang="ts">
	import type { BlockGroup } from './types';

	interface Props {
		results: BlockGroup[];
		query: string;
		onselect?: (href: string) => void;
	}

	let { results, query, onselect }: Props = $props();

	function escape(text: string) {
		return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function excerpt(content: string, query: string) {
		const index = content.toLowerCase().indexOf(query.toLowerCase());
		if (index === -1) {
			return `${escape(content.slice(0, 150))}`;
		}

		const prefix =
			index > 40 && content.length > 70
				? `${escape(content.slice(index - 35, index))}`
				: `<span class="spacer"></span>${escape(content.slice(0, index))}`;
		const suffix = escape(
			content.slice(
				index + query.length,
				index + query.length + (130 - (prefix.length + query.length))
			)
		);

		return prefix + `<mark>${escape(content.slice(index, index + query.length))}</mark>` + suffix;
	}
</script>

<ul>
	{#each results as group (group.breadcrumbs.join('::'))}
		<li>
			<details open>
				<summary>
					{#each group.breadcrumbs as breadcrumb}<span>{breadcrumb}</span>{/each}
				</summary>
				<ul>
					{#each group.blocks as block (block.href)}
						<a
							class:fragment={block.breadcrumbs.length > 4}
							href={block.href}
							onclick={() => onselect?.(block.href)}
						>
							<strong>
								{#each block.breadcrumbs.slice(2) as t}<span>{t}</span>{/each}
							</strong>

							{#if block?.content}
								<div class="excerpt">
									<span>{@html excerpt(block.content, query)}</span>
								</div>
							{/if}
						</a>
					{/each}
				</ul>
			</details>
		</li>
	{/each}
</ul>

<style>
	ul {
		position: relative;
		margin: 0;
		list-style: none;
	}

	details {
		padding: calc(0.5 * var(--padding)) 0;

		summary {
			position: sticky;
			background: var(--background);
			top: 0;
			display: block;
			color: var(--sk-fg-4);
			text-transform: uppercase;
			padding: calc(0.5 * var(--padding)) var(--padding);
			font: var(--sk-font-ui-medium);
			z-index: 2;
			user-select: none;

			&:focus-visible {
				outline-offset: -3px;
			}

			&::after {
				content: '';
				position: absolute;
				right: 1.6rem;
				top: calc(50% - 1rem);
				width: 2rem;
				height: 2rem;
				background: currentColor;
				mask: url(icons/chevron);
				mask-size: contain;
				rotate: -90deg;
				transition: rotate 0.2s;
			}

			[open] &::after {
				rotate: 90deg;
			}

			span:not(:last-child)::after {
				content: ' • ';
			}

			&::-webkit-details-marker {
				display: none;
			}
		}
	}

	a {
		display: block;
		text-decoration: none;
		line-height: 1;
		padding: 1.2rem var(--padding) 1.2rem calc(4rem + var(--padding));
		overflow: hidden;
		background: var(--background);
		font: var(--sk-font-ui-medium);
		color: inherit;

		&::before {
			content: '';
			position: absolute;
			width: 5rem;
			top: 0;
			left: 0;
			height: 100%;
			background: currentColor;
			mask: url(icons/document) no-repeat 50% 50%;
			mask-size: 2rem;
		}

		&.fragment::before {
			mask-image: url(icons/hash);
		}

		&:hover {
			--background: var(--sk-bg-3);
			text-decoration: none;
		}

		&:focus {
			outline-offset: -3px;
		}

		strong,
		span {
			display: block;
			white-space: nowrap;
			line-height: 1;
			text-overflow: ellipsis;
		}

		strong {
			width: 100%;
			overflow: hidden;
			font: var(--sk-font-ui-medium);

			span {
				display: inline;

				&:not(:last-child)::after {
					content: ' • ';
					position: relative;
					color: var(--sk-fg-4);
					font: var(--sk-font-ui-small);
					top: -0.1rem;
				}
			}
		}

		.excerpt {
			position: relative;
			width: calc(100% + 1rem);
			left: -0.5rem;
			overflow: hidden;

			&::before,
			&::after {
				content: '';
				position: absolute;
				width: 1rem;
				top: 0;
				height: 100%;
			}

			&::before {
				left: 0;
				background: linear-gradient(to left, transparent, var(--background));
			}

			&::after {
				right: 0;

				background: linear-gradient(to right, transparent, var(--background));
			}

			span {
				color: var(--sk-fg-3);
				font: var(--sk-font-ui-small);
				margin: 0.4rem 0 0 0;
			}

			:global(.spacer) {
				display: inline-block;
				width: 0.7rem;
				height: 1rem;
			}
		}

		:global(mark) {
			--highlight-color: rgba(255, 255, 0, 0.4);
			background: none;
			background: var(--highlight-color);
			outline: 2px solid var(--highlight-color);
		}
	}
</style>
