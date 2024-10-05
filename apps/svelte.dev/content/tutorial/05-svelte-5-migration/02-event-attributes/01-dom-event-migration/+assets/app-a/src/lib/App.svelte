<script>
    let version = $state(4);
</script>

<h1>Welcome to Svelte {version}!</h1>

<button onclick={() => version = 5}>Upgrade</button>
