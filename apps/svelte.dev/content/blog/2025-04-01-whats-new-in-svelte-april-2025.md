---
title: "What's new in Svelte: April 2025"
description: 'Writable $derived statements, hash-based routing and Vite 6 support'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

With a dozen minor releases of SvelteKit in the last month and a few more from Svelte itself, there's a lot to be excited about this month. From new helper functions to new configuration options, we've got a lot to cover...

So let's dive in!

## What's new in Svelte

- The new `idPrefix` option for `render` makes client-side ID generation more reliable in the rare cases that multiple Svelte runtimes exist on a page (**5.22.0**, [Docs](https://svelte.dev/docs/svelte/svelte-server#render), [#15428](https://github.com/sveltejs/svelte/pull/15428))
- State created in deriveds/effects can now be written/read locally without self-invalidation - reducing the number of "unsafe read"s significantly (**5.24.0**, [#15553](https://github.com/sveltejs/svelte/pull/15553))
- Derived statements are now writable (**5.25.0/5.25.2**, [Docs](https://svelte.dev/docs/svelte/derived#Overriding-derived-values), [#15570](https://github.com/sveltejs/svelte/pull/15570) and [#15581](https://github.com/sveltejs/svelte/pull/15581))
- The Svelte CLI also got an upgrade to its code generation for more intuitive formatting (**0.7.0**, [#380](https://github.com/sveltejs/cli/pull/380))
- `eslint-plugin-svelte` v3 has been released. The main update is improved support for Svelte 5. Check out the [CHANGELOG](https://github.com/sveltejs/eslint-plugin-svelte/releases) for more details.

There were also quite a few [fixes](https://github.com/sveltejs/language-tools/releases/tag/extensions-109.5.3) to the language tools earlier in the month - so be sure to keep your plugins up to date!


## What's new in SvelteKit
- The new action failure helper checks if a variable is an instance of `ActionFailure` (**2.8.0**, [Docs](https://svelte.dev/docs/kit/@sveltejs-kit#ActionFailure), [#12878](https://github.com/sveltejs/kit/pull/12878))
- Vite 6 is now supported - making SvelteKit faster and more configurable at build time (**2.9.0**, [Blog Post](https://vite.dev/blog/announcing-vite6) and [#12270](https://github.com/sveltejs/kit/pull/12270))
- The new server and client `init` hook makes it easier to inject context upon app initialization - helpful for i18n and more (**2.10.0**, Docs, [#13103](https://github.com/sveltejs/kit/pull/13103))
- The new `$app/state` module replicates the existing `$app/stores` module but using Svelte 5 state (**2.12.0**, [Docs](https://svelte.dev/docs/kit/app-state), [#13140](https://github.com/sveltejs/kit/pull/13140))
- A new configuration option, `bundleStrategy: 'split' | 'single' | 'inline'`, lets you configure how your app’s JavaScript and CSS files are loaded (**2.13.0/2.15.0**, [Docs](https://svelte.dev/docs/kit/configuration#output), [#13173](https://github.com/sveltejs/kit/pull/13173) and [#13193](https://github.com/sveltejs/kit/pull/13193))
- Hash-based routing is now built in and can be configured app-wide (**2.14.0**, [Docs](https://svelte.dev/docs/kit/configuration#router), [#13191](https://github.com/sveltejs/kit/pull/13191))
- A custom identifier can now be invalidated within a `goto()` (**2.16.0**, [Docs](https://svelte.dev/docs/kit/app-navigation#goto), [#13256](https://github.com/sveltejs/kit/pull/13256))
- The `postinstall` script has been removed to support pnpm 10 - users should add `"prepare": "svelte-kit sync"` to their package.json in order to avoid a warning from Vite (**2.16.0**, [#13304](https://github.com/sveltejs/kit/pull/13304))
- Values for `cache-control` and `content-type` headers will now be validated in dev mode (**2.17.0**, [#13114](https://github.com/sveltejs/kit/pull/13114))
- Server-side route resolution is now supported - improving performance and security across the board. See PR for more details (**2.17.0**, [Docs](https://svelte.dev/docs/kit/configuration#router), [#13379](https://github.com/sveltejs/kit/pull/13379))
- `reroute` can now be called async - with an option to `fetch` if you need to pass along cookies or other request context (**2.18.0/2.19.0**, [Docs](https://svelte.dev/docs/kit/@sveltejs-kit#Reroute), [#13520](https://github.com/sveltejs/kit/pull/13520) and [#13549](https://github.com/sveltejs/kit/pull/13549))
- The new `normalizeUrl` helper provides people a way to normalize a raw URL that could contain SvelteKit-internal data (**2.18.0**, [Docs](https://svelte.dev/docs/kit/@sveltejs-kit#normalizeUrl), [#13539](https://github.com/sveltejs/kit/pull/13539))
- `getRequestEvent` is a new function in `$app/server` that returns the current `RequestEvent` (**2.20.0**, [Docs](https://svelte.dev/docs/kit/app-server#getRequestEvent), [#13582](https://github.com/sveltejs/kit/pull/13582))

For a full list of bug fixes in Svelte, SvelteKit and its adapters, check out their CHANGELOGs [here](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) and [here](https://github.com/sveltejs/kit/tree/main/packages).

---

## Community Showcase

### Apps & Sites built with Svelte

- [Fusion](https://github.com/0x2E/fusion) is a lightweight, self-hosted friendly RSS aggregator and reader
- [Brooks’ Law simulator](https://www.alci.dev/en/tools/brooks-law-simulator) visualizes how communication complexity grows as team size grows
- [ai-chatbot-svelte](https://github.com/vercel/ai-chatbot-svelte) is a full-featured, hackable SvelteKit AI chatbot built by Vercel 
- [raymarching-webgpu](https://github.com/Hugo-Dz/raymarching-webgpu) is a ray marching implementation using WebGPU and Svelte 5, shaders written in WGSL
- [Eurlexa](https://www.eurlexa.com/) lets you access and search EU regulations and directives instantly
- [Lars](https://www.wsj.com/personal-finance/taxes/taxes-tax-season-ai-chatbot-lars-ebf9b410?st=hk828B) is the Wall Street Journal's AI Tax Bot - built with Svelte and embedded into a React frontend
- [RT](https://github.com/Kyagara/rt/) is a lightweight, ad-free Twitch frontend built with Tauri, Rust & SvelteKit
- [Atom Clicker](https://github.com/Ayfri/Atom-Clicker-Svelte) is an engaging incremental game where you'll build your own atomic empire
- [peasy](https://peasy.so/) provides modern web analytics without the clutter
- [svelte-lexical](https://svelte-lexical.vercel.app/) is a rich-text editor for Svelte and SvelteKit
- [sveltekit-epub-writer](https://github.com/doolijb/sveltekit-epub-writer) is an ergonomic book editor that lets you export to EPUB in one click 

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Why re-renders hurt performance and how you can fix them in Svelte 5](https://www.youtube.com/watch?v=bAAwVpvdy_g) by Stanislav Khromov
- [Runes and Global state: do's and don'ts](https://mainmatter.com/blog/2025/03/11/global-state-in-svelte-5/) by Paolo Ricciuti
- [Learn How To Make Interactive 3D Apps With Svelte And Threlte](https://www.youtube.com/watch?v=tfq8OrvORYE) by Joy of Code
- [Svelte London - March 2025](https://www.youtube.com/watch?v=R4FA-W1QCa0) featuring:
  - SvelteKit and SST by Andrico Karoulla
  - Mythbusters! Svelte Ecosystem Edition by Willow (GHOST)


_This Week in Svelte_

- [Ep. 96](https://www.youtube.com/watch?v=HnpvpWTcaVI) — durable objects
- [Ep. 97](https://www.youtube.com/watch?v=RaQLAiEP7sc) — stick to botton
- [Ep. 97](https://www.youtube.com/watch?v=0YH1RraeXFU) — Changelog
- [Ep. 99](https://www.youtube.com/watch?v=Wzd_FG-rymQ) — Custom Select

_To Watch_

- [Deploying Svelte Kit on DigitalOcean App Platform (awesome Vercel alternative) + Tailwind](https://www.youtube.com/watch?v=9FrC0kTTw64) by Elans Builds

_To Read_

- [Recursive Svelte Components](https://scriptraccoon.dev/blog/recursive-svelte-components) by Martin Brandenburg
- [Building a Real-time Dashboard with FastAPI and Svelte](https://testdriven.io/blog/fastapi-svelte/) by Amir Tadrisi Amir Tadrisi
- [A short guide to Async Components in Svelte 5](https://dev.to/digitaldrreamer/a-short-guide-to-async-components-in-svelte-5-57l4) by Abdullah Bashir
- [SvelteKit 5: How to make code-based router, instead of file-based router](https://dev.to/maxcore/sveltekit-5-how-to-make-code-based-router-instead-of-file-based-router-1jf) by Max Core
- [Integrating tRPC with SvelteKit](https://dev.to/wobsoriano/integrating-trpc-with-sveltekit-4271) by Robert Soriano

### Libraries, Tools & Components

- [Bun has added](https://github.com/oven-sh/bun/pull/17735) official support for Svelte as a frontend framework for their bundler 
- [Skeleton v3.0](https://www.skeleton.dev/) is now available - including Svelte 5 support, Tailwind 4 and a more modular structure
- [SaapsUI](https://github.com/sappsdev/sappsui) is a comprehensive Svelte component library designed for creating responsive, accessible, and beautiful user interfaces with minimal effort
- [SVAR Svelte v2.1](https://svar.dev/svelte/) has added new UI components - including DataGrid and Gantt charts
- [cnblocks](https://github.com/SikandarJODD/cnblocks) provides 50+ UI & Marketing blocks using Svelte 5, Tailwind CSS v4 and Shadcn Svelte
- [Edra](https://www.reddit.com/r/sveltejs/comments/1jdyyjv/shadeditor_evolves_to_edra_a_headless/) is a Headless & ShadCN-Powered Rich Text Editor for Svelte Developers
- [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs/changelog#paraglide-js-20-), the i18n library for supporting multiple languages in your Svelte app, release their 2.0 version
- [oRPC](https://github.com/unnoq/orpc) helps you build type-safe APIs for Svelte and TanStack Svelte Query
- [Sveltepress](https://github.com/SveltePress/sveltepress) is a content centered site build tool, built on top of Sveltekit
- [Konva.js](https://konvajs.org/docs/svelte/index.html) is a declarative 2D Canvas for Svelte apps
- [Svelte Inspect Value](https://inspect.eirik.space/) is a "JSON tree"-like value inspector
- [Svelte 5 Snippets](https://marketplace.visualstudio.com/items?itemName=thonymg.svelte-5-kit-snippets) offers reusable code templates to accelerate development and ensure consistent coding practices in VS Code

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
