<script>
	let selection = $state('');

	const onselectionchange = (e) => {
		selection = document.getSelection().toString();
	};
</script>

<svelte:document {onselectionchange} />

<h1>Select this text to fire events</h1>
<p>Selection: {selection}</p>
