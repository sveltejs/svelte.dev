---
title: State
---

At the heart of Svelte is a powerful system of _reactivity_ for keeping the DOM in sync with your application state — for example, in response to an event.

Make the `count` declaration reactive by wrapping the value with `$state(...)`:

```js
/// file: App.svelte
let count = +++$state(0)+++;
```

This is called a _rune_, and it's how you tell Svelte that `count` isn't an ordinary variable. Runes look like functions, but they're not — when you use Svelte, they're part of the language itself.

All that's left is to implement `increment`:

```js
/// file: App.svelte
function increment() {
	+++count += 1;+++
}
```
