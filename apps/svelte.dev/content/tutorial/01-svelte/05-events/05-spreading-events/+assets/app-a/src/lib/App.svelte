<script>
	import BigRedButton from './BigRedButton.svelte';
	import horn from './horn.mp3';

	const audio = new Audio();
	audio.src = horn;

	function honk() {
		audio.load();
		audio.play();
	}
</script>

<BigRedButton onclick={honk} />
