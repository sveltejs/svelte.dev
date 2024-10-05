---
title: Migration script limitations
---

There are also a few things that the migration script cannot migrate automatically:

- `beforeUpdate`/`afterUpdate`: These are deprecated and no longer work in runes mode. Since the migration script cannot infer the intent of why you use `beforeUpdate/afterUpdate`, it will not migrate them. In general, you will want to migrate `beforeUpdate` to `$effect.pre` and `afterUpdate` to `$effect`. When migrating, make sure the right dependencies are read within the effects so that the rerun at the appropriate times
- `createEventDispatcher` and component events: The migration runs file by file, and it's not clear whether or not a given component is from your own project, or coming from a third party library. Therefore both event dispatcher and event listeners are left as is.
- complex edge cases: Certain combinations of old syntax features are too involved to migrate automatically

TODO how to tutorialize?
