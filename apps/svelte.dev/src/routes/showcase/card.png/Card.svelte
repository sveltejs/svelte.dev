<svelte:options css="injected" />

<!--@component
the card shown where the showcase is shared, drawn as the cards of the docs and the blog are
-->

<div class="card">
	<img src="https://sveltejs.github.io/assets/artwork/svelte-machine.png" alt="Svelte Machine" />

	<div class="text">
		<span class="breadcrumbs">Showcase</span>
		<h1>Built with Svelte</h1>
	</div>
</div>

<style>
	.card {
		display: flex;
		width: 100%;
		height: 100%;
		background: white;
	}

	img {
		position: absolute;
		width: 125%;
		height: 100%;
		top: 5%;
		left: 0;
		object-fit: cover;
	}

	.text {
		display: flex;
		flex-direction: column;
		position: absolute;
		left: 80px;
		width: 55%;
		height: 80%;
		justify-content: center;
	}

	.breadcrumbs {
		font-family: 'Fira Sans';
		font-size: 32px;
		text-transform: uppercase;
		color: #555;
	}

	h1 {
		margin: 0 0 0.5em 0;
		font-family: 'DMSerif Display';
		font-size: 72px;
		font-weight: 400;
		line-height: 80px;
		color: #222;
	}
</style>
