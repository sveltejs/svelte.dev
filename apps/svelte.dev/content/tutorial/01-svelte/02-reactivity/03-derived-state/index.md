---
title: Derived state
---

Often, you will need to _derive_ state from other state. For this, we have the `$derived` rune:

```js
/// file: App.svelte
let numbers = $state([1, 2, 3, 4]);
+++let total = $derived(numbers.reduce((t, n) => t + n, 0));+++
```

We can now use this in our markup:

```svelte
/// file: App.svelte
<p>{numbers.join(' + ')} = +++{total}+++</p>
```

The expression inside the `$derived` declaration will be re-evaluated whenever its dependencies (in this case, just `numbers`) are updated.
