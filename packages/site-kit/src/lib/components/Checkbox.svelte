<script lang="ts">
	let {
		checked = $bindable(),
		onchange
	}: { checked: boolean; onchange?: (value: boolean) => void } = $props();
</script>

<input type="checkbox" bind:checked onchange={(e) => onchange?.(e.currentTarget.checked)} />

<style>
	input[type='checkbox'] {
		--thumb-size: 1em;
		--track-padding: 2px;
		/* display: block; */
		position: relative;
		height: calc(var(--thumb-size) + 2 * var(--track-padding));
		width: calc(2 * var(--thumb-size) + 2 * var(--track-padding));
		border-radius: 0.5em;
		-webkit-appearance: none;
		appearance: none;
		border: transparent;
	}

	input[type='checkbox']::before {
		content: '';
		position: absolute;
		display: block;
		height: 100%;
		width: 100%;
		top: 0;
		left: 0;
		border-radius: 9999px;
		background: var(--sk-bg-4);
		box-sizing: border-box;
	}

	input[type='checkbox']:checked::before {
		background: var(--sk-fg-accent);
	}

	input[type='checkbox']::after {
		content: '';
		position: absolute;
		display: block;
		height: var(--thumb-size);
		aspect-ratio: 1;
		top: var(--track-padding);
		left: var(--track-padding);
		border-radius: 1em;
		background: var(--sk-bg-1);
		box-shadow:
			0 0px 1px rgba(0, 0, 0, 0.4),
			0 4px 2px rgba(0, 0, 0, 0.1);
		transition:
			background 0.2s ease-out,
			left 0.2s ease-out;
	}

	input[type='checkbox']:checked::after {
		left: calc(100% - var(--thumb-size) - var(--track-padding));
	}
</style>
