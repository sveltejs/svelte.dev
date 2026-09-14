<script>
	const options = ['h1', 'h2', 'h3', 'p', 'marquee'];
	let selected = $state(options[0]);
</script>

<select bind:value={selected}>
	{#each options as option}
		<option value={option}>{option}</option>
	{/each}
</select>

<!-- TODO replace with svelte:element block -->
{#if selected === 'h1'}
	<h1>I'm a <code>&lt;h1&gt;</code> element</h1>
{:else}
	<p>others...</p>
{/if}
