<script>
	import { scale } from './utils.js';
	import { poll } from './data.js';

	let data = $state.raw(poll());

	let w = $state(1);
	let h = $state(1);

	const min = $derived(Math.min(...data) - 5);
	const max = $derived(Math.max(...data) + 5);
	const x = $derived(scale([0, data.length], [0, w]));
	const y = $derived(scale([min, max], [h, 0]));

	const ticks = $derived.by(() => {
		const result = [];
		let n = 10 * Math.ceil(min / 10);
		while (n < max) {
			result.push(n);
			n += 10;
		}
		return result;
	});

	$effect(() => {
		const interval = setInterval(() => {
			data = poll();
		}, 200);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<div class="outer">
	<svg width={w} height={h} bind:clientWidth={w} bind:clientHeight={h}>
		<line y1={h} y2={h} x2={w} />

		{#each ticks as tick}
			<g class="tick" transform="translate(0,{y(tick)})">
				<line x2={w} />
				<text x={-5}>{tick}</text>
			</g>
		{/each}

		<polyline points={data.map((d, i) => [x(i), y(d)]).join(' ')} />

		<text x={10} y={10} font-size={36}>$SVLT</text>
	</svg>
</div>

<style>
	.outer {
		width: 100%;
		height: 100%;
		padding: 2em;
		box-sizing: border-box;
	}

	svg {
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	polyline {
		fill: none;
		stroke: #ff3e00;
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	line {
		stroke: #aaa;
	}

	.tick {
		stroke-dasharray: 2 2;

		text {
			text-anchor: end;
			dominant-baseline: middle;
		}
	}
</style>
