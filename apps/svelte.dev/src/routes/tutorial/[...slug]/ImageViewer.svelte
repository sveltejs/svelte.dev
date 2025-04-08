<script>
	/** @type {import('@sveltejs/repl/workspace').File | null} */
	export let selected;

	const image_types = new Map([
		// TODO add more
		['.jpg', 'image/jpeg'],
		['.jpeg', 'image/jpeg'],
		['.png', 'image/png'],
		['.gif', 'image/gif'],
		['.webp', 'image/webp']
	]);

	$: ext = selected?.basename.slice(selected.basename.lastIndexOf('.'));
	$: image_type = ext && image_types.get(ext);
	$: image = image_type && selected;
</script>

{#if image}
	<div class="image-viewer">
		<img alt="{image.name} preview" src="data:{image_type};base64,{image.contents}" />
	</div>
{/if}

<style>
	.image-viewer {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: white url(./image-viewer-background.svg);
	}

	img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}
</style>
