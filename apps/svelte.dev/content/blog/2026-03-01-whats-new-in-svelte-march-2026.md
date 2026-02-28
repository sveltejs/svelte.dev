---
title: "What's new in Svelte: March 2026"
description: 'createContext in programmatic Svelte, comments in HTML tags and the State of JS'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

This month, we got a ton of new features across Svelte, SvelteKit and even the Svelte CLI. Plus, the [State of JS 2025](https://2025.stateofjs.com/en-US) is out and Svelte continues to hold the top spot among reactive frameworks.

So, without further ado, let's dive in!

## What's new in Svelte

- `createContext` can now be used when instantiating components programmatically (**svelte@5.50.0**, [Docs](https://svelte.dev/docs/svelte/context#Type-safe-context), [#17575](https://github.com/sveltejs/svelte/pull/17575))
- `{@html}` expressions now support `TrustedHTML` (**svelte@5.52.0**, [#17701](https://github.com/sveltejs/svelte/pull/17701))
- Comments are now allowed in HTML tags (**svelte@5.53.0/svelte-language-server@0.17.28**, [#17671](https://github.com/sveltejs/svelte/pull/17671))
- Error boundaries now work on the server (**svelte@5.53.0**, [Docs](https://svelte.dev/docs/svelte/svelte-boundary#Using-transformError), [#17672](https://github.com/sveltejs/svelte/pull/17672))

For a full list of changes - including all the important bugfixes that went into the releases this month - check out the Svelte compiler's [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md)

## What's new in SvelteKit

- `hydratable`'s injected script now works with CSP (**kit@2.51.0**, [#15048](https://github.com/sveltejs/kit/pull/15048))
- Navigation callbacks (beforeNavigate, onNavigate, and afterNavigate) now include scroll position information via the scroll property on from and to targets. This enables use cases like animating transitions based on the target scroll position when using browser back/forward navigation (**kit@2.51.0**, [Docs](https://svelte.dev/docs/kit/@sveltejs-kit#NavigationTarget), [#15248](https://github.com/sveltejs/kit/pull/15248))
- Vite 8 is now supported (**kit@2.53.0**, [#15024](https://github.com/sveltejs/kit/pull/15024))
- The `match` function can map a path back to a route id and params (**kit@2.52.0**, [Docs](https://svelte.dev/docs/kit/$app-paths#match), [#14997](https://github.com/sveltejs/kit/pull/14997))
- Breaking (Netlify Adapter): `platform.context` now uses modern Netlify Functions - previously this was the AWS Lambda-style
  context. If you were using this in your app (unlikely), you will need to update your code to read from new fields. (**adapter-netlify@6.0.0**, [More details](https://docs.netlify.com/build/functions/api/#netlify-specific-context-object), [Docs](https://developers.netlify.com/guides/migrating-to-the-modern-netlify-functions/), [#15241](https://github.com/sveltejs/kit/pull/15241))
- redirects can now be configured in `netlify.toml` - removing the limitation of only being able to configure redirects via the `_redirects` file (**adapter-netlify@6.0.0**, [#15203](https://github.com/sveltejs/kit/pull/15203))
- `better-auth` is now an official addon in the Svelte CLI (**sv@0.12.0**, [#898](https://github.com/sveltejs/cli/pull/898))

Looking for more details on the many bug fixes and performance optimizations from this month? Check out the SvelteKit / Adapter [CHANGELOGs](https://github.com/sveltejs/kit/tree/main/packages).

---

## Community Showcase

### Apps & Sites built with Svelte

- [Cherit](https://keshav.is-a.dev/Cherit/) is a lightning-fast, open-source markdown knowledge base built with Tauri
- [arenarium/maps](https://arenarium.dev/) is a clearer way to display complex map markers in MapLibre, Mapbox or Google Maps
- [Synth Town](https://synth.town/) is a generative music city builder using Threlte + Tone.js
- [Beatjie](https://dindles.net/beatjie/) is a little audio groovebox that lets you make beats and share them with a URL ([GitHub](https://github.com/dindles/beatjie/))
- [Mistral AI's Worldwide Hackathon](https://worldwide-hackathon.mistral.ai/) site was built with Svelte ([Reddit](https://www.reddit.com/r/sveltejs/comments/1r25ezg/just_launched_our_first_svelte_project_at_mistral/))
- [Fretwise](https://fretwise.ai/) is an AI-Powered guitar practice platform that generates tabs and isolated stems
- [Tailsync](https://apps.apple.com/us/app/tailsync/id6758315448) is a reverb calculator for music production for iOS
- [Otterly](https://github.com/ajkdrag/otterly) is a local-first, privacy-focused WYSIWYG Markdown vault with full-text search, wiki-links, and a rich editor
- [SoundTime](https://github.com/CICCADA-CORP/SoundTime) is a self-hosted music streaming platform with peer-to-peer sharing using Rust & Svelte
- [ATS Screener](https://ats-screener.vercel.app/) lets you see how popular applicant tracking systems parse, filter, and score your resume
- [Heavy Duty Inc.](https://heavydutyinc.itch.io/heavy-duty-inc) is a turn-based tactics game built with Threlte where you solve jobs for the different space station factions, navigate their strained political environment, die, and do it all over again
- [Quest Mate](https://quest-mate.com/) is a universal GM space for all your campaigns, lore, sheets, notes and summaries
- [cold0](https://github.com/danesto/cold0) is a self-hosted cold email sender that lets you manage contact lists, create email templates with dynamic variables, and send personalized bulk emails
- [HelixNotes](https://codeberg.org/ArkHost/HelixNotes) is a local markdown note-taking app where notes are stored as standard Markdown files on your local filesystem
- [Codeinput](https://codeinput.com/) lets you handle merge conflicts without leaving your browser, merge faster with an intelligent queue, automate repository tasks, view live engineering metrics, and manage advanced CODEOWNERS

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Why I choose Svelte](https://mainmatter.com/blog/2026/02/24/why-choose-svelte/) and [Truly Native Apps with Svelte?](https://mainmatter.com/blog/2025/05/22/native-apps-with-svelte/) by Paolo Ricciuti

_This Week in Svelte_

- [Ep. 129](https://www.youtube.com/watch?v=LmCd6nbID_Y) — Changelog
- [Ep. 130](https://www.youtube.com/watch?v=Q0-AglM1J7A) — Changelog
- [Ep. 131](https://www.youtube.com/watch?v=8DkAiCbY9mE) — Changelog

### Libraries, Tools & Components

- [Laravel + Svelte Starter Kit](https://github.com/laravel/svelte-starter-kit) is an official kit from Laravel that provides a robust, modern starting point for building Laravel applications with a Svelte frontend using Inertia.
- [Shimmer From Structure](https://github.com/darula-hpp/shimmer-from-structure) is a structure-aware skeleton loader that mirrors your rendered UI at runtime
- [Hoikka](https://github.com/mhernesniemi/hoikka) is an opinionated, full-stack e-commerce platform built with SvelteKit
- [warpkit](https://github.com/upstat-io/warpkit) is a standalone Svelte 5 SPA framework providing state-based routing, data fetching, forms, and real-time capabilities.
- [heroicons-animated](https://svelte.heroicons-animated.com/) is an open-source collection of smooth animated 316 icons for your projects
- [svelte-crumbs](https://github.com/torrfura/svelte-crumbs) provides automatic, SSR-ready breadcrumbs for SvelteKit via route-level metadata exports
- [TableCraft Engine](https://jacksonkasi.gitbook.io/tablecraft) simplifies database interactions by allowing you to define table configurations and automatically generate powerful APIs with filtering, sorting, pagination, and more
- [svelte-synk](https://github.com/RussBaz/svelte-synk) provides tab data synchronisation with leader election
- [svelte-tiler](https://github.com/x0k/svelte-tiler) is a small, unstyled library for building tiling user interfaces
- [@horuse/svelte-dnd](https://github.com/Horuse/svelte-dnd) is a drag-and-drop library for Svelte 5 with animated drop previews, auto-scroll, pointer & touch support , and multi-container support.
- [svelte-grab](https://github.com/HeiCg/svelte-grab) is a dev tool suite that captures component context for LLM coding agents. Alt+Click any element to get exact file locations, inspect state, analyze styles, audit accessibility, trace errors, and profile renders

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
