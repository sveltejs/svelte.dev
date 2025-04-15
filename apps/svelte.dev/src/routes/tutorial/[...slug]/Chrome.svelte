<script lang="ts">
	interface Props {
		path?: string;
		loading?: boolean;
		href?: string | null;
		change?: (value: { value: string }) => void;
		refresh?: () => void;
		toggle_terminal?: () => void;
	}

	let {
		path = '/',
		loading = false,
		href = null,
		change,
		refresh,
		toggle_terminal
	}: Props = $props();
</script>

<div class="chrome">
	<button
		disabled={loading || !refresh}
		class="reload icon raised"
		onclick={refresh}
		aria-label="reload"
	></button>

	<input
		disabled={loading || !change}
		aria-label="URL"
		value={path}
		onchange={(e) => {
			change?.({ value: e.currentTarget.value });
		}}
		onkeydown={(e) => {
			if (e.key !== 'Enter') return;

			change?.({ value: e.currentTarget.value });
			e.currentTarget.blur();
		}}
	/>

	<!-- TODO maybe reinstate in future, if we can make it work with non-webcontainer exercises -->
	<!-- <a
		{href}
		class="new-tab icon"
		target="_blank"
		aria-label={href ? 'open in new tab' : undefined}
		tabindex="0"
	></a> -->

	<button
		disabled={loading || !toggle_terminal}
		class="terminal raised"
		onclick={() => toggle_terminal?.()}
		aria-label="toggle terminal"><span class="icon"></span></button
	>
</div>

<style>
	.chrome {
		width: 100%;
		height: 4rem;
		display: flex;
		padding: 0.2rem;
		gap: 0.2rem;
	}

	button {
		user-select: none;
	}

	input {
		flex: 1;
		padding: 0.2rem 0.6rem;
		border: 1px solid var(--sk-border);
		/* TODO this should apply to all buttons/inputs? */
		border-radius: var(--sk-border-radius);
		font: var(--sk-font-ui-medium);
		height: 3.2rem;
	}

	button:focus-visible,
	input:focus-visible {
		outline-offset: -2px;
	}

	.icon,
	.icon::after {
		width: 3.2rem;
		aspect-ratio: 1;
		background-size: 1.8rem;
	}

	.terminal .icon {
		background: currentColor;
		mask: url(icons/terminal) 50% 50% no-repeat;
		mask-size: 1.8rem;
	}

	.reload::after {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		background: currentColor;
		mask: url(icons/refresh) no-repeat 50% 50%;
		mask-size: 1.8rem;
		transition: 0.2s ease-out;
	}

	.reload:active::after {
		transform: rotate(-360deg);
		transition: none;
	}
</style>
