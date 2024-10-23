<script lang="ts">
	import { goto } from '$app/navigation';
	import SecondaryNav from '$lib/components/SecondaryNav.svelte';
	import SelectIcon from '$lib/components/SelectIcon.svelte';
	import type { Exercise, PartStub } from '$lib/tutorial';
	import { Icon } from '@sveltejs/site-kit/components';

	interface Props {
		index: PartStub[];
		exercise: Exercise;
		completed: boolean;
		toggle: () => void;
	}

	let { index, exercise, completed, toggle }: Props = $props();

	// TODO this really sucks, why is `exercise.slug` not the slug?
	let actual_slug = $derived.by(() => {
		const parts = exercise.slug.split('/');
		return `${parts[1]}/${parts[3]}`;
	});
</script>

<SecondaryNav>
	<SelectIcon
		value={actual_slug}
		onchange={(e) => {
			goto(`/tutorial/${e.currentTarget.value}`);
		}}
	>
		{#each index as part}
			<optgroup label={part.title}>
				{#each part.chapters as chapter}
					<option disabled>{chapter.title}</option>

					{#each chapter.exercises as exercise}
						<option value={exercise.slug}>{exercise.title}</option>
					{/each}
				{/each}
			</optgroup>
		{/each}
	</SelectIcon>

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
</SecondaryNav>

<style>
	a {
		color: inherit;

		&:not([href]) {
			opacity: 0.1;
			cursor: default;
		}
	}

	.breadcrumbs {
		flex: 1;
		font: var(--sk-font-ui-medium);
		overflow: hidden;
		text-overflow: ellipsis;

		span:not(:last-child)::after {
			content: ' / ';
			color: var(--sk-text-4);
			font: var(--sk-font-ui-small);
		}
	}

	button {
		height: 3.2rem;
		padding: 0 1rem;
		font: var(--sk-font-ui-small);
	}

	option:disabled {
		color: var(--sk-text-1);
		font-weight: bold;
	}
</style>
