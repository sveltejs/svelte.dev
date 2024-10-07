<script>
	let m = $state({ x: 0, y: 0 });
</script>

<div
	onpointermove={(e) => {
		m.x = e.clientX;
		m.y = e.clientY;
	}}
>
	The pointer is at {Math.round(m.x)} x {Math.round(m.y)}
</div>

<style>
	div {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		padding: 1rem;
	}
</style>
