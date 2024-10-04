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
	<button disabled={loading || !refresh} class="reload icon" onclick={refresh} aria-label="reload"
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

	<a
		{href}
		class="new-tab icon"
		target="_blank"
		aria-label={href ? 'open in new tab' : undefined}
		tabindex="0"
	></a>

	<button
		disabled={loading || !toggle_terminal}
		class="terminal icon"
		onclick={() => toggle_terminal?.()}
		aria-label="toggle terminal"
	></button>
</div>

<style>
	.chrome {
		width: 100%;
		height: 4rem;
		display: flex;
		border-top: 1px solid var(--sk-back-4);
	}

	button {
		user-select: none;
	}

	input {
		flex: 1;
		padding: 0.5rem 1rem 0.4rem 1rem;
		border: none;
		background-color: var(--sk-back-3);
		color: var(--sk-text-1);
		font-family: inherit;
		font-size: 1.6rem;
	}

	a:focus-visible,
	button:focus-visible,
	input:focus-visible {
		outline-offset: -2px;
	}

	.icon,
	.icon::after {
		position: relative;
		height: 100%;
		aspect-ratio: 1;
		background: var(--sk-back-4) no-repeat 50% 50%;
		background-size: 2rem;
	}

	a:not([href]) {
		opacity: 0.5;
	}

	.new-tab {
		background-image: url($lib/icons/external.svg);
	}

	.terminal {
		background-image: url($lib/icons/terminal.svg);
	}

	.reload::after {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		background-image: url($lib/icons/refresh.svg);
		transition: 0.2s ease-out;
	}

	.reload:active::after {
		transform: rotate(-360deg);
		transition: none;
	}
</style>
