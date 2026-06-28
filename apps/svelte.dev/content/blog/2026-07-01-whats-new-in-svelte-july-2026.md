---
title: "What's new in Svelte: July 2026"
description: 'SvelteKit config in vite.config, explicit env vars and new declaration tag support across the toolchain'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

This month brought a real shift in how SvelteKit projects are configured. You can now define your SvelteKit config directly inside `vite.config.js` and skip `svelte.config.js` entirely. We also got the first preview of explicit environment variables, which will eventually replace `$env/*` modules in SvelteKit 3.

On top of that, the language tools and the `sv` CLI both caught up with Svelte's new `{const ...}` declaration tags, so the whole toolchain is now in sync.

Let's dive in!

## What's new in SvelteKit

- You can now pass your SvelteKit config directly to the Vite plugin, so a separate `svelte.config.js` is no longer required (**2.62.0**, [Docs](https://svelte.dev/docs/kit/configuration), [#15944](https://github.com/sveltejs/kit/pull/15944))
- Experimental explicit environment variables let you declare and type your env vars in one place, as a preview of how `$env/*` will work in SvelteKit 3 (**2.63.0**, [Docs](https://svelte.dev/docs/kit/environment-variables#Explicit-environment-variables), [#15934](https://github.com/sveltejs/kit/pull/15934))
- Remote function commands can now receive `File` objects directly, so you can upload files without manually wrapping them in `FormData` (**2.64.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#command), [#15978](https://github.com/sveltejs/kit/pull/15978))
- Remote queries can now refresh other queries, making it easier to invalidate related data after a mutation (**2.65.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#query-Refreshing-queries), [#16012](https://github.com/sveltejs/kit/pull/16012))
- Prerendered `.md` and `.mdx` files are now precompressed alongside HTML, JS and CSS for faster delivery (**2.66.0**, [Docs](https://svelte.dev/docs/kit/adapter-static#Options-precompress), [#15893](https://github.com/sveltejs/kit/pull/15893))
- SvelteKit now warns when boolean fields in remote form schemas are not marked optional, which is a common cause of silent submit failures (**2.66.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#form-Fields), [#15804](https://github.com/sveltejs/kit/pull/15804))
- The new `prerender.handleInvalidUrl` option lets you customize how invalid URLs found during crawling are reported (**2.67.0**, [Docs](https://svelte.dev/docs/kit/configuration#prerender), [#16088](https://github.com/sveltejs/kit/pull/16088))
- `RemoteFormEnhanceInstance` and `RemoteFormEnhanceCallback` are now exported types, so you can type your custom `enhance` callbacks directly (**2.68.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#form-enhance), [#15816](https://github.com/sveltejs/kit/pull/15816))
- Submitted `submit` fields now keep their value in the form action payload, which makes multi-button forms easier to handle on the server (**2.68.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#form-Multiple-submit-buttons), [#15979](https://github.com/sveltejs/kit/pull/15979))

For all the features and bugfixes that landed this month, check out the SvelteKit / Adapter [CHANGELOGs](https://github.com/sveltejs/kit/tree/main/packages).

## What's new in the Svelte CLI and Language Tools

- The Svelte CLI demo template now uses the new `{const ...}` declaration tag, so newly created projects show off the latest Svelte syntax (**sv@0.16.0**, [#1110](https://github.com/sveltejs/cli/pull/1110))
- `sv create` now scaffolds projects against `@sveltejs/kit` `^2.62.0` and moves the Svelte config into the Vite plugin by default (**sv@0.16.0**, [#1119](https://github.com/sveltejs/cli/pull/1119))
- A new experimental add-on lets you toggle experimental flags and opt into `@next` versions directly from the CLI (**sv@0.16.0**, [#1121](https://github.com/sveltejs/cli/pull/1121))
- The `drizzle` and `better-auth` add-ons now support SvelteKit's new explicit environment variables (**sv@0.16.0**, [#1122](https://github.com/sveltejs/cli/pull/1122))
- New `defineEnv` and `svelteConfig` helpers in `@sveltejs/sv-utils` make it easier to read and edit a project's Svelte config from add-ons (**sv-utils@0.3.0**)
- The Svelte language server, `svelte-check` and `svelte2tsx` now understand Svelte 5's `{const ...}` declaration tags (**svelte-language-server@0.18.1/svelte-check@4.5.0/svelte2tsx@0.7.56**, [#3033](https://github.com/sveltejs/language-tools/pull/3033))
- The Svelte config can now be written in TypeScript with `svelte.config.ts` or `svelte.config.mts` (**svelte-language-server@0.18.1**, [#3009](https://github.com/sveltejs/language-tools/pull/3009))
- CSS completions now work inside nested `<style>` tags (**svelte-language-server@0.18.1**, [#3022](https://github.com/sveltejs/language-tools/pull/3022))
- The language tools can now read Svelte config straight from `vite.config.js/ts`, matching SvelteKit's new Vite plugin configuration (**svelte-language-server@0.18.2/svelte-check@4.6.0**, [#3031](https://github.com/sveltejs/language-tools/pull/3031))
- `svelte-check` now accepts a `--config` option to point at a custom config file location (**svelte-check@4.7.0**, [#3066](https://github.com/sveltejs/language-tools/pull/3066))
- Experimental `tsgo` (TypeScript Go) support is now available in `svelte-check` for faster type checking on large codebases (**svelte-check@4.7.0**, [#3036](https://github.com/sveltejs/language-tools/pull/3036))

Want to dive deeper? Check out the [Svelte CLI](https://github.com/sveltejs/cli/releases) and [language-tools](https://github.com/sveltejs/language-tools/releases) releases. For all the minor changes and bugfixes that came out in the Svelte compiler this month, you can read the full [Svelte CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md).

---

## Community Showcase

### Apps & Sites built with Svelte

- [COLOR LAB](https://colorlab.ferreyrapons.com) is a browser-based color science instrument that explores RGB gamuts as 3D solids and builds perceptual theme ramps with WCAG checks
- [Cometline](https://cometline.github.io) is a local desktop AI companion built with SvelteKit, Electron and a Go agent core ([GitHub](https://github.com/Cometline/cometline))
- [Disc](https://disc.sh) is a database for users, with a built-in Svelte dashboard
- [EZResumes](https://ezresumes.app) is a fully client-side, local-first resume builder that lets you customize layouts with Typst
- [Graphgen](https://graphgen.dagthom.as) is a node-based generative art tool for 2D line art
- [Lunarr](https://github.com/lunarr-app/lunarr-go) is an open source self-hosted media server and Plex alternative
- [Pixel Snapper](https://www.spritefusion.com/pixel-snapper) is a desktop tool that snaps near-pixel-art images onto perfect grids, built with SvelteKit, Tauri and Rust by the makers of the previously featured [Sprite Fusion](https://www.spritefusion.com/) ([GitHub](https://github.com/Hugo-Dz/spritefusion-pixel-snapper))
- [SuperMCP](https://webmatrices.com/supermcp) is a native macOS app that gives Claude, Cursor, Windsurf and other AI tools access to Reddit, X, LinkedIn and more via the local Chrome cookies
- [darkly](https://github.com/darkly-art/darkly) is an open source art program built with Rust and Svelte

_Spotted in the Wild_

- [Guild Wars 3](https://www.guildwars3.com) - the official ArenaNet site for the upcoming MMORPG
- [Obama Foundation](https://obama.org) - the new site for the recently opened Obama Presidential Center
- On a more meta note, [sveltekit.fyi](https://sveltekit.fyi) scans Bluesky for sites built with SvelteKit and showcases them, in the spirit of nuxt.fyi

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Agentic Engineering with Svelte](https://www.youtube.com/playlist?list=PLdAi-nB9AYut1ixrraX3E96rNNVj3iq4F) by Paolo Ricciuti is a new YouTube series from Mainmatter that documents building a real production Svelte app with AI agents (8 episodes so far, with an AMA on [July 15th](https://luma.com/2nqh8mvb))
- [My Favorite Framework Just Got Better](https://www.youtube.com/watch?v=j9fh4WC0zHo) by Joy of Code walks through realtime data in SvelteKit using remote functions, live queries and generators

_This Week in Svelte_

- [Ep. 143](https://www.youtube.com/watch?v=HCpuzfRdVvI) - Changelog, Mochi
- [Ep. 144](https://www.youtube.com/watch?v=uwA1d6neWQE) - Changelog

_To Read_

- [Picking Svelte in 2026: the honest tradeoff nobody tells you](https://dimonb19a.hashnode.dev/picking-svelte-in-2026) by Dmitrii Bormotov
- [Wuchale: One Year of Compile-Time i18n](https://dev.to/k1dv5/wuchale-one-year-of-compile-time-i18n-178a) by Kidus Adugna

### Libraries, Tools & Components

_Frameworks and Tooling_

- [Mochi](https://mochi.fast) is a performance-focused alternative to SvelteKit from Stanislav Khromov that uses islands architecture and programmatic routing on Bun ([GitHub](https://github.com/khromov/mochi))
- [pottz](https://github.com/lucaletizia/pottz) bundles your SvelteKit app, the Bun runtime and a webview into a single executable so you can ship it as a native desktop app
- [Svelte TV](https://github.com/rasterzero-dev/svelte-tv) renders Svelte components to WebGL instead of the DOM for use on smart TVs and low-memory webviews
- [TabSpot](https://github.com/JLAcostaEC/tabspot) is a declarative keyboard navigation engine for hierarchical and grid interfaces

_UI Components and Visual Effects_

- [neobrutalism-svelte](https://neobrutalism-svelte.flenze.com) is a UI library inspired by neobrutalism, balsamiq and lo-fi aesthetics ([GitHub](https://github.com/olegpolin/neobrutalism-svelte))
- [@winkintel/bootstrap-svelte](https://bootstrap-svelte.vercel.app) brings Bootstrap 5's grid, utilities and components to Svelte 5 with full TypeScript support ([GitHub](https://github.com/WinkIntel/bootstrap-svelte))
- [Tan Compose](https://ra9.github.io/tan-compose) is a lightweight library for building declarative reusable web components
- [Svaul](https://harshmandan.github.io/svaul/) is a zero-dependency drawer component for Svelte 5, modernizing vaul-svelte
- [Svelte Animated Icon](https://svelte-animated-icon.vercel.app) ships close to 10,000 animated icon variants across five icon libraries using the Web Animations API ([GitHub](https://github.com/fractalmandala/svelte-animated-icon))
- [FlareCharts](https://faintshadow.gitlab.io/flarecharts) is a runes-native charting library for Svelte 5 with built-in CSS theming and accessibility
- [Svelte Video Editor](https://svelte-video-editor.ariefsn.dev) is a host-agnostic timeline-based video editor component for Svelte 5 with multi-track clips, scrubbing and ripple edits ([GitHub](https://github.com/ariefsn/svelte-video-editor))

_Developer Tools and Plugins_

- [tsv](https://tsv.fuz.dev) is a Rust-based formatter and parser for TypeScript, Svelte and CSS, with a linter on the roadmap ([GitHub](https://github.com/fuzdev/tsv))
- [svelte-docinfo](https://svelte-docinfo.fuz.dev) extracts JSON documentation from TypeScript and Svelte modules using the TypeScript compiler ([GitHub](https://github.com/fuzdev/svelte-docinfo))
- [VS Code Live Theme Editor](https://github.com/fractalmandala/IDE-Theme-Editor) is a VSIX extension for editing every token and color in any VS Code, Cursor or TRAE theme
- [sveltekit-cloudflare-do](https://github.com/The-LukeZ/sveltekit-cloudflare-do) automatically exports Durable Objects to the Cloudflare Worker bundle generated by `@sveltejs/adapter-cloudflare`

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
