<script>
	import Keypad from './Keypad.svelte';

	let pin = $state('');

	let view = $derived(pin
		? pin.replace(/\d(?!$)/g, '•')
		: 'enter your pin');

	function onsubmit() {
		alert(`submitted ${pin}`);
	}
</script>

<h1 style="opacity: {pin ? 1 : 0.4}">
	{view}
</h1>

<Keypad {onsubmit} />
