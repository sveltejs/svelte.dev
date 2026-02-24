---
title: "What's new in Svelte: October 2025"
description: 'Improved Remote Functions, sv create from playgrounds and experimental async SSR'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

There were lots of improvements to remote functions this month - including new batching tools and improved performance via lazy discovery. For more info, check out the Docs and PR links in each bullet. Async SSR is also available for those who would like to try it out while it's still experimental. It's included when the config option in `svelte.config.js` has the `compilerOptions.experimental.async` setting enabled.

We've got a hefty showcase this month too, so let's dive in!

## What's new in Svelte, SvelteKit and Svelte CLI (sv)

- The `event` property is now included on popstate, link and form navigation (**kit@2.40.0**, [#14307](https://github.com/sveltejs/kit/pull/14307))
- The `%sveltekit.version%` placeholder can now be used in `app.html` to easily include the current SvelteKit version in the output (**kit@2.41.0**, [Docs](https://svelte.dev/docs/kit/project-structure#Project-files-src), [#12132](https://github.com/sveltejs/kit/pull/12132))
- You can now create projects from the Svelte playground with `npx sv create --from-playground <url>` (**sv@0.9.5**, [#662](https://github.com/sveltejs/cli/pull/662))
- Experimental async SSR is available in Svelte v5.39.3 and SvelteKit v2.43.0 or higher. You can opt-in via the `experimental.async` option. When this is enabled, it's possible to use `await` anywhere in your app, without wrapping it in a boundary with a pending snippet. You can find more information in the SvelteKit PR ([#14447](https://github.com/sveltejs/kit/pull/14447), Svelte PR is [#16748](https://github.com/sveltejs/svelte/pull/16748))

### Remote Functions

- The remote `set()` function can now be called on server queries and `query.refresh()` promises will now be automatically resolved on the server (**kit@2.37.0**, [Docs](https://svelte.dev/docs/kit/remote-functions), [#14304](https://github.com/sveltejs/kit/pull/14304), [#14332](https://github.com/sveltejs/kit/pull/14332))
- The new `query.batch` remote function lets you batch requests that happen within the same macrotask (**kit@2.38.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#query.batch), [#14272](https://github.com/sveltejs/kit/pull/14272))
- Lazy discovery of remote functions improves detection and tree shaking for functions defined in `node_modules` (**kit@2.39.0**, [#14293](https://github.com/sveltejs/kit/pull/14293))
- The `form` remote function has been enhanced with schema support, `input` and `issues` properties (**kit@2.42.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#form), [#14383](https://github.com/sveltejs/kit/pull/14383))

For a full list of bug fixes in Svelte, SvelteKit and its adapters, check out their CHANGELOGs [here](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) and [here](https://github.com/sveltejs/kit/tree/main/packages).

---

## Community Showcase

### Apps & Sites built with Svelte

- [Windframe](https://windframe.dev/) generates designs with AI or prebuilt templates to export as Tailwind CSS code for React, Vue, Svelte or HTML.
- [pgpad](https://github.com/vrmiguel/pgpad) is a straightforward cross-platform database client
- [Zippywords](https://www.zippywords.com/words/en) is a burst-typing game that's configurable with different languages (including the [Svelte 5 syntax](https://www.zippywords.com/code/Svelte%205)!)
- [CBFC Watch](https://cbfc.watch/) is a data visualisation project with a searchable database of over 100K film censorship records in India ([GitHub](https://github.com/diagram-chasing/cbfc-watch))

_Spotted in the Wild_

- [The Apple TV website](https://tv.apple.com/) - ([Reddit post](https://www.reddit.com/r/sveltejs/comments/1n6i96i/the_appletv_website_uses_svelte/))
- [Gimli Tailwind](https://gimli.app/tailwind) - ([Reddit post](https://www.reddit.com/r/sveltejs/comments/1nbmoeq/the_most_popular_devtools_extension_for/))
- [The Mullvad VPN site](https://mullvad.net/en) - [Reddit post](https://www.reddit.com/r/sveltejs/comments/1nhe6t6/mullvad_vpn_uses_sveltekit_for_their_site/)

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Introducing SvelteKit Remote Functions](https://www.youtube.com/watch?v=0hy7PCbXyqs) and [SvelteKit Remote Functions tips: Auth guards, managing async, query.batch](https://www.youtube.com/watch?v=z0f7NLPdLYE) by Simon Holthausen
- [The Complete Svelte 5 Course For The Most Loved JavaScript Framework](https://www.youtube.com/watch?v=B2MhkPtBWs4) by Joy of Code (3+ hours of excellent content). Text version available [here](https://joyofcode.xyz/learn-svelte)
- [Translate your Svelte and SvelteKit applications the easy way - full tutorial](https://www.youtube.com/watch?v=d0RPeuC4JL8) by Code with Stanislav
- [How and why I built an MCP server for Svelte](https://khromov.se/how-and-why-i-built-an-mcp-server-for-svelte/) by Stanislav Khromov
- [Svelte Radio](https://share.transistor.fm/s/a5f8c4c6) is back! Feat. Kevin, Brittney and Antony

_This Week in Svelte_

- [Ep. 115](https://www.youtube.com/watch?v=PHk7YFAFvfg) — Changelog review
- [Ep. 116](https://www.youtube.com/watch?v=sTepLQwJIVo) — e18e.dev and NPM's supply chain attack
- [Ep. 117](https://www.youtube.com/watch?v=E0xQXa4qQGY) — Formisch
- [Ep. 118](https://www.youtube.com/watch?v=eBXjXfUiuiA) — Changelog review

_Svelte London - September 2025_

You can [watch the full video on YouTube](https://www.youtube.com/watch?v=odCWAAaTNSQ) or skip to the specific talks below:

- [Svelte on Cloudflare: Tips and guide](https://www.youtube.com/live/odCWAAaTNSQ?si=2Eej24zu2ZXUEljs&t=412) by Mark Ridge and Connor Adams
- [Ultra-low Latency in SvelteKit](https://www.youtube.com/live/odCWAAaTNSQ?si=4Eyh2SUwA26waECz&t=2563) by Scott Phillips

_To Read_

- [Sharing some custom components that handle async state with less boilerplate in Svelte 5](https://www.reddit.com/r/sveltejs/comments/1niyflq/sharing_some_custom_components_that_handle_async/) by u/geokidev
- [Rendering emails with Svelte](https://github.com/GauBen/svelte-emails) by Gautier Ben Aïm
- [Integrate Keystatic CMS with SvelteKit to render Markdoc Content with Interactive Svelte Components](https://samuelplumppu.se/blog/keystatic-sveltekit-markdoc) by Samuel Plumppu

_To Watch_

- [Svelte Under The Hood](https://www.youtube.com/watch?v=GsjfEmTS4x8) by ~/in-depth

### Libraries, Tools & Components

_UI / UX_

- [SVAR Svelte v2.3](https://github.com/svar-widgets) now has TypeScript definitions to all its open-source Svelte UI components
- [@dnd-kit](https://www.npmjs.com/package/@dnd-kit-svelte/svelte) is a lightweight React-like library for building performant and accessible drag and drop experiences
- svelte-overflow-fade is a Svelte action and attachment for adding beautiful fade effects to overflowing content
- [scratch-to-reveal-svelte](https://github.com/dellamora/scratch-to-reveal-svelte) is a simple and customizable scratch-to-reveal component for Svelte
- [Svelte Streamdown](https://svelte-streamdown.beynar.workers.dev/) is a Svelte port of Streamdown by Vercel - an all in one markdown renderer, designed specifically for AI-powered streaming applications
- [USAL JS](https://usal.dev/) is the "Ultimate Scroll Animation Library"

_Frameworks and Data Tools_

- [PrevelteKit](https://github.com/tbocek/preveltekit) is a lightweight, high-performance web application framework built on Svelte 5, featuring Server-Side Pre Rendering (SSPR) using Rsbuild and jsdom
- [Apollo Runes](https://apollo-runes-docs.vercel.app/) is an Apollo Client for Svelte 5
- [Formisch](https://github.com/fabian-hiller/formisch) is a schema-based, headless form library for JS frameworks
- [Conformal](https://github.com/marcomuser/conformal) helps you work with native FormData by providing type-safe form submissions for the modern web
- [Astro](https://astro.build), already supporting async Svelte out of the box, added support for server-rendered async Svelte in the [5.14 release](https://astro.build/blog/astro-5140/#async-rendering-support-for-svelte)
- [LayerChart](https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.39) had a packed update and introduced (among other things) a "vanilla CSS" (Tailwind opt-in) mode and support for other UI frameworks, and now also works in the [Svelte REPL / playground](https://svelte.dev/playground/c5e73cb55a0045cca83e74b5cdfa3b65?version=5.39.6)
- [keystatic-sveltekit](https://github.com/Greenheart/keystatic-sveltekit) is a convenient way to integrate the open source Git-based Keystatic CMS with SvelteKit, featuring Markdoc content with interactive Svelte components and a modern editing UX

_Dev Tools and Vite Plugins_

- [wuchale](https://github.com/wuchalejs/wuchale) is a compile-time internationalization (i18n) toolkit that requires zero code changes
- [SV Floating Console](https://www.npmjs.com/package/sv-console) is a floating console for Svelte applications that only appears in development mode
- [magicons](https://github.com/propolies/magicons) is a fast, typesafe Icon wrapper that fixes bundling issues with large barrel exports in icon libraries
- [Svelte-pops](https://svelte-pops.vercel.app/docs/overview) is a performant and easy to use popover manager for creating dialog and tooltips
- [vite-plugin-svelte-inline-component](https://github.com/hanielu/vite-plugin-svelte-inline-component) lets you write tiny Svelte components straight inside your JavaScript / TypeScript tests using tagged‑template literals
- [vite-plugin-sveltekit-decorators](https://github.com/KiraPC/vite-plugin-sveltekit-decorators) is a powerful Vite plugin that automatically decorates SvelteKit functions with customizable wrappers for logging, analytics, error handling, and more

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
