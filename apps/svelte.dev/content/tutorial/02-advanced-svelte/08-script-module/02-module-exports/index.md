---
title: Exports
---

Anything exported from a `module` script block becomes an export from the module itself. Let's export a `pauseAll` function:

```svelte
/// file: AudioPlayer.svelte
<script module>
	let current;

+++	export function pauseAll() {
		current?.pause();
	}+++
</script>
```

We can now import `pauseAll` in `App.svelte`...

```svelte
/// file: App.svelte
<script>
	import AudioPlayer, +++{ pauseAll }+++ from './AudioPlayer.svelte';
	import { tracks } from './tracks.js';
</script>
```

...and use it in an event handler:

```svelte
/// file: App.svelte
<div class="centered">
	{#each tracks as track}
		<AudioPlayer {...track} />
	{/each}

+++	<button onclick={pauseAll}>
		pause all
	</button>+++
</div>
```

> [!NOTE] You can't have a default export, because the component _is_ the default export.
