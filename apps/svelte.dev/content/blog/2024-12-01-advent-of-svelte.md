---
title: Advent of Svelte
description: Twenty-four days, twenty-four features
author: The Svelte team
authorURL: https://svelte.dev/
pinnedUntil: 2024-12-26
---

Last December, [Svelte Society](https://bsky.app/profile/sveltesociety.dev) presented an advent calendar's worth of [festive Svelte-themed code challenges](https://advent.sveltesociety.dev/).

This year, we're turning it around: you get to relax while _we_ take on a challenge. We've set ourselves a goal of releasing one thing a day from here until Christmas, whether it's a new feature in Svelte or SvelteKit or an improvement to the website.

Follow [@svelte.dev](https://bsky.app/profile/svelte.dev) and [@sveltesociety.dev](https://bsky.app/profile/sveltesociety.dev) and check back every day to see what we've been cooking up.

## Day 1: error boundaries

This is a long-awaited and much-requested feature, that allows you to isolate and recover from errors that occur during rendering.

- [docs](/docs/svelte/svelte-boundary)
- [tutorial](/tutorial/svelte/svelte-boundary)

## Day 2: `each` without `as`

If you just want to render something in an `{#each ...}` block _n_ times, and don't care about the value, you can now omit the `as` part.

- [docs](/docs/svelte/each#Each-blocks-without-an-item)
- [demo](/playground/untitled#H4sIAAAAAAAAA3WP3WrDMAyFX0VoDFqWtGRXxWsKY4-x7MKx1SbUtY2tdi0h7z7s_myD9k6c8-lIZ0Ard4QCPzqKEVong8YC172hiOJzQD75ZCcBiyv87v0sHshw0loZ6Z6unGWyHFHgUvcHUEbGWDeo0qUyX2pw1diGhyeSqoMBDNkNdwIWMBYQpN2OyX4EpJ8uQMO_J0RrpNrWwyQFwEvGpvAMr1DXNVTjajnX_WF1SZ6n5JxyG2--XUY-Gcro7M_bMJyXdR-9kScBm9Drt7OWxpJp541kKpUz-52NAgJ5kjxZFFCtw_QuG9z3I7B1QVMQUPkjRGd6DbnjxZXRk-IySO6dgCqpWZ9l6Ppsw61U201we6vFv_3cPvc-18UCmY6MgsOexq_xBw8BVaUkAgAA)

## Day 3: exported snippets

You can now export snippets from a component's `<script module>`, for use in other components, as long as those snippets don't reference anything belonging to the component instance.

- [docs](/docs/svelte/snippet#Exporting-snippets)
- [demo](/playground/16b7dd7105c248e59ec8a437697f588d)

## Day 4: form control default values

When you reset a form, the value of each `<input>` element reverts to its `defaultValue`. This is normally the empty string, but you can now control it directly in your template.

- [docs](/docs/svelte/bind#input-bind:value)
- [demo](/playground/b30cfac16c3c4a3ab3d76ad20a5925cf)

## Day 5: `MediaQuery`, `prefersReducedMotion` and `createSubscriber`

It's a three-in-one kind of day. `new MediaQuery(...)` gives you an object with a reactive `current` property that's true when the media query matches. `prefersReducedMotion` is an instance of `MediaQuery` that matches if the user has expressed a [preference for reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), helping you build accessible apps. Under the hood, both are using the `createSubscriber` mechanism, which gives you an easy way to set up event listeners when a value is read inside an effect.

- [`createSubscriber` docs](/docs/svelte/svelte-reactivity#createSubscriber)
- [`MediaQuery` docs](/docs/svelte/svelte-reactivity#MediaQuery)
- [`prefersReducedMotion` docs](/docs/svelte/svelte-motion#prefersReducedMotion)
- [demo](/playground/89f6f3bb738149fcb6e708cfce878e0f)

## Day 6: `Spring` and `Tween`

We now have modern state-based alternatives to the `spring` and `tweened` stores of old. Smooth!

- [`Tween` tutorial](/tutorial/svelte/tweens)
- [`Spring` tutorial](/tutorial/svelte/springs)
- [docs](/docs/svelte/svelte-motion)
- [demo](/playground/8a021b2ec2064230bde4a10b08464876?version=5.8.0)

## Day 7: better tutorial navigation

A lot of you disliked the dropdown navigation for the tutorial — essentially a giant, unwieldy `<select>` element — so we've replaced it with a hierarchical menu. Because it's all just `<details>` and `<a>` elements, we get accessibility features for free. You can even navigate the tutorial with JavaScript disabled!

- [tutorial](/tutorial/svelte/welcome-to-svelte)

## Day 8: function bindings

You can now do `bind:value={get, set}` to validate and transform bound values. This works for all bindings, even on components.

- [docs](/docs/svelte/bind#Function-bindings)
- [demo](/playground/1ddd82f573b94201b3c8fcab33bf0a46?version=5.9.0)

## Day 9: error and warning documentation

When Svelte emits a warning or error (whether at build time, when the compiler is running, or when the app is running on the server or in the browser) it will now be accompanied by a link to the corresponding entry in the documentation containing a description (which is omitted from production builds, to save bytes) and — in some cases, with more to come — more details on why it happened and what you can do to fix it.

- [demo](/playground/8095884c1f5040ea846669b904083e25?version=5.10.0)

## Day 10: SvelteKit `init` hooks

A lot of you wanted a place to put asynchronous setup work that happens before your SvelteKit app starts up. You can now export an `init` function from `hooks.server.js` and `hooks.client.js` that will be awaited before any other stuff happens.

- [docs](https://svelte.dev/docs/kit/hooks#Shared-hooks-init)

## Day 11: `svelte/reactivity/window`

Today we added a whole new module. `svelte/reactivity/window` exports a variety of reactive values like `innerWidth`, `innerHeight`, `scrollX`, `scrollY` and so on. Like the `MediaQuery` introduced on day 5 and `Spring` and `Tween` from day 6, these are class instances with a reactive `current` property that you can use in your template and in deriveds/effects. Behind the scenes, Svelte handles all the event listener stuff.

- [docs](/docs/svelte/svelte-reactivity-window)
- [demo](/playground/8ac86e10fdce485a99c29c95e0092df4?version=5.11.0)

## Day 12: custom type transport in SvelteKit

A `load` function that runs on the server in your SvelteKit app isn't restricted to returning things that can be serialized as JSON. You can return Maps, Sets, Dates, objects with cyclical references, even Promises, and SvelteKit will handle the serialization on the server and deserialization in the browser.

As of today, you can also return things that _aren't_ built in to the language, such as [classes containing state](/docs/svelte/$state#Classes), or classes returned by your database ORM library, or whatever — just export a `transport` object from your `hooks.js` that provides an `encode` and `decode` function.

- [docs](/docs/kit/hooks#Universal-hooks-transport)
- [demo](https://stackblitz.com/edit/sveltejs-kit-template-default-b5zbxomg?file=src%2Fhooks.js)

## Day 13: rise of the robots

For those of you using LLMs to help you write code — via Cursor or Copilot or Claude or Bolt or v0 or some other interface — we now publish the documentation in a selection of robot-friendly `llms.txt` files. This is experimental and will evolve over time, but by way of example here's a [snake game](/playground/0de3c1c1a31d47bdbb7c4aa3477a6b46) built by Sonnet 3.5 with no additional prompting.

Thanks to [Didier Catz](https://x.com/didiercatz) and [Stanislav Khromov](https://bsky.app/profile/khromov.se) for building this!

- [docs](/docs/llms)

## Day 14: unmount with outros

Now, if you need to programmatically mount and unmount a component, you can now pass an `outro: true` option to `unmount` to play transitions before it is removed from the DOM.

- [docs](/docs/svelte/imperative-component-api#unmount)
- [demo](/playground/a4ca332691204ccd887ec7b1df818182?version=5.13.0)

## Day 15: debugging superpowers

The new `$inspect.trace(...)` rune gives you detailed information about which state changes caused a derived or effect to re-run.

- [docs](</docs/svelte/$inspect#$inspect.trace()>)
- [demo](/playground/d135c6f00beb4fa391725e59d8061604?version=5.14.0)

## Day 16: `$app/state`

SvelteKit's `$app/stores` module, which gives you a way to access information about (for example) the current page, now has a modern Svelte 5 state-based counterpart: `$app/state`. It exposes all the same information, but using fine-grained state, and without the clunky `$` prefix. `$app/stores` is now deprecated, and will be removed in SvelteKit 3 next year.

You can migrate automatically by running the following command in your SvelteKit app:

```bash
npx sv migrate app-state
```

- [docs](/docs/kit/$app-state)
- [tutorial](/tutorial/kit/page-state)

## Day 17: better IntelliSense

The parser used by the language tools that power things like the [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) extension is the same one used by the Svelte compiler. Until today, it would fail if it encountered a syntax error, making it hard to provide things like autocomplete while you were in the middle of writing code.

We just fixed that. Install the latest version of Svelte in your project, make sure your extensions are up to date, and feel the wind in your hair as you write your components.

- [demo video](https://bsky.app/profile/svelte.dev/post/3ldjajjbkwc2n)

## Day 18

Coming soon!

## Day 19

Coming soon!

## Day 20

Coming soon!

## Day 21

Coming soon!

## Day 22

Coming soon!

## Day 23

Coming soon!

## Day 24

Coming soon!
