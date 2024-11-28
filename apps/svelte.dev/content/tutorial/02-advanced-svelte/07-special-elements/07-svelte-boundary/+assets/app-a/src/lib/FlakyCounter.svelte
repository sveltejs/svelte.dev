<script>
    let count = $state(0);
</script>

<button onclick={() => {
    if (Math.random() > 0.5) {
        throw new Error('Oh no, counting up failed!');
    }
    count++;
}}>Click this button if you're feeling adventureous</button>
<p>You pressed your luck {count} times</p>
