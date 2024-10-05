---
title: Side effects
---

In Svelte 4, a `$:` statement at the top level of a component could also be used to create side effects. In Svelte 5, this is achieved using the `$effect` rune:

```svelte
<script>
	let count = +++$state(+++0+++)+++;
	---$:---+++$effect(() =>+++ {
		if (count > 5) {
			alert('Count is too high!');
		}
	}+++);+++
</script>
```

As with `$state`, nothing else changes. `double` is still the number itself, and you read it directly, without a wrapper like `.value` or `getCount()`.

## Why we did this

Most of the rationale is explained in the previous section already. Additionally, `$:` could be used for all kinds of things: Derivations, side effects, mix the two - you could even create state with it instead of using `let`. This meant that while it was easy to write code, it became harder to read the code and reason about it. With `$derived` and `$effect`, you have a bit more up-front decision making to do (spoiler alert: 90% of the time you want `$derived`), but future-you and other developers on your team will have an easier time.
