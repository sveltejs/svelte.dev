<script>
    let count = $state(0);
</script>

<button onclick={() => {
    count++;
}}>Clicking this button is safe</button>
<p>You clicked the boring button {count} times</p>
