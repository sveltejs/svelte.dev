<script lang="ts">
	let font = $state('elegant');

	$effect(() => {
		font = localStorage.getItem('svelte:font') ?? 'elegant';
	});

	function toggle() {
		font = font === 'elegant' ? 'boring' : 'elegant';

		document.documentElement.classList.remove('font-elegant');
		document.documentElement.classList.remove('font-boring');

		document.documentElement.classList.add(`font-${font}`);
		localStorage.setItem('svelte:font', font);
	}
</script>

<button
	onclick={toggle}
	class="raised icon"
	type="button"
	aria-pressed={font === 'boring'}
	aria-label="Toggle font"
></button>

<style>
	button {
		background-size: 2rem;
	}

	button[aria-pressed='true'] {
		background-image: url(../icons/font-elegant-light.svg);

		:global(.dark) & {
			background-image: url(../icons/font-elegant-dark.svg);
		}
	}

	button[aria-pressed='false'] {
		background-image: url(../icons/font-boring-light.svg);

		:global(.dark) & {
			background-image: url(../icons/font-boring-dark.svg);
		}
	}
</style>
