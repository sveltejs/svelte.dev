<script>
	import { tick } from 'svelte';

	let text = $state(`Select some text and hit the tab key to toggle uppercase`);

	async function handleKeydown(event) {
		if (event.key !== 'Tab') return;

		event.preventDefault();

		const { selectionStart, selectionEnd, value } = this;
		const selection = value.slice(selectionStart, selectionEnd);

		const replacement = /[a-z]/.test(selection) ? selection.toUpperCase() : selection.toLowerCase();

		text = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);

		await tick();
		this.selectionStart = selectionStart;
		this.selectionEnd = selectionEnd;
	}
</script>

<textarea value={text} onkeydown={handleKeydown}></textarea>

<style>
	textarea {
		width: 100%;
		height: 200px;
	}
</style>
