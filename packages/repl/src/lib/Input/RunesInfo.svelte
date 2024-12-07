<script lang="ts">
	import { Dropdown } from '@sveltejs/site-kit/components';
	import { get_repl_context } from '../context';

	let { runes }: { runes: boolean } = $props();

	let open = $state(false);

	const { workspace } = get_repl_context();
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') open = false;
	}}
/>

<Dropdown align="right">
	<div class="target">
		<span class="lightning" class:active={runes} role="presentation"></span>

		<span>runes</span>
	</div>

	{#snippet dropdown()}
		<div class="popup">
			{#if workspace.current.name.endsWith('.svelte.js')}
				<p>
					Files with a <code>.svelte.js</code> extension are always in
					<a href="/blog/runes">runes mode</a>.
				</p>
			{:else if workspace.current.name.endsWith('.js')}
				<p>
					To use <a href="/blog/runes">runes</a> in a JavaScript file, change the extension to
					<code>.svelte.js</code>.
				</p>
			{:else if workspace.current.name.endsWith('.svelte')}
				{#if runes}
					<p>
						This component is in
						<a href="/blog/runes">runes mode</a>.
					</p>
					<p>To disable runes mode, add the following to the top of your component:</p>
					<pre><code>&lt;svelte:options runes={'{false}'} /&gt;</code></pre>
				{:else}
					<p>This component is not in <a href="/blog/runes">runes mode</a>.</p>
					<p>
						To enable runes mode, either start using runes in your code, or add the following to the
						top of your component:
					</p>
					<pre><code>&lt;svelte:options runes /&gt;</code></pre>
				{/if}
			{:else}
				<p>
					Edit a <code>.svelte</code>, <code>.svelte.js</code> or <code>.js</code> file to see
					information on <a href="/blog/runes">runes mode</a>
				</p>
			{/if}
		</div>
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

	span.lightning {
		--icon-size: 1.8rem;
		width: 1.8rem;
		height: 1.8rem;
		z-index: 9999;
		background: url(./runes-off-light.svg) no-repeat 50% 50%;
		background-size: contain;

		:root.dark &:not(.active) {
			background-image: url(./runes-off-dark.svg);
		}

		&.active {
			background-image: url(./runes-on-light.svg);
			animation: bump 0.4s;
		}
	}

	@keyframes bump {
		0% {
			background-size: var(--icon-size);
		}
		50% {
			background-size: calc(1.3 * var(--icon-size));
		}
		100% {
			background-size: var(--icon-size);
		}
	}

	.popup {
		position: absolute;
		right: -6rem;
		width: 100vw;
		max-width: 320px;
		z-index: 9999;
		background: var(--sk-bg-3);
		padding: 1em;

		p {
			font: var(--sk-font-ui-medium);
		}
	}

	.popup p:first-child {
		margin-top: 0;
	}

	.popup p:last-child {
		margin-bottom: 0;
	}
</style>
