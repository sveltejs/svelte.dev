---
title: "What's new in Svelte: February 2026"
description: 'Custom select elements, new button props for remote functions and improvements across the Node and Vercel adapters'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

This month brings a few new features to Svelte and SvelteKit and quite a few new libraries from around the community.

Also, in case you missed it last month, the Svelte maintainers released patches for 5 vulnerabilities across the Svelte ecosystem. So be sure you're up to date by reading the blog post, [CVEs affecting the Svelte ecosystem](https://svelte.dev/blog/cves-affecting-the-svelte-ecosystem).

Now, without further ado, let's dive in...

## What's new in Svelte & SvelteKit

- To support newer browsers that allow it, you can now customize `<select>` elements using CSS and rich HTML content (**svelte@5.47.0**, [Docs](https://developer.chrome.com/blog/a-customizable-select), [#17429](https://github.com/sveltejs/svelte/pull/17429))
- Svelte's `parseCss` has been exported from `svelte/compiler` so that it can be used in SvelteKit (**svelte@5.48.0**, [#17496](https://github.com/sveltejs/svelte/pull/17496))
- A breaking change in SvelteKit's remote functions removes `buttonProps` from experimental remote form functions. Use `<button {...myForm.fields.action.as('submit', 'register')}>Register</button>` when creating mutliple submit buttons instead (**kit@2.50.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#form-Multiple-submit-buttons), [#15144](https://github.com/sveltejs/kit/pull/15144))
- Node: New env vars for `keepAliveTimeout` and `headersTimeout` (**sveltejs/adapter-node@5.5.0**, [Docs](https://svelte.dev/docs/kit/adapter-node#Environment-variables-KEEP_ALIVE_TIMEOUT-and-HEADERS_TIMEOUT), [#15125](https://github.com/sveltejs/kit/pull/15125))
- Vercel: Remote function calls can now be found under the /\_app/remote route in observability (**sveltejs/adapter-vercel@6.3.1**, [#15098](https://github.com/sveltejs/kit/pull/15098))

For a full list of changes - including all the important bugfixes that went into the releases this month - check out the Svelte compiler's [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) and the SvelteKit / Adapter [CHANGELOGs](https://github.com/sveltejs/kit/tree/main/packages).

---

## Community Showcase

### Apps & Sites built with Svelte

- [Frame](https://getframe.vercel.app/) is a high-performance media conversion utility built on the Tauri v2 framework. It provides a native interface for FFmpeg operations, allowing for granular control over video and audio transcoding parameters
- [LogTide](https://logtide.dev/) is an open-source alternative to Datadog, Splunk, and ELK. Designed for developers and European SMBs who need GDPR compliance, data ownership, and simplicity without the complexity of managing an ElasticSearch cluster
- [funcalling](https://www.funcalling.com/) is a P2P calling app with built in board games, word games, and motion capture games ([Reddit post](https://www.reddit.com/r/sveltejs/comments/1qgrq2c/i_built_a_p2p_calling_app_with_built_in_board/) includes a video demo)
- [book by book](https://bookbybook.app/) lets you sync book data, covers, and pricing to a Square POS in seconds. You can import distributor orders from Ingram, Edelweiss & PubEasy—no spreadsheets or manual entry
- [zsweep](https://github.com/oug-t/zsweep) is a minimalist, keyboard-driven Minesweeper game played with Vim motions
- [PulseKit](https://trypulsekit.com/) provides professional feedback management to collect and prioritize customer feedback
- [Bitphase](https://bitphase.app/) is a modern web-based chiptune tracker designed for creating music on retro sound chips ([GitHub](https://github.com/paator/bitphase))
- [CapCheck](https://capcheck.ai/) is a fact checker AI for images, videos, audio, text and URLs
- [Pelican](https://github.com/xl0/pelican) lets you generate SVG vector graphics and ASCII art from text prompts. With multi-step refinement, AI sees its output and improves it iteratively

### Learning Resources

_This Week in Svelte_

- [Ep. 127](https://www.youtube.com/watch?v=eTchw_QU3aQ) — Changelog
- [Ep. 128](https://www.youtube.com/watch?v=58Ol4FbMjz4) — Changelog

_To Read_

- [Bundling a SvelteKit app into a single binary](https://gautier.dev/articles/sveltekit-sea) by Gautier Ben Aïm

### Libraries, Tools & Components

_UI Components and Animations_

- [mapcn-svelte](https://github.com/MariusLang/mapcn-svelte) is a Svelte port of mapcn built on MapLibre GL, styled with Tailwind, works seamlessly with shadcn-svelte
- [AgnosticUI Local (v2)](https://github.com/AgnosticUI/agnosticui) is a CLI-based UI component library that copies Lit web components directly into your project
- [Motion Core](https://github.com/motion-core/motion-core) is a collection of animated Svelte components powered by GSAP and Three.js
- [Tilt Svelte](https://github.com/Savy011/tilt-svelte) is a smooth 3D tilt Svelte attachment based on vanilla-tilt.js

_State Management_

- [Reddo.js](https://github.com/eihabkhan/reddojs) is a tiny undo/redo utility package for JavaScript, React, Vue, and Svelte
- [svstate](https://github.com/BCsabaEngine/svstate) provides deep reactive proxy with validation, snapshot/undo, and side effects — built for complex, real-world applications
- [rune-sync](https://github.com/antepodeum/rune-sync) synchronizes reactive state across various storage backends

_Plugins, Compilers and Runtimes_

- [fastify-svelte-view](https://github.com/matths/fastify-svelte-view) is a Fastify plugin for rendering Svelte components with support for SSR (Server-Side Rendering), CSR (Client-Side Rendering), and SSR with hydration
- [kit-on-lambda](https://github.com/beesolve/kit-on-lambda) is an adapter for running SvelteKit on AWS Lambda. It supports deployment to Node.js and Bun runtimes bundled with esbuild/Bun
- [voca](https://github.com/treyorr/voca) is a self-hostable, stateless, and fast WebRTC signaling server written in Rust with frontend SDKs
- [@svelte-safe-html/core](https://github.com/patel-vansh/svelte-safe-html-core) statically analyzes `.svelte` files and detects unsafe `{@html}` insertions
- [sveltekit-discriminated-fields](https://www.npmjs.com/package/sveltekit-discriminated-fields) provides type-safe discriminated union support for SvelteKit remote function form fields
- [svelte-fast-check](https://github.com/astralhpi/svelte-fast-check) is a type and Svelte compiler warning checker for Svelte/SvelteKit projects that claims to be up to 24x faster than the built-in svelte-check

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
