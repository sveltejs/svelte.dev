---
title: Raw state
---

In previous exercises, we learned that state is [deeply reactive](deep-state) — if you (for example) change a property of an object, or push to an array, it will cause the UI to update. This works by creating a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) that intercepts reads and writes.

Occasionally, that's not what you want. If you're not changing individual properties, or if it's important to maintain referential equality, then you can use _raw state_ instead.

In this example, we have a chart of Svelte's steadily increasing stock price. We want the chart to update when new data comes in, which we could achieve by turning `data` into state...

```js
/// file: App.svelte
let data = +++$state(poll())+++;
```

...but there's no need to make it deeply reactive when it will be discarded a few milliseconds later. Instead, use `$state.raw`:

```js
/// file: App.svelte
let data = +++$state.raw(poll())+++;
```

> [!NOTE] Mutating raw state will have no direct effect. In general, mutating non-reactive state is strongly discouraged.
