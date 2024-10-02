<script>
	import tippy from 'tippy.js';

	let content = 'Hello!';

	function tooltip(node) {
		const tooltip = tippy(node);

		return {
			destroy() {
				tooltip.destroy();
			}
		};
	}
</script>

<input bind:value={content} />

<button use:tooltip>
	Hover me
</button>

<style>
	:global([data-tippy-root]) {
		background-color: var(--bg-2);
		padding: 0.5em;
	}
</style>
