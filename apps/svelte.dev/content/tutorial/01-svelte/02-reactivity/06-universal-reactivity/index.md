---
title: Universal reactivity
---

In the preceding exercises, we used runes to add reactivity inside components. But we can also use runes _outside_ components, for example to share some global state.

The `<Counter>` components in this exercise are all importing the `counter` object from `shared.js`. But it's a normal object, and so nothing happens when you click the buttons. Wrap the object in `$state(...)`:

```js
/// file: shared.js
export const counter = +++$state({+++
	count: 0
+++})+++;
```

This causes an error, because you can't use runes in normal `.js` files, only `.svelte.js` files. Let's fix that — rename the file to `shared.svelte.js`.

Then, update the import declaration in `Counter.svelte`:

```svelte
/// file: Counter.svelte
<script>
	import { counter } from './shared+++.svelte+++.js';
</script>
```

Now, when you click any button, all three update simultaneously.

> [!NOTE] You cannot export a `$state` declaration from a module if the declaration is reassigned (rather than just mutated), because the importers would have no way to know about it.
