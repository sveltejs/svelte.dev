<script>
	let { x, y, size, rotate } = $props();

	function draw(ctx) {
		ctx.save();

		ctx.translate(x, y);
		ctx.rotate(rotate);

		ctx.strokeStyle = 'black';
		ctx.strokeRect(-size / 2, -size / 2, size, size);

		ctx.restore();
	}
</script>
