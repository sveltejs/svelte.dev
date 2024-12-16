<script lang="ts">
	const { iframe } = $props();

	let devtools_iframe: HTMLElement;

	$effect(() => {
		if (iframe) {
			const iframe_window = iframe.contentWindow;
			iframe_window.addEventListener('preview_ready', () => {
				iframe_window.ChiiDevtoolsIframe = devtools_iframe;
				iframe_window.initialize_devtools();
			});

			window.addEventListener('message', (event) => {
				if (typeof event.data === 'string') {
					iframe_window.postMessage(event.data, event.origin);
				}
			});
		}
	});
</script>

<iframe title="Svelte Playground" bind:this={devtools_iframe}></iframe>

<style>
	iframe {
		border: 0;
	}
</style>
