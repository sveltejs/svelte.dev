---
title: "What's new in Svelte: August 2025"
description: 'Async Svelte is out - with all the fixins'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

With [Async Svelte](https://github.com/sveltejs/svelte/discussions/15845) and its companion [Remote Functions](https://github.com/sveltejs/kit/discussions/13897) officially out in the world, there's a lot of updates to share!

Be sure to check out the showcase for videos from Rich, Paolo, and Stanislav about all the brand new features in Svelte.

Let's dive into the highlights...

## What's new in Svelte, SvelteKit, Language Tools and CLI (sv)

- Remote functions can be called anywhere in your app, but always run on the server, and as such can safely access server-only modules containing things like environment variables and database clients (**kit@2.27.0**, [Docs](https://svelte.dev/docs/kit/remote-functions), [#13986](https://github.com/sveltejs/kit/pull/13986))
- `getAbortSignal` returns an `AbortSignal` that aborts when the current derived or effect re-runs or is destroyed (**svelte@5.35.0**, [Docs](https://svelte.dev/docs/svelte/svelte#getAbortSignal), [#16266](https://github.com/sveltejs/svelte/pull/16266))
- A new `parent` property has been added to the `__svelte_meta` properties that are added to elements at dev time - useful for debugging nested hierarchies (**svelte@5.35.1**, [#16255](https://github.com/sveltejs/svelte/pull/16255))
- `await` is now supported in components when using the `experimental.async` compiler option (**svelte@5.36.0/extensions@109.10.0**, [Docs](https://svelte.dev/docs/svelte/await-expressions), [#15844](https://github.com/sveltejs/svelte/pull/15844))
- There are now types for the `params` prop and `page` attributes in page/layout components (**kit@2.24.0, kit@2.26.0 & extensions@109.10.0**, [#13999](https://github.com/sveltejs/kit/pull/13999) / [#13864](https://github.com/sveltejs/kit/pull/13864))
- SvelteKit's `read` now works in edge environments where `fs.readFile` isn't available such as in Cloudflare's workers, Netlify, and Vercel's edge functions (**kit@2.25.0**, [#13859](https://github.com/sveltejs/kit/pull/13859))
- The `resolve(...)` and `asset(...)` helpers have been added for resolving paths (**kit@2.26.0**, [#13864](https://github.com/sveltejs/kit/pull/13864))
- Support for modern SvelteKit prop typings has been added to VS Code snippets (**extensions-109.10.0**, [#2796](https://github.com/sveltejs/language-tools/pull/2796))
- The new `vite.addPlugin` simplifies adding a plugin on various vite config styles (**sv@0.8.20**, [#633](https://github.com/sveltejs/cli/pull/633))
- vite-plugin-svelte is out with support for vite7, rolldown-vite and [more](https://github.com/sveltejs/vite-plugin-svelte/blob/main/packages/vite-plugin-svelte/CHANGELOG.md)

For a full list of bug fixes in Svelte, SvelteKit and its adapters, check out their CHANGELOGs [here](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) and [here](https://github.com/sveltejs/kit/tree/main/packages).

---

## Community Showcase

### Apps & Sites built with Svelte

- [Logitech's new site](https://www.reddit.com/r/sveltejs/comments/1m991ts/the_logitech_site_is_built_with_svelte/) is built in Svelte 🎉
- [hend.world](https://hend.world/) is a language learning application that surrounds you with comprehensible input: compelling stories, articles, and videos that match your level
- [Amgiflol](https://github.com/sm17p/amgiflol) is a Figma-like Layout Inspector For Web
- [Formcord](https://formcord.app/) is a Google Forms alternative built specifically for Discord communities
- [Freq](https://www.freq.social/) is a community-based social media platform for groups of music listeners to share, talk about, and enjoy music together
- [Salora](https://salora.app/) is a salon booking application (de)
- [Animal Well Shrine](https://anxpara.com/animalwellshrine) is an low-spoiler egg tracker for the video game, Animal Well
- [TypingGym](https://www.typinggym.com/) is a typing practice site with automatic difficulty adjustment

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [promise.then(...)](https://www.youtube.com/watch?v=e-1pVKUWlOQ) by Rich Harris - what's next now that Svelte is Async
- [Asynchronous Svelte](https://www.youtube.com/live/kL4Tp8RmJwo) with Rich Harris by CodeTV (Jason Lengstorf)
- [Remote Functions are coming to SvelteKit - and they are amazing!](https://www.youtube.com/watch?v=BID8r5LObvI) by Code with Stanislav
- [Svelte London - June 2025](https://www.youtube.com/watch?v=LKSmlp2S-jQ) feat. "Svelte, svelte everywhere" by Paolo Ricciuti and "Testing your Svelte app in an actual browser" by Willow / Scott

_This Week in Svelte_

- [Ep. 108](https://www.youtube.com/watch?v=Sp4Y1tMo5AQ) — Svelte Flow
- [Ep. 109](https://www.youtube.com/watch?v=LghoZmFzWYM) — Ark UI
- [Ep. 110](https://www.youtube.com/watch?v=Ia8N6S2OkpM) — Neodrag v3
- [Ep. 111](https://www.youtube.com/watch?v=fExlOwTtZqM) — Best LLMs for Svelte 5 tested, MCP server, llms.txt

_Svienna (Svelte Society Vienna)_

- [Lightning talk 10 tips in 5 mins!](https://www.youtube.com/watch?v=hptgxIdnDdg) by Jean Yves Couet
- [Using SvelteKit and MIT appinventor to inspire young girls for tech](https://www.youtube.com/watch?v=pDx1a078in8) by Domenik Reitzner
- [Adding full to your full stack SvelteKit app](https://www.youtube.com/watch?v=A3cqzv-zRe8) by Jean Yves Couet
- [ZeeltePHP (Svelte + PHP)](https://www.youtube.com/watch?v=0sm4oPwvPVU) by derharry
- [Svelte at Geizhals](https://www.youtube.com/watch?v=aJVdfPk9WmI) by Martin Grubinger

_To Watch/Read_

- [Build a SvelteKit Admin App with Drizzle, Tailwind & Postgres](https://www.youtube.com/watch?v=H3Mk6ozq69U) by Tyler Codes
- [Master Svelte in 15 Minutes: From React Dev to Svelte Pro](https://www.youtube.com/watch?v=Vhfcgnt5nO8) by Neuronfire
- [Simple but Effective Skeleton Loaders](https://www.matsimon.dev/blog/simple-skeleton-loaders) by Mat Simon
- [Building Smart Intervals with Svelte 5](https://www.puruvj.dev/blog/svelte-5-interval-rune) by Puru VJ

### Libraries, Tools & Components

- [Svelte Interval](https://github.com/PuruVJ/svelte-interval) is a comprehensive Svelte utility package for managing intervals with reactive durations, synchronization, and advanced control features
- [@hvniel/svelte-router](https://github.com/HanielU/svelte-router) is a Svelte 5 port of React Router
- [@hvniel/vite-plugin-svelte-inline-component](https://github.com/hanielu/vite-plugin-svelte-inline-component) lets you write tiny Svelte components straight inside your JavaScript / TypeScript tests using tagged‑template literals
- [wuchale](https://github.com/wuchalejs/wuchale) is a non-invasive, normal code based compile-time internationalization (i18n) toolkit
- [SSGOI](https://github.com/meursyphus/ssgoi) brings native app-like page transitions to the web
- [Svelte Form Builder](https://github.com/moalamri/svelte-form-builder) is a modern, drag-and-drop form builder built with Svelte 5
- [Svelte persistent runes](https://github.com/MacFJA/svelte-persistent-runes?tab=readme-ov-file#svelte-persistent-runes) provides a Svelte reactive rune that keep its value through pages and reloads
- [gositemap](https://github.com/lelabdev/gositemap) is a fast, test-driven sitemap.xml generator for static SvelteKit sites

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
