<script lang="ts">
	import { page } from '$app/state';
	import { Icon } from '@sveltejs/site-kit/components';

	interface Props {
		repo: string;
		llms?: boolean;
		prev: null | {
			path: string;
			title: string;
		};
		next: null | {
			path: string;
			title: string;
		};
	}

	let { repo, prev, next, llms }: Props = $props();
</script>

<p class="edit">
	<a href={repo}>
		<Icon name="edit" /> Edit this page on GitHub
	</a>
	{#if llms}
		<a href={page.url.pathname.replace(/\/$/, '') + '/llms.txt'}>
			<Icon name="contents" /> llms.txt
		</a>
	{/if}
</p>

<div class="controls">
	<div class="flex">
		<span class:faded={!prev}>previous</span>
		<span class="next" class:faded={!next}>next</span>
	</div>

	<div class="flex">
		{#if prev}
			<a href={prev.path}>{prev.title}</a>
		{/if}

		{#if next}
			<a class="next" href={next.path}>{next.title}</a>
		{/if}
	</div>
</div>

<style>
	.edit {
		position: relative;
		margin: 6rem 0 2rem 0;
		font: var(--sk-font-ui-small);
		display: flex;

		a {
			text-decoration: none;
			&:first-of-type {
				margin-right: 5rem;
			}
		}

		:global(svg) {
			position: relative;
			top: -0.1rem;
			left: 0.3rem;
			width: 1.4rem;
			height: 1.4rem;
			margin-right: 0.5rem;
		}
	}

	.controls {
		max-width: calc(var(--sk-page-content-width) + 1rem);
		border-top: 1px solid var(--sk-border);
		padding: 1rem 0 0 0;
		margin: 1rem 0 0 0;
		text-wrap: balance;

		.flex {
			display: flex;
			justify-content: space-between;
			gap: 2rem;

			.next {
				text-align: right;
			}

			.next:first-child {
				flex: 1;
			}
		}

		span {
			font: var(--sk-font-ui-medium);
			text-transform: uppercase;
			color: var(--sk-fg-3);

			&.faded {
				opacity: 0.4;
			}
		}

		a {
			font: var(--sk-font-body-small);
		}
	}
</style>
