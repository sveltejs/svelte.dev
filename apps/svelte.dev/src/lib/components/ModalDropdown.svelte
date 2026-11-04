<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { focusable_children, trap } from '@sveltejs/site-kit/actions';
	import { Icon } from '@sveltejs/site-kit/components';
	import type { Snippet } from 'svelte';

	let { children, label }: { children: Snippet; label: string } = $props();

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

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<details
	class="examples-select"
	bind:open
	ontogglecapture={(e) => {
		const details = e.target as HTMLDetailsElement;

		if (details === e.currentTarget || !details.open) {
			return;
		}

		details.scrollIntoView();
	}}
	ontoggle={(e) => {
		const details = e.currentTarget;
		if (!details.open) return;

		// close all details elements...
		for (const child of details.querySelectorAll('details[open]')) {
			(child as HTMLDetailsElement).open = false;
		}

		// except parents of the current one
		const current = details.querySelector(`[aria-current="page"]`) as HTMLAnchorElement | null;
		if (!current) return;

		let node = current as Element;

		while ((node = node.parentNode as Element) && node !== details) {
			if (node.nodeName === 'DETAILS') {
				(node as HTMLDetailsElement).open = true;
			}
		}

		current.scrollIntoView();
		current.focus();
	}}
	onkeydown={(e) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			const children = focusable_children(e.currentTarget);

			if (e.key === 'ArrowDown') {
				children.next();
			} else {
				children.prev();
			}
		}

		if (
			document.activeElement?.nodeName === 'SUMMARY' &&
			(e.key === 'ArrowLeft' || e.key === 'ArrowRight')
		) {
			(document.activeElement.parentNode as HTMLDetailsElement).open = e.key === 'ArrowRight';
		}
	}}
>
	<summary class="raised icon" aria-label={label}><Icon name="menu" /></summary>

	<div class="contents" use:trap>
		{@render children()}
	</div>
</details>

<style>
	details {
		position: relative;

		&:has(:focus-visible) .raised.icon {
			outline: 2px solid var(--sk-fg-accent);
			border-radius: var(--sk-border-radius);
		}
	}

	summary {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;

		&::-webkit-details-marker {
			display: none;
		}
	}

	details[open] summary::before {
		content: '';
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
		background: var(--sk-bg-2);
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
		z-index: 9999;
	}

	.icon:hover,
	.icon:focus-visible {
		opacity: 1;
	}
</style>
