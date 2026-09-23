---
title: updated
---

The `updated` state is `true` if a new version of the app has been deployed since the page was first opened.

Version polling happens once an hour by default. SvelteKit also checks for a new version after receiving responses to data requests, remote function calls and form actions, and when the tab gains focus or becomes visible. This exercise sets a shorter `version.pollInterval` in `vite.config.js` as a demo override.

```svelte
/// file: src/routes/+layout.svelte
<script>
	import { page, navigating, +++updated+++ } from '$app/state';
</script>
```

Version checks only happen in production, not during development. For that reason, `updated.current` will always be `false` in this tutorial.

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

> [!NOTE] Prior to SvelteKit 2.12, you had to use `$app/stores` for this, which provides an `$updated` store with the same information. It was removed in favor of `$app/state` in SvelteKit 3.

> [!NOTE] SvelteKit 2 did not poll by default and had no checks on backend requests.
