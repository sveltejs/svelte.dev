---
title: Deep state
---

In addition to making _primitive_ values (like strings and numbers) reactive, the `$state` rune makes arrays and objects _deeply_ reactive.

Make `numbers` a reactive array:

```js
/// file: App.svelte
let numbers = +++$state([1, 2, 3, 4])+++;
```

Now, when we change the array...

```js
/// file: App.svelte
function addNumber() {
	+++numbers[numbers.length] = numbers.length + 1;+++
}
```

...the component updates. Or better still, we can `push` to the array instead:

```js
/// file: App.svelte
function addNumber() {
	+++numbers.push(numbers.length + 1);+++
}
```
