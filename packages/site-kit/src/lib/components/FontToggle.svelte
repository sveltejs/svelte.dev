<script lang="ts">
	let font = $state('elegant');

	$effect(() => {
		try {
			font = localStorage.getItem('svelte:font') ?? 'elegant';
		} catch {
			// localStorage access disabled
		}
	});

	function toggle() {
		font = font === 'elegant' ? 'boring' : 'elegant';

		document.documentElement.classList.remove('font-elegant');
		document.documentElement.classList.remove('font-boring');

		document.documentElement.classList.add(`font-${font}`);

		try {
			localStorage.setItem('svelte:font', font);
		} catch {
			// localStorage access disabled
		}
	}
</script>

<button
	onclick={toggle}
	class="raised"
	type="button"
	aria-pressed={font === 'boring'}
	aria-label="Toggle font"
>
	<span class="icon"></span>
</button>

<style>
	.icon {
		mask-size: 2rem;
		mask-image: url(icons/font-elegant);
	}

	button[aria-pressed='false'] .icon {
		mask-image: url(icons/font-boring);
	}
</style>
