<script>
	let a = $state(1);
	let b = $state(2);
</script>

<label>
	<input type="number" value={a} min="0" max="10" />
	<input type="range" value={a} min="0" max="10" />
</label>

<label>
	<input type="number" value={b} min="0" max="10" />
	<input type="range" value={b} min="0" max="10" />
</label>

<p>{a} + {b} = {a + b}</p>
