---
title: updated
---

The `updated` state contains `true` or `false` depending on whether a new version of the app has been deployed since the page was first opened. For this to work, your `svelte.config.js` must specify `kit.version.pollInterval`.

```svelte
/// file: src/routes/+layout.svelte
<script>
	import { page, navigating, +++updated+++ } from '$app/state';
</script>
```

Version changes only happen in production, not during development. For that reason, `updated.current` will always be `false` in this tutorial.

You can manually check for new versions, regardless of `pollInterval`, by calling `updated.check()`.

```svelte
/// file: src/routes/+layout.svelte

+++{#if updated.current}+++
	<div class="toast">
		<p>
			A new version of the app is available

			<button onclick={() => location.reload()}>
				reload the page
			</button>
		</p>
	</div>
+++{/if}+++
```

> [!NOTE] Prior to SvelteKit 2.12, you had to use `$app/stores` for this, which provides an `$updated` store with the same information. If you're currently using `$app/stores`, we advise you to migrate towards `$app/state` (requires Svelte 5).
