<script module>
	import { tick } from 'svelte';
	import { persisted } from 'svelte-persisted-store';
	import { browser } from '$app/environment';

	const prefers_ts = persisted('svelte:prefers-ts', true);

	if (browser) {
		prefers_ts.subscribe((ts) => {
			document.body.classList.toggle('prefers-js', !ts);
		});
	}
</script>

<script lang="ts">
	async function onchange(e: Event) {
		const target = e.target as HTMLSelectElement;
		const is_ts_version = target.parentElement!.classList.contains('ts-version');
		const use_ts = target.value === 'TypeScript';
		prefers_ts.set(use_ts);

		await tick();

		// Focus the select that is now visible
		let prev: HTMLSelectElement | null = null;
		for (const select of document.querySelectorAll<HTMLSelectElement>('select.ts-js-select')) {
			if (use_ts && prev === target && !is_ts_version) {
				select.focus();
				break;
			} else if (!use_ts && select === target && is_ts_version) {
				prev!.focus();
				break;
			}

			prev = select;
		}
	}
</script>

<select class="ts-js-select" value={$prefers_ts ? 'TypeScript' : 'JavaScript'} {onchange}>
	<option>TypeScript</option>
	<option>JavaScript</option>
</select>

<style>
	:global(.code-block) select {
		top: 6px;
		position: absolute;
		right: 4rem;
		font-size: var(--sk-text-xs);
		padding: 0.25rem 0.5rem;
		border: none;
		border-radius: 4px;
		background-color: var(--sk-back-4);
		color: var(--sk-text-2);
		&:hover {
			background-color: var(--sk-back-2);
			cursor: pointer;
		}
	}
</style>
