---
title: Deep state
---

As we saw in the previous exercise, state reacts to _reassignments_. But it also reacts to _mutations_ — we call this _deep reactivity_.

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

> [!NOTE] Deep reactivity is implemented using [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), and mutations to the proxy do not affect the original object.
