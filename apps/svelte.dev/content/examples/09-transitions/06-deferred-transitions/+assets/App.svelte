<script>
	import { crossfade, scale } from 'svelte/transition';
	import images from './images.js';

	const [send, receive] = crossfade({
		duration: 200,
		fallback: scale
	});

	let selected = $state.raw(null);
	let loading = $state.raw(null);

	const ASSETS = `https://sveltejs.github.io/assets/crossfade`;

	const load = (image) => {
		const timeout = setTimeout(() => (loading = image), 100);

		const img = new Image();

		img.onload = () => {
			selected = image;
			clearTimeout(timeout);
			loading = null;
		};

		img.src = `${ASSETS}/${image.id}.jpg`;
	};
</script>

<div class="container">
	<div class="phone">
		<h1>Photo gallery</h1>

		<div class="grid">
			{#each images as image}
				<div class="square">
					{#if selected !== image}
						<button
							style="background-color: {image.color};"
							onclick={() => load(image)}
							in:receive={{ key: image.id }}
							out:send={{ key: image.id }}>{loading === image ? '...' : image.id}</button
						>
					{/if}
				</div>
			{/each}
		</div>

		{#if selected}
			{#await selected then d}
				<div class="photo" in:receive|global={{ key: d.id }} out:send|global={{ key: d.id }}>
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
					<img alt={d.alt} src="{ASSETS}/{d.id}.jpg" onclick={() => (selected = null)} />

					<p class="credit">
						<a target="_blank" rel="noreferrer" href="https://www.flickr.com/photos/{d.path}"
							>via Flickr</a
						>
						&ndash;
						<a target="_blank" rel="noreferrer" href={d.license.url}>{d.license.name}</a>
					</p>
				</div>
			{/await}
		{/if}
	</div>
</div>

<style>
	.container {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}

	.phone {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 52vmin;
		height: 76vmin;
		border: 2vmin solid #ccc;
		border-bottom-width: 10vmin;
		padding: 3vmin;
		border-radius: 2vmin;
	}

	h1 {
		font-weight: 300;
		text-transform: uppercase;
		font-size: 5vmin;
		margin: 0.2em 0 0.5em 0;
	}

	.grid {
		display: grid;
		flex: 1;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(4, 1fr);
		grid-gap: 2vmin;
	}

	button {
		width: 100%;
		height: 100%;
		color: white;
		font-size: 5vmin;
		border: none;
		margin: 0;
		will-change: transform;
	}

	.photo,
	img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.photo {
		display: flex;
		align-items: stretch;
		justify-content: flex-end;
		flex-direction: column;
		will-change: transform;
	}

	img {
		object-fit: cover;
		cursor: pointer;
	}

	.credit {
		text-align: right;
		font-size: 2.5vmin;
		padding: 1em;
		margin: 0;
		color: white;
		font-weight: bold;
		opacity: 0.6;
		background: rgba(0, 0, 0, 0.4);
	}

	.credit a,
	.credit a:visited {
		color: white;
	}
</style>
