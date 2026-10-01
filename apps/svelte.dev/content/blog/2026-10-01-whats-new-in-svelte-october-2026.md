---
title: "What's new in Svelte: October 2026"
description: 'Svelte Summit Ljubljana, more SvelteKit 3 adapter changes and node:sqlite in the sv drizzle add-on'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Svelte Summit is back for Svelte's 10th birthday! It's happening in Ljubljana on November 19-20 with talks from Rich Harris, Elliott Johnson, Paolo Ricciuti, Stanislav Khromov, pngwn and more. In-person and virtual tickets are available at [sveltesummit.com](https://sveltesummit.com/).

September was a quiet month for Svelte itself - 5.57.1 is all bug fixes and parser performance work - while SvelteKit 3 kept rolling through prereleases with a round of adapter API changes and zero-config deploys to Render.

Per usual, there's still plenty in the showcase... so let's dive in!

## What's new in SvelteKit 3

- Adapters now receive the Svelte config as a function argument when adding Vite plugins (**3.0.0-next.27**, [#16986](https://github.com/sveltejs/kit/pull/16986))
- Adapters can override `getRequest` and `setResponse` during `vite dev` and `vite preview`, so local requests behave more like the target platform (**3.0.0-next.27**, [Docs](https://next.svelte.dev/docs/kit/writing-adapters), [#16753](https://github.com/sveltejs/kit/pull/16753))
- Node: static assets are now served from tables recorded at build time instead of `sirv` (**adapter-node@6.0.0-next.13**, [Docs](https://next.svelte.dev/docs/kit/migrating-to-sveltekit-3#Adapters-adapter-node), [#16908](https://github.com/sveltejs/kit/pull/16908))
- Netlify: the `split` and `edge` options can now be used together (**adapter-netlify@7.0.0-next.12**, [Docs](https://next.svelte.dev/docs/kit/adapter-netlify#Options-split), [#17045](https://github.com/sveltejs/kit/pull/17045))
- `adapter-auto` now supports zero-config deployments to Render (**adapter-auto@8.0.0-next.4**, [Docs](https://next.svelte.dev/docs/kit/adapter-auto), [#16850](https://github.com/sveltejs/kit/pull/16850))
- **Breaking changes in the latest prereleases**
  - The server now errors when a client-requested single-flight mutation refresh isn't handled. Use `ignore()` or `ignoreAll()` on `requested` to skip a refresh on purpose (**3.0.0-next.27**, [Docs](https://next.svelte.dev/docs/kit/remote-functions#Single-flight-mutations-Client-requested-refreshes), [#16892](https://github.com/sveltejs/kit/pull/16892))
  - Environment variables are now populated before `instrumentation.server.js` is evaluated, and the adapter instrumentation API has been updated to match (**3.0.0-next.27**, [Docs](https://next.svelte.dev/docs/kit/migrating-to-sveltekit-3#Adapters-Adapter-API-changes-Server-instrumentation), [#16303](https://github.com/sveltejs/kit/pull/16303))
  - `builder.generateManifest` has been replaced with `builder.generateServerInstance` and `builder.manifest`, and the `Server` constructor and `SSRManifest` type are no longer public (**3.0.0-next.27**, [Docs](https://next.svelte.dev/docs/kit/migrating-to-sveltekit-3#Adapters-Adapter-API-changes), [#16875](https://github.com/sveltejs/kit/pull/16875), [#16876](https://github.com/sveltejs/kit/pull/16876))
  - Query parameters beginning with `x-sveltekit-` are now rejected (**3.0.0-next.28**, [#17125](https://github.com/sveltejs/kit/pull/17125))
  - Cloudflare: the `platform` object has been removed. Bindings now come from an emulated `cloudflare:workers` module instead (**adapter-cloudflare@8.0.0-next.7**, [Docs](https://next.svelte.dev/docs/kit/adapter-cloudflare#Runtime-APIs), [#16754](https://github.com/sveltejs/kit/pull/16754))
  - Node: only static assets present at build time are served, they're validated with content-hash `ETag`s instead of `Last-Modified`, and they only respond to `GET` and `HEAD` requests (**adapter-node@6.0.0-next.13**, [Docs](https://next.svelte.dev/docs/kit/migrating-to-sveltekit-3#Adapters-adapter-node), [#16908](https://github.com/sveltejs/kit/pull/16908))
  - Netlify: static files are now written based on the `publish` adapter option rather than reading `netlify.toml` (**adapter-netlify@7.0.0-next.12**, [Docs](https://next.svelte.dev/docs/kit/migrating-to-sveltekit-3#Adapters-adapter-netlify), [#17078](https://github.com/sveltejs/kit/pull/17078))

All of the upcoming SvelteKit 3 docs still live on [next.svelte.dev](https://next.svelte.dev/docs/kit/migrating-to-sveltekit-3), and the full changelog is on the [version-3 branch](https://github.com/sveltejs/kit/blob/version-3/packages/kit/CHANGELOG.md). Adapter changes can be found in the [SvelteKit / Adapter CHANGELOGs](https://github.com/sveltejs/kit/tree/version-3/packages).

## What's new in the Svelte CLI and AI Tools

- The `drizzle` add-on can now set up SQLite with Node's built-in `node:sqlite` module (**sv@0.17.1**, [Docs](https://svelte.dev/docs/cli/drizzle#Options-client), [#1206](https://github.com/sveltejs/cli/pull/1206))
- The Svelte OpenCode plugin now supports OpenCode V2 (**opencode@0.1.15**, [#258](https://github.com/sveltejs/ai-tools/pull/258))

For all the bug fixes and performance improvements that went into Svelte 5.57.1 this month, check out the Svelte compiler's [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md). CLI and AI tools updates can be found in the [Svelte CLI](https://github.com/sveltejs/cli/releases) and [ai-tools](https://github.com/sveltejs/ai-tools/releases) releases.

---

## Community Showcase

### Apps & Sites built with Svelte

- [Docvia](https://docvia.dev) is a framework-agnostic documentation library
- [Powermove](https://trypowermove.com) is an open-source video editor where an agent can add or fork panels, effects and workflows as extensions while the app is running
- [npmchart](https://www.npmchart.com) lets you analyze and compare npm downloads, releases and GitHub activity for any package, from LayerChart author Sean Lynch
- [GFX Computer](https://gfx.computer) is a graphics tool from Scott Tolinski built on TypeGPU and GSAP (requires HTML-in-Canvas to be enabled)
- [PicoCAD 2 Web Viewer](https://picocad2-web-viewer.hfcred.workers.dev/) renders PicoCAD 2 models in the browser with optional special effects and GIF export
- [VisuallyJs Circuit Diagram](https://visuallyjs.com/demonstrations/circuit-diagram) is a starter app for building an electronic circuit designer with VisuallyJs
- [IMPIB](https://www.impib.dev) is an in-browser image workflow for compressing, cropping and packaging responsive image variants, all processed locally with WebAssembly codecs
- [Supvan Katasymbol Printer Web UI](https://github.com/khromov/supvan-katasymbol-printer-web-ui) lets you print to Katasymbol thermal label printers straight from the browser on any computer or phone
- [Deskfolk](https://blackman99.github.io/deskfolk/) is a private AI team on your Mac that asks before risky moves and shows its work
- [uptik](https://uptik.pages.dev/) schedules your video uploads so you don't have to watch the clock to hit publish
- [Mini Game Zone](https://minigamezone.duckdns.org/) is a browser-based party game where two teams compete in quick mini-games like color matching and word races
- [Arknights: Endfield Factory Planner](https://beta.enka.network/endfield/aic/?id=U5m0U0B3v1r4y6) helps you plan factories in Arknights: Endfield, with a Zig/WASM solver doing the heavy lifting
- [SPIRAL WARDEN](https://evreser.itch.io/spiral-warden) is an arena shooter/survival browser game with a Svelte UI on top of Phaser 3 physics

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Make native desktop apps with Svelte 5 today using Custom Renderers](https://www.youtube.com/watch?v=5CBib_rwt8w) by Code with Stanislav (featuring [this WIP library](https://github.com/khromov/gpuix-svelte/))
- [WebMCP Challenge - GFX Computer](https://www.youtube.com/watch?v=aG7UCVwQ3Fg) by Scott Tolinski

_This Week in Svelte_

- [Ep. 150](https://www.youtube.com/watch?v=7ERSQ3s3g9o)
- [Ep. 151](https://www.youtube.com/watch?v=z9O5ho02FVQ) - Building a simple Svelte REPL
- [Ep. 152](https://www.youtube.com/watch?v=uOQmyfNmAkg)
- [Ep. 153](https://www.youtube.com/watch?v=KL3h9OjN14M)

_To Read_

- [UI Libraries do not make your application accessible](https://theetrain.ca/blog/ui-library-accessibility) by TODO: author name (Etrain)
- [Hello, Blog!](https://theetrain.ca/blog/hello-world) covers the tech decisions behind theetrain.ca, by TODO: author name (Etrain)

### Libraries, Tools & Components

_UI Components_

- [Sivir UI](https://sivir.dev) (last featured as Neel/UI in April 2024) has been rewritten as a shadcn-style component library built to be as themeable as possible
- [FluentUI Svelte](https://fluentui-svelte.pages.dev/) brings Microsoft's Fluent UI to Svelte, now at 37 components with v0.4
- [Baby UI](https://baby-ui.nexonauts.com/) is a large collection of animation-first UI components
- [horizon-layout](https://github.com/play-horizon/horizon-layout) is a zero-dependency IDE-style layout manager with dockable panes, draggable tabs, resizable splits and pop-out windows
- [svelte5plus-calendar](https://blackman99.github.io/svelte5plus-calendar/) and [svelte-json-discovery](https://github.com/Blackman99/svelte-json-discovery)are zero-dependency calendar and JSON structure viewers, respectively
- [Svelte-pasito](https://svelte-pasito.vercel.app/) is a dependency-free, customizable step indicator component
- [Theme Toggles](https://github.com/AlfieJones/theme-toggles) is a set of animated light/dark theme toggles that now supports Svelte

_Markdown tools, editors and syntax highlighting_

- [Twinkleplop](https://twinkleplop.pngwn.at) is a delightful syntax highlighter from pngwn
- [fractalpop](https://fractalpop.vercel.app/) is an SSR-safe, async syntax highlighter for SvelteKit that works with mdsvex and ships with Editor and Code Snippet components
- [aragonite](https://www.aragonite.dev/) is a from-scratch markdown editor library for Svelte that doesn't wrap ProseMirror or another editor
- [svmd](https://github.com/imlargo/svmd) compiles CommonMark markdown straight into Svelte component source, so components and reactive expressions work inside your `.md` files
- [Editable 2.0](https://editable.website) is now in preview, letting clients edit text, images and videos directly on a Svelte site without a CMS
- [svedocs](https://svedocs.pwp.sh) is a customizable documentation framework built with SvelteKit

_Dev Tools_

- [svebcomponents](https://svebcomponents.dev/) provides boilerplate-free, type-safe, server-renderable web components
- [svdevtools](https://www.npmjs.com/package/svdevtools) is an early preview of a devtools package that lets you inspect components, props and state

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
