<script>
	let coords = $state({ x: 50, y: 50 });
	let size = $state(10);
</script>

<svg
	onmousemove={(e) => {
		coords = { x: e.clientX, y: e.clientY };
	}}
	onmousedown={() => (size = 30)}
	onmouseup={() => (size = 10)}
	role="presentation"
>
	<circle
		cx={coords.x}
		cy={coords.y}
		r={size}
	></circle>
</svg>

<div class="controls">
	<label>
		<h3>stiffness ({coords.stiffness})</h3>
		<input
			bind:value={coords.stiffness}
			type="range"
			min="0.01"
			max="1"
			step="0.01"
		/>
	</label>

	<label>
		<h3>damping ({coords.damping})</h3>
		<input
			bind:value={coords.damping}
			type="range"
			min="0.01"
			max="1"
			step="0.01"
		/>
	</label>
</div>

<style>
	svg {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
	}

	circle {
		fill: #ff3e00;
	}

	.controls {
		position: absolute;
		top: 1em;
		right: 1em;
		width: 200px;
		user-select: none;
	}

	.controls input {
		width: 100%;
	}
</style>
