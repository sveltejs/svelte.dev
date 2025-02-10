---
title: "What's new in Svelte: February 2025"
description: 'New types, pnpm 10 support and better syntax highlighting'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

The Svelte developer experience got a huge upgrade this month with more exported types and better syntax highlighting in VS Code. Combine that with the huge releases from Storybook, Tailwind and Threlte... and you've got a pretty big month!

Let's dive in 🐬

## What's new in Svelte

- Non-numeric values can now be tweened by snapping immediately to the new value (**5.17.0**, [Docs](/docs/svelte-motion#tweened), [#14941](https://github.com/sveltejs/svelte/pull/14941))
- `const` tags are now allowed inside of a `svelte:boundary` (**5.17.5**, [Docs](/docs/svelte/svelte-boundary), [#14993](https://github.com/sveltejs/svelte/pull/14993))
- `<template>` elements are now allowed to contain any child elements (**5.18.0**, [Docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template), [#15007](https://github.com/sveltejs/svelte/pull/15007))
- `ClassValue` is now exposed from `svelte/elements` (**5.19.0**, [Docs](/docs/svelte/class#Attributes-Objects-and-arrays)), [#15035](https://github.com/sveltejs/svelte/pull/15035))

## What's new in SvelteKit and Language Tools

- Custom identifiers can now be invalidated on `goto()` navigation (**2.16.0**, [Docs](/docs/kit/$app-navigation#goto), [#13256](https://github.com/sveltejs/kit/pull/13256))
- The `postinstall` script has been removed to support pnpm 10 (**2.16.0**, [#13304](https://github.com/sveltejs/kit/pull/13304))
  - users should add `"prepare": "svelte-kit sync"` to their `package.json` in order to avoid the a warning upon first running Vite
- `PageProps` and `LayoutProps` types are now provided (**2.16.0**, [#13308](https://github.com/sveltejs/kit/pull/13308))
- The generics attribute is now supported for JSDoc (**svelte2tsx-0.7.32/svelte-check-4.1.2**, [#2624](https://github.com/sveltejs/language-tools/pull/2624))
- Semantic document highlighting makes the document highlights based on semantic/syntactic meaning instead of the current word-based default by VSCode (**language-server-0.17.9**, [Docs](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_documentHighlight), [#1408](https://github.com/sveltejs/language-tools/pull/1408))

---

## Community Showcase

### Apps & Sites built with Svelte

- [Daily Tokki](https://dailytokki.com/?ref=sveltenewsletter) is daily personalized Korean learning delivered right to your inbox
- [svelte-tower-defence](https://github.com/baterson/svelte-tower-defence) is a tower defense clicker game built with Svelte 5, without canvas, using only CSS transitions and the Runes
- [PraccJS](https://github.com/alyalin/PraccJS) lets you practice JavaScript with real-time code execution
- [Invoice-r](https://www.invoice-r.co.uk/) calculates what you're owed from the information you give and makes your invoice look good
- [Carry Fit](https://github.com/AxelUser/carry-fit) is an online carry-on luggage compliance checker
- [Fiddle](https://www.reddit.com/r/sveltejs/comments/1hv3rpd/selfpromotion_we_made_fiddle_with_svelte_so_you/) (currently in waitlist stage) lets you design, collaborate and experiment in code
- [Kener](https://github.com/rajnandan1/kener) is a modern status page with batteries included
- [Open TLC](https://opentlc.org/) is a free, open source CAT (Computer-Assisted Translation) tool
- [Mathesar](https://github.com/mathesar-foundation/mathesar) is a secure, spreadsheet-like tool for Postgres data
- [Pile Commander](https://github.com/a-matyukh/pile-commander) is an open-source file manager for creative people
- [Hetzner Auction Browser](https://hetzner-value-auctions.cnap.tech/about) is a better way to find the perfect server in Hetzner's Server-Bidding marketplace

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Svelte 5 And The Future Of Frameworks: A Chat With Rich Harris](https://www.smashingmagazine.com/2025/01/svelte-5-future-frameworks-chat-rich-harris/) by Frederick O'Brien
- [Use any JavaScript or TypeScript Library in Svelte 5 (The Right Way)](https://www.youtube.com/watch?v=R82Ptutku0M) by Stanislav Khromov

_Svelte Radio_

- [Rich Harris on the Svelte 5 reception](https://www.svelteradio.com/episodes/rich-harris-on-the-svelte-5-reception)
- [Dominik G on Svelte 5 and Vite 6](https://www.svelteradio.com/episodes/dominik-g-on-svelte-5-and-vite-6)
- [Timothy Cohen Talks SampleKit](https://www.svelteradio.com/episodes/timothy-cohen-talks-samplekit)

_This Week in Svelte_

- [Ep. 89](https://www.youtube.com/watch?v=BtZQmNoy6dI) — Sailkit
- [Ep. 90](https://www.youtube.com/watch?v=9DeWd_ShWM4) — Svelte Radar VS Code Extension
- [Ep. 91](https://www.youtube.com/watch?v=Fn0_8iZGkLk) — Threlte 8

_To Read_

- [Dockerize SvelteKit with adapter-static and Nginx](https://hugosum.com/blog/dockerize-sveltekit-with-adaptor-static-and-nginx), [Analyze and optimize your Vite bundle](https://hugosum.com/blog/analyze-and-optimize-your-vite-bundle) and [End-to-end type safety with Svelte 5 and SvelteKit 2](https://hugosum.com/blog/end-to-end-type-safety-with-svelte5-and-sveltekit2) by Hugo Sum

### Libraries, Tools & Components

- [Svelte Radar](https://marketplace.visualstudio.com/items?itemName=HarshKothari.svelte-radar) is a VS Code extension that provides a visual overview of your project's routing structure
- [Threlte 8](https://threlte.xyz/blog/threlte-8) is out and is more performant, flexible and aligned with Svelte 5
- [Storybook 8.5](https://storybook.js.org/blog/storybook-8-5/) includes Svelte Storybook Test support - improving testing in Svelte CSF stories
- [SVAR for Svelte](https://svar.dev/svelte/) provides feature-rich Svelte UI Components
- [Tailwind CSS v4.0 ](https://tailwindcss.com/blog/tailwindcss-v4)has been released - with a new engine, simpler installation and more
- [Frizzante](https://github.com/razshare/frizzante) is a procedural, minimalistic and opinionated web server that uses Svelte to render web pages
- [svelte-5-dashboard](https://github.com/thomaslappenbusch/svelte-5-dashboard) is a boilerplate for Svelte 5 dashboards. Including alerts, avatars, custom formatting and more
- [dnd-kit-svelte](https://github.com/HanielU/dnd-kit-svelte) is a Svelte 5 dnd-kit port
- [youva](https://github.com/SikandarJODD/youva) provides pagination, debounced search, sorting, filtering and caching for SvelteKit

That's it for the review of Svelte's first month of 2025! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
