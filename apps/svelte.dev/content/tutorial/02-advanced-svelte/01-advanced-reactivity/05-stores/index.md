---
title: Stores
---

Prior to the introduction of runes in Svelte 5, stores were the idiomatic way to handle reactive state outside components. That's no longer the case, but you'll still encounter stores when using Svelte (including in SvelteKit, for now), so it's worth knowing how to use them.

> [!NOTE] We won't cover how to create your own custom stores — for that, [consult the documentation](/docs/svelte/stores).

Let's revisit the example from the [universal reactivity](universal-reactivity) exercise, but this time implement the shared state using a store.

In `shared.js` we're currently exporting `count`, which is a number. Turn it into a writable store:

```js
/// file: shared.js
+++import { writable } from 'svelte/store';+++

export const count = +++writable(0)+++;
```

To reference the value of the store, we prefix it with a `$` symbol. In `Counter.svelte`, update the text inside the `<button>` so that it no longer says `[object Object]`:

```svelte
/// file: Counter.svelte
<button onclick={() => {}}>
	clicks: {+++$count+++}
</button>
```

Finally, add the event handler. Because this is a writable store, we can update the value programmatically using its `set` or `update` method...

```js
count.update((n) => n + 1);
```

...but since we're in a component we can continue using the `$` prefix:

```svelte
/// file: Counter.svelte
<button onclick={() => +++$count += 1+++}>
	clicks: {$count}
</button>
```
