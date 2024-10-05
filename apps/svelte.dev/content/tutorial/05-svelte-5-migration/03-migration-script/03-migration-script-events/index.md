---
title: Migrating event modifiers
---

- various event modifiers from `svelte/legacy`: Event modifiers cannot be used with event attributes, as such they are deprecated. If applicable migrate away from using the higher order functions towards simple calls on the event object (for example `onclick={preventDefault(() => ...)}` -> `onclick={e => { e.preventDefault(); ... }}`)

TODO
