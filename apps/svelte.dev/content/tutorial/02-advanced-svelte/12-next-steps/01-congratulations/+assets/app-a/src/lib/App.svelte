<script>
	let characters = ['🥳', '🎉', '✨'];

	let confetti = $state(new Array(100)
		.fill()
		.map((_, i) => {
			return {
				character:
					characters[i % characters.length],
				x: Math.random() * 100,
				y: -20 - Math.random() * 100,
				r: 0.1 + Math.random() * 1
			};
		})
		.sort((a, b) => a.r - b.r));

	$effect(() => {
		let frame = requestAnimationFrame(function loop() {
			frame = requestAnimationFrame(loop);

			for (const confetto of confetti) {
				confetto.y += 0.3 * confetto.r;
				if (confetto.y > 120) confetto.y = -20;
			}
		});

		return () => {
			cancelAnimationFrame(frame);
		}
	});
</script>

{#each confetti as c}
	<span
		style:left="{c.x}%"
		style:top="{c.y}%"
		style:scale={c.r}
	>
		{c.character}
	</span>
{/each}

<style>
	span {
		position: absolute;
		font-size: 5vw;
		user-select: none;
	}

	:global(body) {
		overflow: hidden;
	}
</style>
