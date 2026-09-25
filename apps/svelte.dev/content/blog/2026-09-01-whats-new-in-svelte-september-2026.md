---
title: "What's new in Svelte: September 2026"
description: 'New SvelteMap methods in Svelte 5.57, more SvelteKit 3 iteration and sv 1.0 previews SvelteKit 3 migrations'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

This month, Svelte 5.57 shipped with new `SvelteMap` methods and a few quality-of-life additions while SvelteKit 3 got closer to the finish line with its Release Candidate.

The `sv` CLI also got a new `ai-tools` add-on that replaces the old `mcp` one, and `sv@next` now ships a task-based `sveltekit-3` migration for existing apps.

Let's dive a bit deeper!

## What's new in Svelte

- `SvelteMap` now has `getOrInsert` and `getOrInsertComputed` methods for the common "read or initialize" pattern (**5.57.0**, [Docs](https://svelte.dev/docs/svelte/svelte-reactivity#SvelteMap), [#18728](https://github.com/sveltejs/svelte/pull/18728))
- `createContext` now returns a third `has` function so you can check whether a context has been set without triggering the `get` error (**5.57.0**, [Docs](https://svelte.dev/docs/svelte/context), [#18472](https://github.com/sveltejs/svelte/pull/18472))
- `<select>` now supports the `defaultValue` attribute, so the select reverts to that value on form reset (**5.57.0**, [#18591](https://github.com/sveltejs/svelte/pull/18591))
- `svelte/server` now exports the `RenderOutput`, `SyncRenderOutput`, `Csp` and `Sha256Source` types for typing server render output and CSP sources (**5.57.0**, [#18648](https://github.com/sveltejs/svelte/pull/18648))

For the full list of patches and bug fixes, see the Svelte [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md).

## What's new in SvelteKit 3's RC

Prereleases have kept rolling on the `@next` line this month, adding a few more features and refining the surface:

- Enhanced cross-page form actions now navigate to the action page on success and failure, matching native form behavior (**3.0.0-next.17**, breaking, [#16684](https://github.com/sveltejs/kit/pull/16684))
- Adapter Vite plugins can now be split into `pre` and `post` groups so adapters can run transforms at the right point in the pipeline (**3.0.0-next.18**, breaking, [#16711](https://github.com/sveltejs/kit/pull/16711))
- Files with `+` prefixes are now ignored during routing if their names contain `test`, `spec` or `stories`, so colocated tests don't accidentally become routes (**3.0.0-next.19**, [#16715](https://github.com/sveltejs/kit/pull/16715))
- Development-server response logging is now nicer to read and routes through Vite's logger so it respects `logLevel` and `customLogger` (**3.0.0-next.20/25**, [#16744](https://github.com/sveltejs/kit/pull/16744), [#16858](https://github.com/sveltejs/kit/pull/16858))
- `defineParams` and the associated types have moved to `@sveltejs/kit/params` (**3.0.0-next.19**, breaking, [#16716](https://github.com/sveltejs/kit/pull/16716))
- `+server.js` files can now export a `QUERY` HTTP method handler (**3.0.0-next.24**, [#16782](https://github.com/sveltejs/kit/pull/16782))
- The `preload` filter for fonts now receives the project-relative source `filename` so you can filter by directory or component (**3.0.0-next.24**, [#16443](https://github.com/sveltejs/kit/pull/16443))
- Adapters can call the new `applyReroute` helper for split serverless function deployments (**3.0.0-next.25**, [#16665](https://github.com/sveltejs/kit/pull/16665))

For the meantime, all of the SvelteKit 3 docs live on [next.svelte.dev](https://next.svelte.dev/docs/kit/migrating-to-sveltekit-3), and the full changelog is on the [version-3 branch](https://github.com/sveltejs/kit/blob/version-3/packages/kit/CHANGELOG.md). The stable 2.x line kept moving too with three patch releases (**2.70.1**, **2.70.2**, **2.70.3**) - see the [SvelteKit CHANGELOGs](https://github.com/sveltejs/kit/tree/main/packages) for the details.

## What's new in the Svelte CLI and Language Tools

- The `mcp` add-on has been replaced with a broader `ai-tools` add-on that can set up the Svelte plugin (Claude Code, opencode) or pick individual tools (MCP server, skills, sub-agents) per client (**sv@0.17.0**, [Docs](https://svelte.dev/docs/cli/ai-tools), [#1050](https://github.com/sveltejs/cli/pull/1050))
- `@sveltejs/sv-utils` picks up `isKit3`, `resolveLibPrefix` and `libSubpathImports` helpers so add-ons can transparently handle SvelteKit 2 and 3 (**sv-utils@0.3.3**, [#1199](https://github.com/sveltejs/cli/pull/1199))
- `sv migrate` has been reworked to prepare for the SvelteKit 3 migration - it now lists tasks, ships a `sveltekit-3` task that bumps dependencies and rewrites `$lib` to `#lib`, adds an `$app/state` task, delegates the older migrations to `svelte-migrate@1`, and creates a list of changes a developer or agent should resolve if they cannot be migrated automatically (**sv@1.0.0-next.0**, [Docs](https://svelte.dev/docs/cli/sv-migrate), [#1138](https://github.com/sveltejs/cli/pull/1138), [#1241](https://github.com/sveltejs/cli/pull/1241), [#1249](https://github.com/sveltejs/cli/pull/1249))
- Newly created projects use `#lib` (Node subpath imports) instead of `$lib`, matching SvelteKit 3 (**sv@1.0.0-next.0**, [#1185](https://github.com/sveltejs/cli/pull/1185))
- Community add-ons no longer require a scoped package name (**sv@1.0.0-next.4**, [#1216](https://github.com/sveltejs/cli/pull/1216))
- The `experimental` add-on is now scoped to enabling experimental features, and the `versions` option value was renamed to `kit-3` (**sv@1.0.0-next.0**, breaking, [#1241](https://github.com/sveltejs/cli/pull/1241), [#1185](https://github.com/sveltejs/cli/pull/1185))
- Vite plugin gets a `dynamicCompileOptions` argument for the current Vite environment, useful when you want to compile differently for the client, server or SSR environment (**vite-plugin-svelte@7.3.0**, [#1386](https://github.com/sveltejs/vite-plugin-svelte/pull/1386))
- `svelte2tsx` and `svelte-check` learn about SvelteKit 3's flattened config structure so the type generation and diagnostics keep working through the migration (**svelte-check@4.7.6/svelte2tsx@0.7.61/svelte-language-server@0.18.4**, [#3104](https://github.com/sveltejs/language-tools/pull/3104), [#3106](https://github.com/sveltejs/language-tools/pull/3106))

Want to dive deeper? Check out the [Svelte CLI](https://github.com/sveltejs/cli/releases), [language-tools](https://github.com/sveltejs/language-tools/releases) and [ai-tools](https://github.com/sveltejs/ai-tools/releases) releases.

---

## Community Showcase

### Apps & Sites built with Svelte

- [EdenText](https://edentext.app) is a fully local open-source word processor for `.odt` and `.docx` documents that runs entirely in the browser or as a PWA
- [Kraa.io](https://kraa.io) is a minimal-interface text editor and publishing platform where you can instantly make your writing public
- [Note by Note](https://chromewebstore.google.com/detail/note-by-note-%E2%99%AA-pitch-shif/bifddjdeacijlelkenjkfcmlbicgoglc) is a browser extension for musicians that transposes, slows down and removes vocals from YouTube videos in real time ([GitHub](https://github.com/patrickiel/note-by-note))
- [Roomy](https://a.weird.one/) is an AT Protocol-based Discord alternative for group chats in the Atmosphere
- [Taxing Wages](https://taxing-wages.gokberk.se) is a salary tax calculator for 32 OECD countries built on the OECD's taxing wages data

### Learning Resources

_This Week in Svelte_

- [Ep. 148](https://www.youtube.com/watch?v=1EIIRwU2HUg) - Changelog
- [Ep. 149](https://www.youtube.com/watch?v=K8J7pwR8cIo) - Changelog, ogygia – SSR islands and lakes in SvelteKit

_To Read_

- [Tested SvelteKit on Cloudflare. Oooooh boy...](https://www.reddit.com/r/sveltejs/comments/1vr2hxe/tested_sveltekit_on_cloudflare_oooooh_boy/) is a write-up on porting a full app to SvelteKit + Cloudflare Workers + KV + D1 + Hyperdrive + Better Auth and coming away impressed

### Libraries, Tools & Components

_UI Components and Design Systems_

- [Svelte DataTables Components](https://sv-table.vercel.app) is a free collection of 16 data-table components and 11 pre-built table blocks on top of TanStack Table v9, installable via the shadcn-svelte CLI
- [Svelte Fancy Components](https://sv-animations.vercel.app/fancy) is a port of Fancy Components with 14 unique text and media effects like Scramble In, Letter Swap and Pixel Trail
- [SVAR Svelte Calendar and Kanban](https://svar.dev/svelte/calendar/) add event calendar and Kanban board components to the SVAR Svelte library, both with drag and drop, filtering and iCal import/export
- [MUKADE UI](https://mukade-ui.com) is a terminal-style UI component library
- [Material Svelte](https://material-svelte.flenze.com) is a Material Design 3-inspired UI library
- [Beautiful UI Svelte](https://beautiful-ui-svelte.vercel.app) is a port of a set of React AI-app components

_Animations and Icons_

- [morphicons](https://morphicons-svelte.vercel.app) is an icon library where any stroke icon morphs into any other with a single prop change
- [Amicro SV](https://amicro.enisdev.com) is a port of Amicro, a curated library of micro-interaction and transition components
- [loadersz](https://loadersz.vercel.app) is a framework-agnostic loader library with 70 canvas-based motion states, exposed as a custom element with typed entry points for React, Vue and Svelte

_Frameworks and Dev Tools_

- [ogygia](https://ogygia.puruvj.dev/) brings SSR islands to SvelteKit, from Svelte contributor [Puru VJ](https://bsky.app/profile/puruvj.dev)
- [TanStack Table v9](https://tanstack.com/table/v9) shipped stable with its first Svelte-native adapter that connects directly to runes, plus Svelte-specific docs and a shadcn-svelte example
- [Wait0](https://github.com/devforth/wait0) is a dynamic cache with SWR warmup and sitemap discovery for SvelteKit that serves pages instantly and revalidates in the background

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
