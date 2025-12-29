---
title: "What's new in Svelte: January 2026"
description: 'Hydration with CSPs, automatic Cloudflare adapter setup, and AI works better now with Svelte!'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

During the December holiday season, the Svelte team shared 24 days of Svelte knowledge, tips, and insights to unwrap in 2025's [Advent of Svelte](https://advent.sveltesociety.dev/2025). Learn more about under-utilized Svelte features through a series of fun and interactive videos!

There were also a bunch of improvements and showcase items across the Svelte ecosystem this last month. So let's have a look...

## What's new in Svelte & SvelteKit

- The `hydratable` option (which adds an inline `<script>` block to the `head`) now has a `csp` option in `render` to support Content Security Policies (**svelte@5.46.0**, [Docs](https://svelte.dev/docs/svelte/hydratable#CSP), [#17338](https://github.com/sveltejs/svelte/pull/17338))
- The Vercel adapter now supports Node 24 (**adapter-vercel@6.2.0/adapter-auto@7.0.0**, [#14982](https://github.com/sveltejs/kit/pull/14982) and [#14737](https://github.com/sveltejs/kit/pull/14737))
- The Svelte CLI is now able to fully setup a SvelteKit project for Cloudflare Workers/Pages development (**sv@0.11.0**, [Docs](https://svelte.dev/docs/cli/sveltekit-adapter#Options-cloudflare-target), [#851](https://github.com/sveltejs/cli/pull/851))
- The Svelte MCP now exposes tools as both a JS API and CLI (**mcp@0.1.16**, [#128](https://github.com/sveltejs/mcp/pull/128))
- A huge amount of [performance improvements](https://github.com/sveltejs/language-tools/releases) were completed this month in the language-tools so make sure your extensions are up to date!

For a full list of changes - including all the important bugfixes that went into the releases this month - check out the Svelte compiler's [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) and the SvelteKit / Adapter [CHANGELOGs](https://github.com/sveltejs/kit/tree/main/packages).

---

## Community Showcase

### Apps & Sites built with Svelte

- [GCal Wrapped](https://gcalwrapped.com/) lets students see how they spent their time this semester, wrapped up beautifully
- [Text Processing Studio](https://text-studio.metasapiens.com/) is a comprehensive text processing web application that lets you process, compare, transform, and analyze text
- [Flumio](https://flumio.io/) is a drag-and-drop workflow automation tool
- [Statue](https://statue.dev/) is a markdown-based static site generator designed for performance, flexibility, and developer experience
- [sveltemark](https://sm.fana.my.id/) is a privacy-first, open-source, local-only markdown editor
- [Lovely Docs](https://lovely-docs.github.io/) provides hierarchically optimized documentation for AI coding agents
- [Ikaw bahala](https://kahit-saan.labais.life/) is a Manila-based food platform made for couples and friends who want to search for specific foods locally

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [2025 Complete Svelte Kit Course](https://www.youtube.com/watch?v=vkXxFfGwPao) by Syntax (Scott Tolinski)
- [This AI model writes Svelte 5 code PERFECTLY](https://www.youtube.com/watch?v=nXIMQr12nqw) by Code with Stanislav
- [Building Hydratable with Elliott Johnson](https://www.youtube.com/watch?v=bLqFT2kTK6w) by Svelte Society (Kev)
- [SvelteKit and Effect with Dillon Mulroy](https://www.youtube.com/watch?v=8ByXE6dPkD4) by Svelte Society (Kev)

_Svienna_

- [Async Svelte](https://www.youtube.com/watch?v=Q6FbSxRexNg) by Domenik Reitzner
- [Svelte LLMs](https://www.youtube.com/watch?v=V6urwDivl64) by Jacob Palecek

_This Week in Svelte_

- [Ep. 123](https://www.youtube.com/watch?v=xc8BFOhZ11w) — Changelog
- [Ep. 124](https://www.youtube.com/watch?v=aP9orAaqu8w) — Changelog
- [Ep. 125](https://www.youtube.com/watch?v=TkfcChYAWwI) — Changelog
- [Ep. 126](https://www.youtube.com/watch?v=rZIhgN7jgKg) — Changelog

_Svelte Radio_

- [One Man Svelte for NGOs with Ilja](https://www.svelteradio.com/episodes/one-man-svelte-for-ngos-with-ilja) (December 6)
- [Custom Renderers for Svelte with Paolo Ricciuti](https://www.svelteradio.com/episodes/custom-renderers-for-svelte-with-paolo-ricciuti) (December 11)

_To Read_

- [Sveltekit Custom Remote Form Factory](https://dev.to/sillvva/sveltekit-custom-remote-form-factory-nmo) by Matt DeKok
- [Getting Svelte Inspector Working with Neovim](https://jovianmoon.io/posts/svelte-inspector-with-neovim) by Stephen Gunn
- [SvelteKit Remote Functions Workaround Helpers](https://dev.to/jdgamble555/sveltekit-remote-functions-workaround-helpers-4k8c) by Jonathan Gamble
- [LLM Agent-Friendly Project Setup](https://github.com/saabi/llm-agent-project-setup) by Sebastian Ferreyra
- [Announcing SvelteKit OG v4: An alternative to @vercel/og for sveltekit](https://dev.to/theether0/announcing-sveltekit-og-v4-an-alternative-to-vercelog-for-sveltekit-3cg1) by Shivam Meena
- [Svelte: Best practice to combine $derived and $state](https://dev.to/maxcore/svelte-best-practice-to-combine-derived-and-state-3f18) by Max Core
- [Embedding a SvelteKit site in PocketBase](https://brandonma.dev/blog/pocketbase-svelte-embed/) by Brandon Ma

### Libraries, Tools & Components

- [SvelteDoc](https://marketplace.visualstudio.com/items?itemName=burke-development.sveltedoc) is a VS Code extension that shows Svelte component props on hover
- [pocket-mocker](https://github.com/tianchangNorth/pocket-mocker) is an in-page HTTP controller for frontend development to intercept, modify, and simulate API responses directly in the browser
- [Avatune](https://github.com/avatune/avatune) is a production-ready avatar system with AI-powered generation and framework-native components
- [svelte-image-input](https://github.com/saabi/svelte-image-input) is a component for loading, scaling and adjusting profile pictures
- [Mint](https://github.com/mosaiq-software/mint) is a digital compositing tool that can be used to crop and resize images, create collages, build mockups, or otherwise complete basic compositing tasks
- [SvelteKit Auto OpenAPI](https://github.com/SaaSTEMLY/sveltekit-auto-openapi) is a type-safe OpenAPI generation and runtime validation for SvelteKit
- [Svelte Drawer](https://github.com/AbhiVarde/svelte-drawer) is a drawer component for Svelte 5, inspired by Vaul
- [trioxide](https://github.com/ObelusFi/trioxide) is a set of customizable components, focused on non-trivial UI pieces that are tedious to reimplement
- [svelte-asciiart](https://github.com/xl0/svelte-asciiart) is a Svelte 5 component for rendering ASCII art as scalable SVG with optional grid overlay and frame
- [svelte-bash](https://github.com/YusufCeng1z/svelte-bash) is a fully typed, lightweight, and customizable terminal emulator component with a virtual file system, custom commands, themes, and autoplay mode for demos
- [SvelTTY](https://github.com/miunau/sveltty) provides a runtime that allows you to render and interact with Svelte apps in the terminal
- [svelte-tablecn](https://github.com/itisyb/svelte-tablecn) is a powerful data grid and port of tablecn.com
- [Svelte runtime components](https://github.com/MrGentle/svelte-runtime-components) enables compiling Svelte components from text at runtime, allowing dynamic, user-provided svelte component code to be compiled and mounted in the browser

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
