<script>
	import tippy from 'tippy.js';

	let content = 'Hello!';

	function tooltip(node, options) {
		const tooltip = tippy(node, options);

		return {
			update(options) {
				tooltip.setProps(options);
			},
			destroy() {
				tooltip.destroy();
			}
		};
	}
</script>

<input bind:value={content} />

<button use:tooltip={{ content }}>
	Hover me
</button>

<style>
	:global([data-tippy-root]) {
		background-color: var(--bg-2);
		padding: 0.5em;
	}
</style>
