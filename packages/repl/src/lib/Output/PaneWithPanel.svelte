<script lang="ts">
	import { spring } from 'svelte/motion';
	import { SplitPane, type Length } from '@rich_harris/svelte-split-pane';

	const UNIT_REGEX = /(\d+)(?:(px|rem|%|em))/i;

	export let panel: string;

	export let pos: Length = '90%';

	$: previous_pos = Math.min(+pos.replace(UNIT_REGEX, '$1'), 70);

	export let max: Length = '90%';

	// we can't bind to the spring itself, but we
	// can still use the spring to drive `pos`
	const driver = spring(+pos.replace(UNIT_REGEX, '$1'), {
		stiffness: 0.2,
		damping: 0.5
	});

	// @ts-ignore
	$: pos = $driver + '%';

	const toggle = () => {
		const numeric_pos = +pos.replace(UNIT_REGEX, '$1');

		driver.set(numeric_pos, { hard: true });

		if (numeric_pos > 80) {
			driver.set(previous_pos);
		} else {
			previous_pos = numeric_pos;
			driver.set(100);
		}
	};
</script>

<SplitPane {max} min="10%" type="vertical" bind:pos>
	{#snippet a()}
		<section>
			<slot name="main" />
		</section>
	{/snippet}

	{#snippet b()}
		<section>
			<div class="panel-header">
				<button class="panel-heading" on:click={toggle}>{panel}</button>
				<slot name="panel-header" />
			</div>

			<div class="panel-body">
				<slot name="panel-body" />
			</div>
		</section>
	{/snippet}
</SplitPane>

<style>
	.panel-header {
		height: var(--sk-pane-controls-height);
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.5rem 0.5rem 1rem;
		cursor: pointer;
	}

	.panel-body {
		overflow: auto;
	}

	.panel-heading {
		font: var(--sk-font-ui-small);
		text-transform: uppercase;
		flex: 1;
		text-align: left;
	}

	section {
		overflow: hidden;
	}
</style>
