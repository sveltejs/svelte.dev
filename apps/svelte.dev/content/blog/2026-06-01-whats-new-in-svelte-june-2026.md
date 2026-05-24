---
title: "What's new in Svelte: June 2026"
description: 'Better forms, new long-lived remote query APIs and TypeScript 6 support in language-tools'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

This month we got a bunch of improvements in SvelteKit's forms and remote functions. Plus, a new query function (`.live(...)`) makes working with query subscriptions easier.

Keep an eye out for a few breaking changes in remote functions, if you're using those. Otherwise, enjoy all the new SvelteKit features and bug fixes in the latest versions of Svelte.

Let's dive in!

## What's new in SvelteKit

- Form `submit` now returns a boolean to indicate submission validity for enhanced remote forms (**2.57.0**, [Docs](https://svelte.dev/docs/kit/$app-forms#enhance), [#15530](https://github.com/sveltejs/kit/pull/15530))
- Breaking: `requested(...)` now requires `limit` and yields `{ arg, query }` entries instead of returning the validated argument directly (**2.58.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#Single-flight-mutations-Client-requested-refreshes), [#15739](https://github.com/sveltejs/kit/pull/15739))
- `requested(...)` now supports `query.batch(...)`, which makes batch remote query workflows easier to inspect in request-time logic (**2.59.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#query.batch), [#15751](https://github.com/sveltejs/kit/pull/15751))
- `submit` and `hidden` remote form fields can now accept booleans and numbers directly (**2.60.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#form-Fields), [#15802](https://github.com/sveltejs/kit/pull/15802))
- SvelteKit now warns when remote form validation issues are never read, helping catch missed UX paths earlier (**2.60.0**, [Docs](https://svelte.dev/docs/kit/remote-functions), [#15653](https://github.com/sveltejs/kit/pull/15653))
- Breaking: `.run()` was removed from remote queries - use `await query()` directly in all contexts instead (**2.61.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#query), [#15779](https://github.com/sveltejs/kit/pull/15779))
- Remote queries can now be awaited in event handlers, async callbacks and module scope, with cache deduping shared across reactive and non-reactive consumers (**2.61.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#query-Query-arguments), [#15779](https://github.com/sveltejs/kit/pull/15779))
- `query.live(...)` makes working with long-lived remote query subscriptions easier and are now async-iterable (experimental **2.59.0**, async in **2.61.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#query.live), [#15878](https://github.com/sveltejs/kit/pull/15878))
- Remote form instances now expose a programmatic `submit()` API and can be passed into `enhance` callbacks (**2.61.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#form-enhance), [#15657](https://github.com/sveltejs/kit/pull/15657))

For all the features and bugfixes that landed this month, check out the SvelteKit / Adapter [CHANGELOGs](https://github.com/sveltejs/kit/tree/main/packages).

## What's new in the Svelte ecosystem

- Svelte language-tools now support TypeScript 6.0 across the language server, svelte2tsx and svelte-check packages (**svelte-language-server@0.18.0/svelte2tsx@0.7.55/svelte-check@4.4.8**, [Docs](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/), [#2985](https://github.com/sveltejs/language-tools/pull/2985))
- Svelte MCP's stdio mode can now read file content directly, reducing round trips in local tool workflows (**mcp@0.1.23**, [Docs](https://svelte.dev/docs/ai/svelte-mcp), [#198](https://github.com/sveltejs/ai-tools/pull/198))
- vite-plugin-svelte now enables the optimizer for server environments during development (**vite-plugin-svelte@7.1.0**, [#1328](https://github.com/sveltejs/vite-plugin-svelte/pull/1328))

This only covers the new features from the Svelte ecosystem. For everything else, check out the [language-tools releases](https://github.com/sveltejs/language-tools/releases), [ai-tools releases](https://github.com/sveltejs/ai-tools/releases) and [vite-plugin-svelte releases](https://github.com/sveltejs/vite-plugin-svelte/releases).

For all the bugfixes that came out in Svelte this month, you can read the full [Svelte CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md).

---

## Community Showcase

### Apps & Sites built with Svelte

- [Pad](https://getpad.dev) is a local-first collaboration tool that combines a Go CLI with an embedded Svelte web app for human-agent workflows ([GitHub](https://github.com/PerpetualSoftware/pad))
- [Exort](https://github.com/Razz19/Exort/) is a local workspace for writing microcontroller code, compiling and uploading projects, and monitoring live serial output on supported boards
- [Bingewatcher.org](https://bingewatcher.org) is a daily movie guessing game based on data from Wikipedia and word vectors for 157 languages
- [Splitwave](https://github.com/Horuse/Splitwave) is a free node-based audio router for macOS built with Tauri + Svelte
- [Delcard](https://delcard.fun) is an open source peer-to-peer card game platform built with SvelteKit ([GitHub](https://github.com/LucaDeltort/delcard_games))
- [Vivix](https://vivix.dev) is a JavaScript execution visualizer that uses a worker-based interpreter for smooth timeline scrubbing ([GitHub](https://github.com/HenryOnilude/vivix))
- [hope-art.app](https://www.hope-art.app/en) applies protection filters to artwork images before sharing them online to prevent unauthorized AI training and style mimicry ([GitHub](https://github.com/HopeArtOrg/hope-re))
- [Image Palette Studio](https://image-palette-studio.vercel.app/) turns images into UI themes with generated CSS variables ([GitHub](https://github.com/aozoragh/image-palette-studio))
- [Dialyma](https://github.com/dialymaai/dialyma) is an open source canvas builder that can export production-ready code
- [Serverwat.ch](https://serverwat.ch/) is a SvelteKit dashboard for monitoring Hetzner-hosted projects

### Learning Resources

_This Week in Svelte_

- [Ep. 140](https://www.youtube.com/watch?v=6muvGbGOG7E) - Changelog, Imperative interfaces
- [Ep. 141](https://www.youtube.com/watch?v=AVX9lqFHOnM) - Changelog

_To Read_

- [Why Svelte Is Better Than React in the Agentic Era](https://zackwebster.com/blog/why-svelte-is-better-than-react-in-the-ai-era) by Zack Webster

### Libraries, Tools & Components

- [Huey](https://hueycolor.pages.dev) provides a composable color picker for Svelte 5
- [Svelte Dot Matrix Loaders](https://sv-matrix.vercel.app) provides 50+ animated dot-matrix loaders for Svelte projects ([GitHub](https://github.com/SikandarJODD/sv-matrix))
- [Paper Shaders for Svelte](https://shaders.devmischief.com) provides paper-style shader effects in an open source Svelte package ([GitHub](https://github.com/manuelogomigo/paper-shaders-svelte))
- [EmbedPDF for Svelte](https://www.embedpdf.com/svelte-pdf-viewer) provides a headless PDF viewer for Svelte apps built on PDFium instead of PDF.js
- [Svelte Event Calendar](https://svar.dev/demos/calendar/) is a Google-like event calendar component for Svelte with drag-and-drop editing and multiple calendar support ([GitHub](https://github.com/svar-widgets/calendar))
- [Convex Better Auth UI for SvelteKit](https://github.com/mmailaender/Convex-Better-Auth-UI) provides self-hosted auth and organization UI components powered by Convex + Better Auth
- [Aphex CMS](https://github.com/IcelandicIcecream/aphex) is an open source Sanity-inspired CMS that runs inside a single SvelteKit app
- [Svelte Hero](https://plugins.jetbrains.com/plugin/31546-svelte-hero) is a new JetBrains plugin focused on better Svelte support
- [jscpd v4.2.0](https://github.com/kucherenko/jscpd) now supports Svelte projects for duplicate code detection ([Changelog](https://github.com/kucherenko/jscpd/blob/master/CHANGELOG.md))
- [svelte-visual-builder](https://github.com/BluePointDigital/svelte-visual-builder) is an Elementor-style visual builder for SvelteKit projects
- [SvelteESP32 v3.0](https://github.com/BCsabaEngine/svelteesp32) lets you wire Svelte frontends to ESP32 workflows with an updated Vite plugin flow

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
