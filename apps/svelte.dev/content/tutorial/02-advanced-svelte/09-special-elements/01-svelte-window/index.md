---
title: <svelte:window>
---

Just as you can add event listeners to any DOM element, you can add event listeners to the `window` object with `<svelte:window>`.

We've already got an `onkeydown` function declared — now all we need to do is wire it up:

```svelte
/// file: App.svelte
<svelte:window +++{onkeydown}+++ />
```
