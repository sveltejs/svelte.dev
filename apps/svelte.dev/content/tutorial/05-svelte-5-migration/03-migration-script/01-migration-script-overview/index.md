---
title: Migration script overview
---

By now you should have a pretty good understanding of the before->after and how the old syntax related to the new syntax. It probably also become clear that a lot of these migrations are rather technical and repetitive - something you don't want to do by hand.

We thought the same, which is why we provide a migration script to do most of the migration automatically. You can upgrade your project by using `npx svelte-migrate svelte-5`. This will do the following things:

- bump core dependencies in your `package.json`
- migrate to runes (`let` -> `$state` etc)
- migrate to event attributes for Dom elements (`on:click` -> `onclick`)
- migrate slot creations to render tags (`<slot />` -> `{@render children()}`)
- migrate slot usages to snippets (`<div slot="x">...</div>` -> `{#snippet x()}<div>...</div>{/snippet}`)
- migrate obvious component creations (`new Component(...)` -> `mount(Component, ...)`)

You can also migrate a single component in VS Code through the `Migrate to Svelte 5 syntax` command, or in our Playground through the `Migrate` button. For this tutorial, press the "solve" buttons to see what the migration script can do automatically.

As you can see, it got most of the work done. It uses some methods from `svelte/legacy` though. Let's look at these more closely in the following sections.
