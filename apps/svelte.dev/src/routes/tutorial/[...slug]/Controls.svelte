<script lang="ts">
	import { page } from '$app/state';
	import SecondaryNav from '$lib/components/SecondaryNav.svelte';
	import ModalDropdown from '$lib/components/ModalDropdown.svelte';
	import type { Exercise, PartStub } from '$lib/tutorial';
	import { Checkbox, Icon, Toolbox } from '@sveltejs/site-kit/components';
	import type { Workspace } from '@sveltejs/repl/workspace';

	interface Props {
		index: PartStub[];
		exercise: Exercise;
		completed: boolean;
		toggle: () => void;
		workspace: Workspace;
	}

	let { index, exercise, completed, toggle, workspace }: Props = $props();
</script>

<SecondaryNav>
	<ModalDropdown label="Menu">
		<div class="secondary-nav-dropdown">
			{#each index as part}
				<details>
					<summary>{part.title}</summary>

					{#each part.chapters as chapter}
						<details>
							<summary>{chapter.title}</summary>

							<ul>
								{#each chapter.exercises as exercise}
									<li value={exercise.slug}>
										<a
											aria-current={page.url.pathname === `/tutorial/${exercise.slug}`
												? 'page'
												: undefined}
											href="/tutorial/{exercise.slug}">{exercise.title}</a
										>
									</li>
								{/each}
							</ul>
						</details>
					{/each}
				</details>
			{/each}
		</div>
	</ModalDropdown>

	<a
		href={exercise.prev ? `/tutorial/${exercise.prev?.slug}` : undefined}
		aria-label={exercise.prev && 'Previous exercise'}
	>
		<Icon name="arrow-left" size={18} />
	</a>
	<a
		href={exercise.next ? `/tutorial/${exercise.next?.slug}` : undefined}
		aria-label={exercise.next && 'Next exercise'}
	>
		<Icon name="arrow-right" size={18} />
	</a>

	<div class="breadcrumbs">
		<span>{exercise.part.title}</span>
		<span>{exercise.chapter.title}</span>
		<span>{exercise.title}</span>
	</div>

	<button class="raised" class:completed disabled={!exercise.has_solution} onclick={toggle}>
		{#if completed && exercise.has_solution}
			reset
		{:else}
			solve
		{/if}
	</button>

	<Toolbox>
		<label class="option">
			<span>Toggle Vim mode</span>
			<Checkbox bind:checked={workspace.vim}></Checkbox>
		</label>
	</Toolbox>
</SecondaryNav>

<style>
	a {
		color: inherit;

		&:not([href]) {
			opacity: 0.1;
			cursor: default;
		}

		&[aria-current='page'] {
			color: var(--sk-fg-accent);
		}
	}

	.breadcrumbs {
		flex: 1;
		font: var(--sk-font-ui-medium);
		overflow: hidden;
		text-overflow: ellipsis;

		span:not(:last-child)::after {
			content: ' / ';
			color: var(--sk-fg-4);
			font: var(--sk-font-ui-small);
		}
	}

	button {
		height: 3.2rem;
		padding: 0 1rem;
		font: var(--sk-font-ui-small);
	}
</style>
