---
title: "What's new in Svelte: July 2025"
description: 'Vite 7 and Rolldown support, better traces and vitest browser mode support'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Whether you're trying out Vite 7, vitest browser mode or [remote functions](https://github.com/sveltejs/kit/discussions/13897), there's lots of experimental features to try this month.

Want some Svelte swag while you're chatting on Discord? With the new `sv ⚡` [server tag](https://support.discord.com/hc/en-us/articles/31444248479639-Server-Tags#h_01JT6VKRACHQADX7EBXR84QTAQ), you do just that. While signed into Discord, you can adopt our tag via profile settings.

There's a bunch to cover, from blog posts to new libraries, so let's dive in...

## What's new in Svelte and SvelteKit

- `$inspect.trace` now includes source name logging to make it easy to find which file the log came from (**svelte@5.34.0**, [Docs](<https://svelte.dev/docs/svelte/$inspect#$inspect.trace()>), #[16060](https://github.com/sveltejs/svelte/pull/16060))
- The latest version of SvelteKit now supports Vite 7 and Rolldown. Compilation should be faster using Rolldown, but with larger bundle sizes until additional tree-shaking is implemented in Rolldown (**kit@2.22.0**, [Docs](https://vite.dev/guide/rolldown.html#how-to-try-rolldown), [#13747](https://github.com/sveltejs/kit/pull/13747))

For a full list of bug fixes in Svelte, SvelteKit and its adapters, check out their CHANGELOGs [here](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) and [here](https://github.com/sveltejs/kit/tree/main/packages).

## What's new in the CLI and Language Tools

- The `sv` CLI now supports Vite's browser mode in Vitest - allowing you to run your tests in the browser natively (**cli@0.8.12**, [Docs](https://vitest.dev/guide/browser/), [#588](https://github.com/sveltejs/cli/pull/588))
- The language server now makes it easier to search for symbol names (`Ctrl + T` in VSCode). Some of the handling is also synced to the Svelte TypeScript plugin so that it's more consistent, which also means vscode can better deduplicate the results from both tsserver and Svelte language server (**extensions@109.9.0**, [#2769](https://github.com/sveltejs/language-tools/pull/2769))

---

## Community Showcase

### Apps & Sites built with Svelte

- [Planet Poster](https://planet-poster.vercel.app/) is an interactive art work inspired by a poster of, you guessed it, planets
- [roomy-worlds](https://flo-bit.dev/roomy-worlds/) lets you create small 3d worlds and share/edit with your community
- [Prodcast](https://www.prodcastapp.com/) lets you discover products curated from your favorite podcasts
- [Distill](https://www.distillintelligence.com/) automates company and industry monitoring with all news, updates, and summarized insights in one place
- [thom.chat](https://github.com/tglide/thom-chat) is an open-source alternative/clone to T3 Chat
- [Visual Source](https://github.com/jhwz/visual-source) is a GUI for managing your projects design tokens

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Type-Safe Persistence and Auto-Theming in Svelte 5](https://www.puruvj.dev/blog/svelte-5-runic-persist-theming) by Puru VJ
- [$effect is fine but proxies are better](https://ricciuti.me/blog/effect-is-fine-but-proxies-are-better) and [How to build Web Components with Svelte](https://mainmatter.com/blog/2025/06/25/web-components-with-svelte/?utm_source=svelte_newsletter&utm_medium=social&utm_campaign=25-06-26-how-to-build-web-components-with-svelte) by Paolo Ricciuti

_This Week in Svelte_

- [Ep. 106](https://www.youtube.com/watch?v=_7_8HKvee8M) — Changelog
- [Ep. 107](https://www.youtube.com/watch?v=Ijb8l9XEz2g) — svelte-lexical

_To Watch/Read_

- [Sveltest](https://sveltest.dev/docs/getting-started) is a guide to set up testing for Svelte 5 applications using the experimental vitest-browser-svelte library
- [A Playful Onboarding: Your first interactive animation from A to Z](https://director.design/chapters/playful-onboarding) by Director.design
- [Migrating from @testing-library/svelte to vitest-browser-svelte](https://scottspence.com/posts/migrating-from-testing-library-svelte-to-vitest-browser-svelte) by Scott Spence
- [Why Silicon Valley CTOs Are Secretly Moving Away from React](https://freedium.cfd/https://javascript.plainenglish.io/why-silicon-valley-ctos-are-secretly-moving-away-from-react-bdf64f0b6072) by Freedium
- [Async Local Storage](https://blog.robino.dev/posts/async-local-storage) by Ross Robino
- [Mainmatter](https://mainmatter.com/events/?utm_source=svelte_newsletter&utm_medium=social&utm_campaign=25-06-25-how-to-build-web-components-with-svelte) has a bunch of Svelte workshops in July so be sure to check those out!

### Libraries, Tools & Components

- [shadcn-svelte v1](https://shadcn-svelte.com/) - after 11 months in pre-release (@next), shadcn-svelte has officially hit v1.0. Congrats!
- [Quaff](https://github.com/quaffui/quaff) is a component library for Svelte that follows the Material Design 3 guidelines
- [Neodrag v3](https://www.puruvj.dev/blog/neodrag-v3-alpha) Alpha is out with multi-framework adapters, event delegation and more
- [Svelte Polaris](https://svelte-polaris-docs.storebud.workers.dev/) is port of Shopify's design system to build Shopify apps
- [Origin UI](https://originui-svelte.pages.dev/) is a collection of copy-and-paste components for quickly build application UIs
- [Svelte 5 MCP Server](https://github.com/StudentOfJS/svelte5-mcp) is a specialized Model Context Protocol (MCP) server for Svelte 5 frontend development
- [Frizzante](https://razshare.github.io/frizzante-docs/guides/get-started/) is a minimalistic and opinionated web server framework written in Go that uses Svelte to render pages
- [Storybook 9](https://storybook.js.org/blog/storybook-9/) is out now and includes updates to the Svelte CSF story format to support Svelte 5
- [Sheepdog](https://github.com/mainmatter/sheepdog) supplies a simple way to introduce cancellable concurrency into your app
- Flowbite Svelte now has [datatable](https://flowbite-svelte.com/docs/plugins/datatables) and [text editor (WYSIWYG)](https://flowbite-svelte.com/docs/plugins/wysiwyg) components
- [Ark UI](https://ark-ui.com/), a headless UI library, now has a Svelte version
- [SVAR Svelte Filter](https://svar.dev/svelte/filter/) helps you add complex filtering UI and logic to data-heavy apps like admin panels or dashboards

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
