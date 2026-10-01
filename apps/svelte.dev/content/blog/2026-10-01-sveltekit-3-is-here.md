---
title: SvelteKit 3 is here
description: Get it while it's hot
author: The Svelte team
authorURL: https://svelte.dev/
---

Version 3.0 of SvelteKit, the official application framework for Svelte, is now available.

If you've used earlier versions of SvelteKit, everything will feel very familiar — it's the same framework with a little more polish, a little more type safety, and a little less junk. We've made migration as seamless as we can with the `sv migrate` command...

```bash
npx sv migrate sveltekit-3 --tasks all --confirm
```

...which will automatically migrate as much of your codebase as possible, and generate a TODO list for everything else. (If you're agentically inclined, your robot friends will make short work of it.)

To create a _new_ app, run [`sv create`](/docs/cli/sv-create):

```bash
npx sv create my-new-app
```

As with any major version bump there are a handful of breaking changes to be aware of, which are covered in the [migration guide](/docs/kit/migrating-to-sveltekit-3) (or, more briefly, in the recent [release candidate announcement](sveltekit-3-release-candidate)).

Quick highlights:

- configuration now lives in `vite.config.ts` instead of `svelte.config.js`
- the `$lib` alias is now `#lib`, making use of standard [subpath imports](https://nodejs.org/api/packages.html#subpath-imports)
- [environment variables](/docs/kit/environment-variables) are more powerful and easier to use
- [service workers](/docs/kit/service-workers) are less boilerplatey
- error handling is improved across the board

## Are remote functions ready yet?

Not quite. But it's our top priority!

[Remote functions](/docs/kit/remote-functions) are a set of utilities for secure, efficient, type-safe client-server communication. You've likely seen some version of this idea in other frameworks, but we think you're going to prefer this one.

Using them requires [Async Svelte](/docs/svelte/await-expressions), which for now requires an `experimental` flag. Bear with us.

## Join us in Ljubljana next month

This is as good a place as any to remind everyone that the next in-person [Svelte Summit](https://sveltesummit.com/) is taking place on November 19-20 in the lovely town of Ljubljana, Slovenia. Among other things it will be a celebration of Svelte's 10th birthday, and we'd love to share some cake with you.
