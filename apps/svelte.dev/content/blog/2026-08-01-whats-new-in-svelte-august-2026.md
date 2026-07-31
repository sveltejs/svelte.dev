---
title: "What's new in Svelte: August 2026"
description: 'The SvelteKit 3 preview lands with new $app modules, zero-config error props and refreshAll'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

The biggest news this month is the first `@next` releases of SvelteKit 3. Thirteen preview versions shipped in July: previewing new `$app/manifest` and `$app/service-worker` modules, improved API availability and type checking in service workers, tracing out of the experimental namespace, shallow routing baked into `goto` and a lot more. It's a prerelease, but it's worth trying out to see what's coming to SvelteKit!

Alongside the preview releases, the stable line kept moving with `submitted` on remote forms and a new home for `defineEnvVars`. The language tools also picked up zero-config `+error.svelte` props so error pages get their `page` and `error` types with no extra setup.

And, in case you missed it, [Svelte Summit Ljubljana 2026](https://sveltesummit.com) is happening November 19-20, with a workshop day on November 18, the day before the summit. Save the date!

## What's new in SvelteKit

- Remote forms now expose a `submitted` property so you can react to the moment a form is submitted without waiting for the response (**2.69.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#form), [#14811](https://github.com/sveltejs/kit/pull/14811))
- `defineEnvVars` has moved from `@sveltejs/kit` to `@sveltejs/kit/env` so environment helpers live in a dedicated subpath (**2.70.0**, [Docs](https://svelte.dev/docs/kit/@sveltejs-kit-env#defineEnvVars), [#16378](https://github.com/sveltejs/kit/pull/16378))

## SvelteKit 3 preview

The next major version has landed in `@next`. Here are the highlights from `3.0.0-next.5` through `3.0.0-next.13` that you'll actually want to try out:

- Shallow routing is now built into `goto` via a new `state` option (with `persistState: true` to keep state across reloads), replacing `pushState` and `replaceState` (**3.0.0-next.13**, [#16449](https://github.com/sveltejs/kit/pull/16449))
- `goto`'s `noScroll` and `keepFocus` options (and their matching `data-sveltekit-*` attributes) collapse into a single `reset` option (**3.0.0-next.13**, [#16558](https://github.com/sveltejs/kit/pull/16558))
- `error(status, {...})` is deprecated in favor of `error(status, message, {...})` so error messages are always required (**3.0.0-next.13**, [#16540](https://github.com/sveltejs/kit/pull/16540))
- `refreshAll` replaces `invalidateAll`, which is now deprecated (**3.0.0-next.8**, [#16289](https://github.com/sveltejs/kit/pull/16289))
- A new `$app/manifest` module exposes `immutable`, `assets`, `prerendered` and `routes` so you can introspect the build output at runtime (**3.0.0-next.12**, [#16372](https://github.com/sveltejs/kit/pull/16372))
- A new `$app/service-worker` module replaces the old `$service-worker`, and `$app/paths` is now importable inside service workers (**3.0.0-next.12**, [#16458](https://github.com/sveltejs/kit/pull/16458), [#16441](https://github.com/sveltejs/kit/pull/16441))
- SvelteKit now detects new deployments on data, remote and form action responses, on tab focus and on visibility change, with a default `version.pollInterval` of one hour (**3.0.0-next.12**, [#16496](https://github.com/sveltejs/kit/pull/16496))
- Sourcemaps are now supported in production builds (**3.0.0-next.11**, [#16412](https://github.com/sveltejs/kit/pull/16412))
- Tracing has moved out of the experimental namespace and the `instrumentation` flag has been removed (**3.0.0-next.7**, [#16260](https://github.com/sveltejs/kit/pull/16260))
- Form fields pick up a `dirty()` helper and remote forms get a new `field.touched()` for better validation UX (**3.0.0-next.6**, [#16208](https://github.com/sveltejs/kit/pull/16208), [#14692](https://github.com/sveltejs/kit/pull/14692))

Full preview details (including expected breaking changes) are in the [SvelteKit 3 CHANGELOG](https://github.com/sveltejs/kit/blob/version-3/packages/kit/CHANGELOG.md).

For all the features and bugfixes across the stable line and adapters, check out the SvelteKit [CHANGELOGs](https://github.com/sveltejs/kit/tree/main/packages).

## What's new in the Svelte CLI and Language Tools

- `sv` now picks the right package manager more reliably, with detection that respects the lockfile in nested workspaces (**sv@0.16.6**, [#1190](https://github.com/sveltejs/cli/pull/1190))
- Add-on authors can now call `addOption` during the setup phase to add options dynamically based on user choices (**sv@0.16.6**, [#1042](https://github.com/sveltejs/cli/pull/1042))
- The prettier add-on now formats every file it generates, not just the ones it touches (**sv@0.16.6**, [#1192](https://github.com/sveltejs/cli/pull/1192))
- The `better-auth` add-on has been bumped to Better Auth 1.6 and now uses the dedicated `auth` package (**sv@0.16.5**, [#1058](https://github.com/sveltejs/cli/pull/1058))
- `sv-utils` gains `defineEnv().importEnv` for importing from the environment module without branching on mode, plus recognition of the `nub` package manager (**sv-utils@0.3.1/0.3.2**, [#1150](https://github.com/sveltejs/cli/pull/1150), [#1187](https://github.com/sveltejs/cli/pull/1187))
- `+error.svelte` now gets its `page` and `error` props typed automatically, with no extra setup (**svelte-check@4.7.3/svelte2tsx@0.7.58**, [#3076](https://github.com/sveltejs/language-tools/pull/3076))
- `svelte-language-server` drops its `lodash` dependency for a smaller install and faster startup (**svelte-language-server@0.18.3**, [#3038](https://github.com/sveltejs/language-tools/pull/3038))
- The Svelte Inspector adds a context menu with the current component stack, making it easier to jump between parent and child components (**vite-plugin-svelte@7.2.0**, [#1370](https://github.com/sveltejs/vite-plugin-svelte/pull/1370))
- The `@sveltejs/opencode` plugin now ships a TUI variant for terminal workflows (**opencode@0.1.10**, [#231](https://github.com/sveltejs/ai-tools/pull/231))
- `@sveltejs/opencode` also gains an `autoupdate` option so the plugin can keep itself current (**opencode@0.1.12**, [#238](https://github.com/sveltejs/ai-tools/pull/238))

Want to dive deeper? Check out the [Svelte CLI](https://github.com/sveltejs/cli/releases) and [language-tools](https://github.com/sveltejs/language-tools/releases) releases. For all the minor changes and bugfixes that came out in the Svelte compiler this month, you can read the full [Svelte CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md).

---

## Community Showcase

### Apps & Sites built with Svelte

- [Recipe Jar](https://recipejar.app) is a local-first recipe keeper built as a PWA with runes, IndexedDB and no backend ([GitHub](https://github.com/sbmagar13/recipe-jar))
- [Doota](https://doota.dev) reimagines email as a chat interface, built entirely on Svelte and Cloudflare's edge stack ([GitHub](https://github.com/etherCorps/doota))
- [Loot Raiders](https://www.reddit.com/r/sveltejs/comments/1uv3mhx/i_built_an_inventory_extraction_game_with_svelte_5/) is a browser-based inventory extraction game built with SvelteKit, GSAP and Howler
- [Motioner](https://motioner.app) is a browser-based Figma-style design tool where every frame doubles as an animation timeline
- [The Prototype](https://theprototype.app) is a collaborative 3D scene editor built on Threlte, with peer-to-peer sync over WebRTC and a full runes-based state system
- [clocks.dev](https://clocks.dev) is a community-built gallery where every clock is a Svelte component and anyone can contribute a new design
- [Flatxel](https://flatxel.com) is an r/place-style collaborative pixel canvas
- [Gabble](https://gabble.gg) is a daily word game PWA that mixes Wordle and Boggle mechanics
- [Can you terraform Mars?](https://www.nature.com/immersive/d41586-026-01978-8/index.html) is an interactive Nature featured article

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [atproto x npmx x svelte meetup](https://www.youtube.com/live/z3U3yUWrml4?si=BeV9eTgVyl0HghJv) happened in Berlin after Local-First Conf - a crossover satellite event with the AT Protocol, npmx, and Svelte communities!
- [Agentic Engineering with Svelte](https://mainmatter.com/blog/2026/07/28/agentic-engineering-with-svelte/) by Paolo Ricciuti walks through how Mainmatter is building agent-driven workflows on top of Svelte and SvelteKit

_This Week in Svelte_

- [Ep. 145](https://www.youtube.com/watch?v=1QJ5dFvbgrI) - Changelog, Wuchale
- [Ep. 146](https://www.youtube.com/watch?v=EjpIXG9dGtA) - Changelog, Chatto
- [Ep. 147](https://www.youtube.com/watch?v=SfZx_D0bI7E) - Changelog

_To Read_

- [Migrated a dashboard application from React to Svelte](https://www.reddit.com/r/sveltejs/comments/1uqy6ub/migrated_a_dashboard_application_from_react_to/) - an account from an engineer who cut their bundle size roughly in half after moving from TanStack Start + React Query to SvelteKit and remote functions
- [I built a Rust toolchain for Svelte](https://blog.baseballyama.com/posts/20260721-rsvelte) by Yamagishi Kazutoshi (one of the main Svelte `language-tools` maintainers) walks through `rsvelte`, a Rust reimplementation of the Svelte compiler, formatter, linter, type checker and LSP tested against 12,000+ real components
- [Three years ago I told you Svelte gave me everything](https://www.reddit.com/r/sveltejs/comments/1uu9sg6/three_years_ago_i_told_you_svelte_gave_me/) by Bishwas Bhandari is a personal retrospective on six years of building with Svelte
- [Building a Dynamic Invoice Form in Svelte 5 with Formisch](https://formisch.dev/blog/dynamic-invoice-form-svelte/) uses Formisch, Valibot and `FieldArray` to build a typed dynamic invoice form
- [Svelte Building Blocks](https://github.com/erayack/svelte-building-blocks) is a free, runnable, level-based course that starts with components and runes and works up through APIs, testing and production

### Libraries, Tools & Components

_Frameworks and Tooling_

- [LayerChart 2.0](https://layerchart.com) shipped a rewrite with a CSS-framework-agnostic API, new components and chart types from Sean Lynch
- [Mochi 0.8.0](https://mochi.fast) adds an `<Image>` component with resizing, email sending with Svelte components as templates, queues, rate limiting and a built-in captcha
- [rsvelte](https://baseballyama.github.io/rsvelte/) is a Rust implementation of the Svelte toolchain from Yamagishi Kazutoshi
- [Frizzante v2](https://razshare.github.io/frizzante-docs/) is a Go + Svelte full-stack framework whose latest release adds SSG snapshots
- [SVOCS](https://svocs.dev) is a markdown-first docs and blog generator built on SvelteKit
- [Svelte DocSmith](https://docsmith.geodask.com) is another docs framework for SvelteKit where markdown files become routes and the sidebar builds itself from frontmatter

_UI Components and Visual Effects_

- [Lily](https://lily-svelte.pages.dev) is a Tailwind v4 component library with a single "quiet by design" visual language and shadcn-style CLI installs
- [CossUI-Svelte](https://cossui-svelte.com) is an unofficial port of the Coss UI components backfilling components missing from shadcn, Bits UI and Origin UI
- [mindmapcn-svelte](https://mindmapcn-svelte.mind-elixir.com) is a zero-config interactive mind map component styled to fit shadcn-svelte design systems
- [Svelte Swipe To Action](https://svelte-swipe-ashy.vercel.app) is a highly customizable swipe-to-action component
- [Edra v3](https://edra.tsuzat.com) is a rich text editor for SvelteKit that now ships headless and shadcn variants through a CLI and component registry
- [CMS Brew](https://cmsbrew.com/demo) lets clients edit their SvelteKit site through a chat interface that produces plain commits on GitHub
- [File Viewer for Svelte](https://doc.file-viewer.app/guide/ecosystem#svelte) is a native Svelte component and action for previewing PDF, Office, CAD and archive files in the browser ([Demo](https://demo.file-viewer.app/))

_Developer Tools and Plugins_

- [svelte-vitals](https://oekazuma.github.io/svelte-vitals/) is a static code-health checker for SvelteKit that scores SEO, performance, correctness, security and architecture from source, with inline PR annotations and SARIF upload
- [PerfGraph](https://github.com/Be1zebub/PerfGraph) turns Lighthouse traces into a focused "root cause to impact to fix" report designed to be read by AI agents
- [SDuX](https://www.sdux-vault.com/docs) is a deterministic pipeline-based state management library that works with Svelte through `@sdux-vault/core`
- [Vivalence](https://github.com/vivalence/Vivalence) is an AI-harnessed, self-hostable app platform built in Svelte
- [Hoikka](https://www.hoikka.dev) is a full-stack SvelteKit ecommerce project that runs on SQLite and deploys to Node or Cloudflare (`pnpx create-hoikka-app` to try it)
- [svelte-effect-runtime](https://barekey.dev/docs/ser/introduction) lets you `yield*` effectful code directly inside `<script>` and markup
- [PlaySocket](https://therealpaulplay.github.io/PlaySocketJS/) is a multiplayer library that handles optimistic updates and CRDT-based synchronization

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
