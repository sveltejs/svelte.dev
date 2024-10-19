---
title: Component bindings
---

Just as you can bind to properties of DOM elements, you can bind to component props. For example, we can bind to the `value` prop of this `<Keypad>` component as though it were a form element.

First, we need to mark the prop as _bindable_. Inside `Keypad.svelte`, update the `$props()` declaration to use the `$bindable` rune:

```js
/// file: Keypad.svelte
let { value +++= $bindable('')+++, onsubmit } = $props();
```

Then, in `App.svelte`, add a `bind:` directive:

```svelte
/// file: App.svelte
<Keypad +++bind:value={pin}+++ {onsubmit} />
```

Now, when the user interacts with the keypad, the value of `pin` in the parent component is immediately updated.

> [!NOTE] Use component bindings sparingly. It can be difficult to track the flow of data around your application if you have too many of them, especially if there is no 'single source of truth'.
