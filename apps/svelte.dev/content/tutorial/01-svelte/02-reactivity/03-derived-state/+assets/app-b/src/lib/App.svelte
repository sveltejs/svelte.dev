<script>
	let numbers = $state([1, 2, 3, 4]);
	let total = $derived(numbers.length * (numbers.length + 1) / 2);

	function addNumber() {
		numbers.push(numbers.length + 1);
	}
</script>

<p>{numbers.join(' + ')} = {total}</p>

<button onclick={addNumber}>
	Add a number
</button>
