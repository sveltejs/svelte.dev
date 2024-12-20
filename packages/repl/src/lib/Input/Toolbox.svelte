<script lang="ts">
	import { Checkbox, Dropdown, HoverMenu, Icon } from '@sveltejs/site-kit/components';
	import { get_repl_context } from '../context';

	let { can_migrate }: { can_migrate: boolean } = $props();

	const { migrate, workspace } = get_repl_context();
</script>

<Dropdown align="right">
	<div class="target">
		<span class="wrench" role="presentation"></span>
		<Icon name="chevron-down" />
	</div>

	{#snippet dropdown()}
		<HoverMenu>
			<label class="option">
				<span>Toggle Vim mode</span>
				<Checkbox bind:checked={workspace.vim}></Checkbox>
			</label>

			<button disabled={!can_migrate} onclick={migrate}>Migrate to Svelte 5, if possible</button>
		</HoverMenu>
	{/snippet}
</Dropdown>

<style>
	.target {
		text-transform: uppercase;
		font: var(--sk-font-ui-small);
		position: relative;
		display: flex;
		align-items: center;

		height: 100%;
		padding: 0 0.8rem;
		gap: 0.5rem;
		z-index: 2;
	}

	span.wrench {
		--icon-size: 1.8rem;
		width: 1.8rem;
		height: 1.8rem;
		z-index: 9999;
		background: url(./wrench-light.svg) no-repeat 50% 50%;
		background-size: contain;

		:root.dark & {
			background-image: url(./wrench-dark.svg);
		}
	}

	label.option {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
