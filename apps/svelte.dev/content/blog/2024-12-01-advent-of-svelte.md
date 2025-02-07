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

- [docs](/docs/kit/hooks#Shared-hooks-init)

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

Thanks to [Didier Catz](https://bsky.app/profile/didiercatz.com) and [Stanislav Khromov](https://bsky.app/profile/khromov.se) for building this!

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

## Day 18: playground hovers

If you've ever wondered how the Svelte compiler works, today's update is for you. If you go to the [playground](/playground) and open the AST output tab, you'll see the abstract syntax tree that the compiler operates on. As of today, hovering over code in the editor will highlight the corresponding section of the AST and vice versa. Clicking on a piece of code will expand the tree and scroll to the AST.

The JS and CSS output tabs have also been upgraded — they now use sourcemaps to highlight the output code that corresponds to a given piece input, where applicable, and vice versa. We plan to use this to improve the sourcemaps themselves, which over time will result in smoother debugging when you're building Svelte apps.

- [playground](/playground)
- [demo video](https://bsky.app/profile/svelte.dev/post/3ldlkmce6oc2j)

## Day 19: single-file SvelteKit bundles

By default, SvelteKit uses a technique called _code-splitting_ so that you only load the JavaScript and CSS you need for the page you're currently on. This helps make sure your app loads fast even if it grows very large.

In [some situations](https://github.com/sveltejs/kit/issues/3882), code-splitting is unhelpful — what you really want is a single .js file and a single .css file for your entire app. SvelteKit now supports this with the `output.bundleStrategy` option.

- [docs](/docs/kit/configuration#output)
- [example](https://bsky.app/profile/svelte.dev/post/3ldo633ht222p)

## Day 20: Vim mode

The [playground](/playground) had a secret Vim mode that you could activate by appending `?vim=true` to the URL, but it was buggy. We've fixed it, and added a toggle to the playground and the tutorial that remembers your preference between visits. But don't worry: unlike normal Vim, you can quit by turning it off again (or closing the tab).

- [playground](/playground)
- [tutorial](/tutorial)
- [demo video](https://bsky.app/profile/svelte.dev/post/3ldqli3lk4k2g)

## Day 21: hash-based routing

SvelteKit now supports hash-based routing, in addition to the default pathname-based routing. This can be useful for purely client-side apps (including those you might build with Electron or Tauri), or situations where you don't control the webserver and need to put everything on a single page.

It comes with caveats — you can't use server-rendering (or any server logic), and you need to make sure all your internal links start with `/#/` or they won't work. Other than, it's just like any other SvelteKit app.

- [docs](/docs/kit/configuration#router)
- [demo](https://hash-based-routing.vercel.app/)

## Day 22: self-contained apps

Following the introduction of the `bundleStrategy` option on day 19, and hash-based routing yesterday, we now have the ability to generate fully self-contained apps with the `bundleStrategy: 'inline'` option. Together with Vite's `assetsInlineLimit` option, it's possible to put an entire SvelteKit app — code, styles, fonts, images, audio and everything else — inside a single .html file that you can share with people on a floppy disk.

- [docs](/docs/kit/configuration#output)
- [example downloadable Snake game](https://svelte-snek.vercel.app/)

## Day 23: download from playground

We've added a 'download app' option to the toolbox in the playground — selecting it will zip up the app, along with any packages you've imported, and download it to your machine so you can continue working on it in your editor of choice.

- [playground](/playground)

## Day 24: clsx built in

Svelte now uses [clsx](https://github.com/lukeed/clsx) to parse `class` attributes, meaning you can use objects and arrays to conditionally add and remove classes. It's much more powerful and flexible than the `class:` directive, and — since this is Svelte — you still get dead code elimination of unused CSS. This feature is particularly useful for all you Tailwind-heads.

- [docs](/docs/svelte/class)
- [tutorial](/tutorial/svelte/classes)
- [demo](/playground/61450f09983046efb18273d5c94db7b4?version=5.16.0)

---

And that's a wrap! Thanks for following along, everyone, and Merry Christmas to all who celebrate.
