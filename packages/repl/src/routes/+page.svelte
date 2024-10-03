<script lang="ts">
	import Repl from '$lib/Repl.svelte';
	import { onMount } from 'svelte';
	import '@sveltejs/site-kit/styles/index.css';

	let repl: Repl;

	onMount(() => {
		repl.set({
			files: [
				{
					name: 'App',
					type: 'svelte',
					source:
						'<script>\n\tlet count = $state(0);\n\n\tfunction increment() {\n\t\tcount += 1;\n\t}\n</scr' +
						'ipt>\n\n<button onclick={increment}>\n\tclicks: {count}\n</button>'
				}
			]
		});
	});
</script>

<main>
	<Repl vim bind:this={repl} showAst />
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	main {
		height: 100vh;
	}
</style>
