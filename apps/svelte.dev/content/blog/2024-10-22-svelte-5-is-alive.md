---
title: Svelte 5 is alive
description: Our biggest release yet
author: The Svelte team
authorURL: https://svelte.dev/
pinnedUntil: 2024-11-15
---

After almost 18 months of development, comprising thousands of commits from dozens of contributors, Svelte 5 is finally stable.

It’s the most significant release in the project’s history. Svelte 5 is a ground-up rewrite: your apps will be faster, smaller and more reliable. You’ll be able to write more consistent and idiomatic code. For newcomers to the framework, there’s less stuff to learn.

Despite all that, Svelte is almost completely backwards-compatible with Svelte 4 — for the majority of users, the initial upgrade will be completely seamless:

```json
{
	"devDependencies": {
---		"@sveltejs/vite-plugin-svelte": "^3.0.0",---
---		"svelte": "^4",---
+++		"@sveltejs/vite-plugin-svelte": "^4.0.0",+++
+++		"svelte": "^5",+++
		// …
	}
}
```

## What is Svelte?

Svelte is a framework for building user interfaces on the web. It uses a compiler to convert declarative component code, based on HTML, CSS and JavaScript, into tightly optimised JavaScript.

Because the compiler shifts a lot of the work out of the browser and into `npm run build`, Svelte apps are small and fast. But beyond that, Svelte is designed to be an enjoyable and intuitive way to build apps: it prioritises getting stuff done.

The team behind Svelte also maintains SvelteKit, an application framework that handles routing and data loading and server-side rendering and all the gory details that go into building modern websites and apps.

## What changed, and why?

For one thing, we’ve overhauled our website. You can read more about that [here](the-omnisite).

As for Svelte itself, we’ll cover the _why_ first. We’re not fans of change for change’s sake — in fact, Svelte changed less than any other major framework between 2019 (when we launched Svelte 3) and now, which is an eon in front end development. And people really liked Svelte 3 and 4 — it routinely tops developer surveys of satisfaction.

So when we make changes, we don’t make them lightly.

With more and more people building more and bigger applications with Svelte, the limitations of some of our original design decisions started to become more apparent. For example, in Svelte 4, reactivity is driven entirely by the compiler. If you change a single property of a reactive object in Svelte 4, the entire object is invalidated, because that’s all the compiler can realistically do. Meanwhile, other frameworks have adopted fine-grained reactivity based on _signals_, leapfrogging Svelte’s performance.

Equally, component composition is more awkward in Svelte 4 than it should be, largely because it treats event handlers and ‘slotted content’ as separate concepts, distinct from the props that are passed to components. This is because in 2019 it seemed likely that web components would become the primary distribution mechanism for components, and we wanted to align with the platform. This was a mistake.

And while the `$:` construct for reactively re-running statements is a neat trick, it turned out to be a footgun. It conflated two concepts (derived state and side-effects) that really should be kept separate, and because dependencies are determined when the statement is compiled (rather than when it runs), it resists refactoring and becomes a magnet for complexity.

Svelte 5 removes these inconsistencies and footguns. It introduces _runes_, an explicit mechanism for (among other things) declaring reactive state:

```js
---let count = 0;---
+++let count = $state(0);+++
```

Interacting with state is unchanged: with Svelte — unlike other frameworks — `count` is just a number, rather than a function, or an object with a `value` property, or something that can only be changed with a corresponding `setCount`:

```js
let count = 0;
// ---cut---
function increment() {
	count += 1;
	console.log({ count });
}
```

Runes can be used in `.svelte.js` and `.svelte.ts` modules in addition to `.svelte` components, meaning you can create reusable reactive logic using a single mechanism.

Event handlers are now just props like any other, making it easy to (for example) know whether the user of your component supplied a particular event handler (which can be useful for avoiding expensive setup work), or to spread arbitrary event handlers onto some element — things that are particularly important for library authors.

And the `slot` mechanism for passing content between components (together with the confusing `let:` and `<svelte:fragment>` syntax) has been replaced with `{#snippet …}`, a much more powerful tool.

Beyond these changes are countless improvements: native TypeScript support (no more preprocessors!), many bugfixes, and performance and scalability improvements across the board.

## How do I upgrade?

If you’re currently on Svelte 3, begin by [migrating to Svelte 4](/docs/svelte/v4-migration-guide).

From there, you can update your `package.json` to use the newest version of `svelte` and ancillary dependencies like `vite-plugin-svelte`.

You don’t _have_ to update your components immediately — in almost all cases, your app will continue working as-is (except faster). But we recommend that you begin to migrate your components to use the new syntax and features. You can migrate your entire app with `npx sv migrate svelte-5`, or — if you’re using VS Code with the Svelte extension — you can migrate components one at a time by selecting ‘Migrate Component to Svelte 5 Syntax’ in your command palette.

Svelte has a large and robust ecosystem of component libraries that you can use in your applications such as [shadcn-svelte](https://shadcn-svelte.com/), [Skeleton](https://www.skeleton.dev/), and [Flowbite Svelte](https://flowbite-svelte.com/). But you don’t have to wait for these libraries to upgrade to Svelte 5 in order to upgrade your own application.

Eventually, support for Svelte 4 syntax will be phased out, but this won’t happen for a while and you’ll have plenty of warning.

For more details, see the [comprehensive Svelte 5 migration guide](/docs/svelte/v5-migration-guide).

## Our new CLI

Along with a new version of Svelte, we have a new Command Line Interface (CLI), `sv`, to go with it. You can learn all about it in [the announcement blog post](sv-the-svelte-cli).

## What’s next?

We plan to release a new version of SvelteKit in the near future that takes advantage of the new Svelte 5 features. In the meantime, you can use Svelte 5 with SvelteKit today, and `npx sv create` will create a new SvelteKit project with Svelte 5 installed alongside it.

After that, we have a laundry list of ideas we want to implement in Svelte itself. This release is the foundation for many improvements that would have been impossible to build on top of Svelte 4, and we can’t wait to roll up our sleeves.
