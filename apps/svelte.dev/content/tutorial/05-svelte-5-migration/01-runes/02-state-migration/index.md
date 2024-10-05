---
title: State
---

At the heart of Svelte 5 is the new runes API. Runes are basically compiler instructions that inform Svelte about reactivity. Syntactically, runes are functions starting with a dollar-sign.

In Svelte 4, a `let` declaration at the top level of a component was implicitly reactive. In Svelte 5, things are more explicit: a variable is reactive when created using the `$state` rune. Let's migrate the counter to runes mode by wrapping the counter in `$state`:

```svelte
<script>
	let count = +++$state(+++0+++)+++;
</script>
```

Nothing else changes. `count` is still the number itself, and you read and write directly to it, without a wrapper like `.value` or `getCount()`.

## Why we did this

`let` being implicitly reactive at the top level worked great, but it meant that reactivity was constrained - a `let` declaration anywhere else was not reactive. This forced you to resort to using stores when refactoring code out of the top level of components for reuse. This meant you had to learn an entirely separate reactivity model, and the result often wasn't as nice to work with. Because reactivity is more explicit in Svelte 5, you can keep using the same API in an outside the top level of components. Head to TODO LINK TO TUTORIAL to learn more.
