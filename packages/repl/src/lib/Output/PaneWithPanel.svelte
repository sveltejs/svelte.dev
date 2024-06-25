<script lang="ts">
	import { spring } from 'svelte/motion';
	import { SplitPane } from '@rich_harris/svelte-split-pane';
	import type { ComponentProps, Snippet } from 'svelte';

	const UNIT_REGEX = /(\d+)(?:(px|rem|%|em))/i;

	interface Props {
		panel: string;
		pos?: Exclude<ComponentProps<SplitPane>['pos'], undefined>;
		main?: Snippet;
		panel_header?: Snippet;
		panel_body?: Snippet;
	}

	let { panel, pos = $bindable('90%'), main, panel_header, panel_body }: Props = $props();

	let previous_pos;
	$effect(() => {
		previous_pos = Math.min(+pos.replace(UNIT_REGEX, '$1'), 70);
	});

	let max: Exclude<ComponentProps<SplitPane>['max'], undefined> = '90%';

	// we can't bind to the spring itself, but we
	// can still use the spring to drive `pos`
	const driver = spring(+pos.replace(UNIT_REGEX, '$1'), {
		stiffness: 0.2,
		damping: 0.5
	});

	$effect(() => {
		pos = $driver + '%';
	});

	const toggle = () => {
		const numeric_pos = +pos.replace(UNIT_REGEX, '$1');

		driver.set(numeric_pos, { hard: true });

		if (numeric_pos > 80) {
			driver.set(previous_pos);
		} else {
			previous_pos = numeric_pos;
			driver.set(+max.replace(UNIT_REGEX, '$1'));
		}
	};
</script>

<SplitPane {max} min="10%" type="vertical" bind:pos priority="max">
	<section slot="a">
		{@render main?.()}
	</section>

	<section slot="b">
		<div class="panel-header">
			<button class="panel-heading" onclick={toggle}>{panel}</button>
			{@render panel_header?.()}
		</div>

		<div class="panel-body">
			{@render panel_body?.()}
		</div>
	</section>
</SplitPane>

<style>
	.panel-header {
		height: 42px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 0.5em;
		cursor: pointer;
	}

	.panel-body {
		overflow: auto;
	}

	.panel-heading {
		font: 700 12px/1.5 var(--sk-font);
		color: var(--sk-text-1, #333);
		flex: 1;
		text-align: left;
	}

	section {
		overflow: hidden;
	}
</style>
