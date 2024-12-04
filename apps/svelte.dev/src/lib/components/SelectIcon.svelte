<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { trap } from '@sveltejs/site-kit/actions';
	import { Icon } from '@sveltejs/site-kit/components';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let open = $state(false);

	afterNavigate(() => {
		open = false;
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			open = false;
		}
	}}
/>

<details
	class="examples-select"
	bind:open
	ontoggle={(e) => {
	const details = e.currentTarget;
	if (!details.open) return;

	// close all details elements...
	for (const child of details.querySelectorAll('details[open]')) {
		(child as HTMLDetailsElement).open = false;
	}

	// except parents of the current one
	const current = details.querySelector(`[href="${$page.url.pathname}"]`);

	let node = current as Element;

	while ((node = (node.parentNode) as Element) && node !== details) {
		if (node.nodeName === 'DETAILS') {
			(node as HTMLDetailsElement).open = true;
		}
	}
}}
>
	<summary class="raised icon"><Icon name="menu" /></summary>

	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (handled by <svelte:window>) -->
	<div class="modal-background" onclick={() => (open = false)}></div>

	<div class="contents" use:trap>
		{@render children()}
	</div>
</details>

<style>
	.examples-select {
		position: relative;

		&:has(:focus-visible) .raised.icon {
			outline: 2px solid var(--sk-fg-accent);
			border-radius: var(--sk-border-radius);
		}

		span {
			pointer-events: none;
		}
	}

	select {
		opacity: 0.0001;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	summary {
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
	}

	.modal-background {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: grayscale(0.7) blur(3px);
		z-index: 9998;
	}

	.contents {
		position: absolute;
		z-index: 9999;
		background: white;
		padding: 1rem;
		border-radius: var(--sk-border-radius);
		filter: var(--sk-shadow);
		max-height: calc(100vh - 16rem);
		overflow-y: auto;
	}

	.icon {
		position: relative;
		color: var(--sk-fg-3);
		line-height: 1;
		background-size: 1.8rem;
		z-index: 999;
	}

	.icon:hover,
	.icon:focus-visible {
		opacity: 1;
	}
</style>
