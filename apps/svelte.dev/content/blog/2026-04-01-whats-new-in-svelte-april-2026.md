---
title: "What's new in Svelte: April 2026"
description: 'MCP in OpenCode, functions in config and error boundaries on the server'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

This month, a new [best practices guide](https://svelte.dev/docs/svelte/best-practices) was added to the Svelte docs. Check it out, if you haven't already!

On the code side, the Svelte MCP got even easier to use with improvements to the official OpenCode package. Combined with the improvements to `svelte.config.js`, server-side error boundaries in SvelteKit and better types all around, this month is full of great improvements!

As always, there's plenty in the showcase too!

## What's new in Svelte and SvelteKit

- MCP: Svelte's opencode config can now be found in sv's `.opencode/` folder - including the generated `svelte.json` plugin config (**sv@0.12.6**, [Docs](https://github.com/sveltejs/ai-tools/tree/main/packages/opencode), [#977](https://github.com/sveltejs/cli/pull/977))
- `svelte.config.js` now contains functions for setting certain options (`css`, `runes`, `customElement`) so that there's a single source of truth for everything that needs to interact with Svelte config (**svelte@5.54.0**, [Docs](https://svelte.dev/docs/svelte/svelte-compiler#CompileOptions), [#17951](https://github.com/sveltejs/svelte/pull/17951))
- `svelte/motion` now exports `TweenOptions`, `SpringOptions`, `SpringUpdateOptions` and `Updater` - these types cover the public method signatures of `spring` and `tweened` (**svelte@5.55.0**, [Docs](https://svelte.dev/docs/svelte/svelte-motion), [#17967](https://github.com/sveltejs/svelte/pull/17967))
- Error boundaries are now allowed to catch errors on the server (**kit@2.54.0**, [Docs](https://svelte.dev/docs/kit/errors#Rendering-errors), [#15308](https://github.com/sveltejs/kit/pull/15308))
- Page and layout params with matchers are now type narrowed in `$app/types` - leading to better type safety when working with params in `$app/types`, `$app/state`, and hooks (**kit@2.55.0**, [Docs](https://svelte.dev/docs/kit/$app-types), [#15502](https://github.com/sveltejs/kit/pull/15502))

For a full list of changes - including all the important bugfixes that went into the releases this month - check out the Svelte compiler's [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md). Looking for more details on the many bug fixes and performance optimizations from this month? Check out the SvelteKit / Adapter [CHANGELOGs](https://github.com/sveltejs/kit/tree/main/packages).

---

## Community Showcase

### Apps & Sites built with Svelte

- [Ghostty Config](https://ghostty.zerebos.com/) is a beautiful intuitive configuration generator for Ghostty terminal
- [Orbit PDF](https://orbit.nexonauts.com/) is a professional, high-performance PDF toolkit that runs entirely in your browser
- [Estimate Quest](https://estimate.quest/) is a game-inspired planning poker experience that helps Scrum Masters and Product Managers run structured, actually engaging estimation sessions
- [Deltaray](https://deltaray.vercel.app/) is a free and [open source](https://github.com/stormyzio/deltaray) web app to simulate how light refracts and reflects on surfaces, using real physics and optical calculations
- [Nabu](https://nabu.aion.builders/) is a modular, local-first and [open source](https://github.com/aionbuilders/nabu) block editor engine
- [bizi](https://github.com/ieedan/bizi) is a better way to manage dependent concurrent tasks
- [Vyay](https://vyay.theonlyanil.workers.dev/) is a minimalist google sheet powered expense racker
- [ElyOS](https://elyos.hu/en) is a full-featured desktop experience powered by web technologies
- [Plought](https://plought.app/) is a collection of decision making applications that use different methods to evaluate alternatives against each other
- [otel-gui](https://github.com/metafab/otel-gui) is a lightweight, zero-config OpenTelemetry trace viewer for local development
- [Nodepod](https://scelar.com/blog/introducing-nodepod) is a free, [open source](https://github.com/ScelarOrg/Nodepod) alternative to WebContainers
- [VariantCAD](https://github.com/patrickiel/VariantCAD) is a hybrid CAD system for variant generation

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [npmx shows what npmjs won't](https://www.svelteradio.com/episodes/npmx-shows-what-npmjs-wont) by Svelte Radio
- [Svelte on Vercel](https://community.vercel.com/live/34169-community-session-svelte-on-vercel) - Community Session with Rich Harris, Elliot Johnson, Simon Holthausen and Maya Avendaño

_This Week in Svelte_

- [Ep. 132](https://www.youtube.com/watch?v=ew78adBjnQw) — Changelog
- [Ep. 133](https://www.youtube.com/watch?v=8OKXegmRtxk) — Changelog
- [Ep. 134](https://www.youtube.com/watch?v=hHV7MHpt2Co) — Changelog, convex-sveltekit
- [Ep. 135](https://www.youtube.com/watch?v=C9yxUniluVU) — Changelog
- [Ep. 136](https://www.youtube.com/watch?v=2yJA_3fJ7Wk) — Changelog

_To Read_

- [How we Rewrote 130K Lines from React to Svelte in Two Weeks](https://strawberrybrowser.com/blog/react-to-svelte) by Strawberry

### Libraries, Tools & Components

- [svelte-realtime](https://github.com/lanteanio/svelte-realtime) is a realtime RPC and reactive subscriptions for SvelteKit, built on svelte-adapter-uws
- [itty-sockets](https://ittysockets.com/) is an ultra-tiny WebSocket client that pairs (optionally) with a public relay server
- [Motion GPU](https://www.motion-gpu.dev/) is an easy way for writing WGSL shaders in Svelte
- [ptero](https://ptero.yaoke.pro/) is a Docusaurus for Svelte
- [Svelte Audio UI](https://github.com/ddtamn/svelte-audio-ui) is a set of accessible, composable audio UI components
- [Svelte Agentation](https://github.com/SikandarJODD/sv-agentation) is a dev-mode Svelte inspector for source-aware element inspection and browser annotations
- [cross-router](https://codeberg.org/Bricklou/cross-router) is a framework-agnostic router that wires the core's navigation state into that framework's reactivity model
- [SVG to Svelte](https://github.com/JLAcostaEC/svgtosvelte) quickly converts SVG strings directly in Svelte components

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
