---
title: Derivations
---

In Svelte 4, a `$:` statement at the top level of a component could be used to declare a derivation, i.e. state that is entirely defined through a computation of other state. In Svelte 5, this is achieved using the `$derived` rune:

```svelte
<script>
	let count = +++$state(+++0+++)+++;
	---$:--- +++const+++ double = +++$derived(+++count * 2+++)+++;
</script>
```

As with `$state`, nothing else changes. `double` is still the number itself, and you read it directly, without a wrapper like `.value` or `getCount()`.

## Why we did this

`$:` was a great shorthand and intuitive to get started with: you could slap a `$:` in front of most code and it would somehow work. This intuitiveness was also its drawback the more complicated your code became, because it wasn't as easy to reason about. Was the intent of the code to create a derivation, or a side effect?

There were also gotchas that were hard to spot:

- `$:` only updated directly before rendering, which meant you could read stale values in-between rerenders
- `$:` only ran once per tick, which meant that statements may run less often than you think
- `$:` dependencies were determined through static analysis of the dependencies. This worked in most cases, but could break in subtle ways during a refactoring where dependencies would be for example moved into a function and no longer be visible as a result
- `$:` statements were also ordered by using static analysis of the dependencies. In some cases there could be ties and the ordering would be wrong as a result, needing manual interventions. Ordering could also break while refactoring code and some dependencies no longer being visible as a result.

Lastly, it wasn't TypeScript-friendly (our editor tooling had to jump through some hoops to make it valid for TypeScript), which was a blocker for making Svelte's reactivity model truly universal.

`$derived` fixes all of these by

- always returning the latest value
- running as often as needed to be stable
- determining the dependencies at runtime, and therefore being immune to refactorings
- executing dependencies as need and therefore being immune to ordering problems
- being TypeScript-friendly
