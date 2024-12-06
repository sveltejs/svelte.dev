---
title: Inspecting state
---

It's often useful to be able to track the value of a piece of state as it changes over time.

Inside the `addNumber` function, we've added a `console.log` statement. But if you click the button and open the console drawer (using the button to the right of the URL bar), you'll see a warning, and a message saying the message could not be cloned.

That's because `numbers` is a reactive [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). There are a couple of things we can do. Firstly, we can create a non-reactive _snapshot_ of the state with `$state.snapshot(...)`:

```js
/// file: App.svelte
function addNumber() {
	numbers.push(numbers.length + 1);
	console.log(+++$state.snapshot(numbers)+++);
}
```

Alternatively, we can use the `$inspect` rune to automatically log a snapshot of the state whenever it changes. This code will automatically be stripped out of your production build:

```js
/// file: App.svelte
function addNumber() {
	numbers.push(numbers.length + 1);
	---console.log($state.snapshot(numbers));---
}

+++$inspect(numbers);+++
```

You can customise how the information is displayed by using `$inspect(...).with(fn)` — for example, you can use `console.trace` to see where the state change originated from:

```js
/// file: App.svelte
$inspect(numbers)+++.with(console.trace)+++;
```
