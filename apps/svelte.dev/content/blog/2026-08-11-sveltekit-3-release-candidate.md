---
title: The SvelteKit 3 Release Candidate is here
description: We've cleaned out the junk drawer
author: The Svelte team
authorURL: https://svelte.dev/
---

SvelteKit 3 is now in the Release Candidate phase. If all goes well — meaning that people like you try it out and find that it works as expected — we will follow it up with a stable release in the near future, with no further breaking changes.

But there _are_ some breaking changes since SvelteKit 2. We're taking advantage of this release to prune some of the weeds in the codebase and lay the groundwork for SvelteKit's continued evolution, more on which [below](#Remote-functions).

To migrate an existing app, you can use [`sv migrate`](/docs/cli/sv-migrate):

```bash
npx sv migrate sveltekit-3
```

This will automatically migrate as much of your code as possible. For everything else, it will generate a TODO list for you (or your clanker of choice) to work through. Wherever possible, SvelteKit will print useful diagnostic warnings and errors if you try to run code that hasn't yet been updated.

To create a _new_ app, run [`sv create`](/docs/cli/sv-create) and select the [`experimental`](/docs/cli/experimental) add-on.

```bash
npx sv create my-new-app
```

## What's changed?

For the full list of changes, consult the [migration guide](/docs/kit/migrating-to-sveltekit-3). Most are fairly minor, but a few are worth calling out:

### Configuration now lives in `vite.config.ts`

Previously, you would configure SvelteKit via a `svelte.config.js` file. This turned out to be limiting: it's useful for the Vite plugin to have access to your config immediately rather than having to go through an asynchronous resolution process (which can't begin until after we've resolved the entire Vite config, because tools like Vitest may run with a current working directory that isn't the project root), and after all why _wouldn't_ we put the config in one place rather than two?

### The `$lib` alias is now `#lib`

In SvelteKit 2, you would put shared code in `src/lib` and import it via a `$lib` alias. This is nicer than importing from `../../../../somewhere`, which is what inevitably happens in larger codebases.

But in modern projects, aliases are unnecessary, because we have something better: [subpath imports](https://nodejs.org/api/packages.html#subpath-imports). This Node feature is natively supported by tools like Vite and TypeScript, and it means we can delete the code that previously coordinated between them. There is one small gotcha: Node and TypeScript require that your subpath imports be unambiguous — instead of importing from `#lib/foo`, you will need to import from `#lib/foo.ts` or `#lib/foo/index.ts`.

### TypeScript configuration got simpler

In SvelteKit 2, your `tsconfig.json` needed to extend the somewhat scruffy-looking `./.svelte-kit/tsconfig.json`. In SvelteKit 3, you extend `$app/tsconfig` instead. This generated config file is written to `node_modules/$app` and contains configuration that is specific to your app. While it's simpler than the SvelteKit 2 version (we no longer need to add the `$lib` alias to `"paths"`, for example) it also includes more recommended compiler options, which means you can likely delete your own `compilerOptions` unless you have esoteric requirements.

You should explicitly specify your `include` and `exclude` arrays, and the latter should include your service worker. Speaking of which:

### Service workers got a facelift

Using service workers is nicer in SvelteKit 3. Instead of the weird `$service-worker` module, which exposed the necessary tools to perform offline caching (for example), you can now just import those things from `$app/env`, `$app/paths` and the new `$app/manifest` module like every other part of your app. You can also import `self` from `$app/service-worker` to get accurate typings for `fetch` events and so on, provided you create a `tsconfig.json` alongside your service worker that extends `$app/tsconfig/service-worker`.

In future, we may expose helper functions for different caching strategies, so that it's easier to build things like offline-friendly PWAs without running into barbed wire.

### Environment variables are more powerful

SvelteKit already had arguably the most sophisticated and flexible environment variable handling of any framework. SvelteKit 3 takes it a step further with the [explicit environment variables](/docs/kit/environment-variables) feature, which are no longer behind an `experimental` flag. The gist is that you define which environment variables your app depends on, in `src/env.ts`, and specify if they should be publicly available (in which case you can import them into code that will run in the client) and whether they should be resolved at build time (in which case they can be used for optimizations like dead code elimination) or when the app boots up. You can also use [Standard Schema](https://standardschema.dev/) libraries to validate your environment variables.

In exchange, you get effortless type-safe, secure, validated environment variables that can be auto-imported when you need them.

### Error handling is way better

SvelteKit 2 was constrained by its support for Svelte 4, which didn't have a concept of [error boundaries](/docs/svelte/svelte-boundary). This meant that we could only display your `+error.svelte` components when errors occurred during _load_, not _render_. SvelteKit 3 requires Svelte 5, which means error handling can be made much more comprehensive and consistent.

Another change is that all errors are piped through your [`handleError`](/docs/kit/hooks#handleError) logic, including the ones you deliberately created with [`error(...)`](/docs/kit/@sveltejs-kit#error) which were previously ignored on the assumption that you'd already done something with them. This gives you more flexibility with less hoop-jumping.

Oh, and we apply sourcemaps to stack traces now. No biggie. (It'll take a minute before every adapter can display properly sourcemapped stack traces in production, but this is the necessary first step.)

## Vite 8: Rolldown, and the Environment API

SvelteKit 2 supported Vite 8, but SvelteKit 3 requires it. This means you get faster builds thanks to [Rolldown](https://rolldown.rs/).

We've also adopted the [Vite Environment API](https://vite.dev/guide/api-environment), which simplifies some of our build logic. One thing we _don't_ support is [`FetchableDevEnvironment`](https://vite.dev/guide/api-environment-frameworks#fetchabledevenvironment) — we tried to make this work, but ulimately concluded that it forces frameworks to absorb too much complexity. We think the problems it aims to solve (most notably, providing access to Cloudflare Workers bindings during local development) can be addressed in other ways, which we're actively exploring.

## Remote functions

If you've been following SvelteKit's development over the last year, you've likely encountered [remote functions](/docs/kit/remote-functions). This, alongside [async Svelte](/docs/svelte/await-expressions), is our vision for how client-server communication should be handled.

We're unreasonably excited about remote functions and can't wait to use them everywhere. Frankly, they make everything else look a bit clunky, including SvelteKit's `load` functions and `actions`.

For now, though, they remain behind an `experimental` flag as we iron out the last few kinks.

## Send us your feedback

As ever, we rely on your thoughts and your bug reports: if you have the opportunity to upgrade your apps and test out the new stuff, we and the rest of the Svelte community will be in your debt. Thank you!
