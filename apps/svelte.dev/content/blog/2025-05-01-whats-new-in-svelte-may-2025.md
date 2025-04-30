---
title: "What's new in Svelte: May 2025"
description: 'Svelte Summit soon! Plus, await in components'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Only a week until [Svelte Summit Spring 2025](https://www.sveltesummit.com/)! If you can't make it in-person to Barcelona, you can purchase a virtual ticket [here](https://www.sveltesummit.com/virtual-ticket).

But before that, we've got a few updates to highlight...

## What's new in Svelte and SvelteKit

The Svelte maintainers have been hard at work building out [Asynchronous Svelte](https://github.com/sveltejs/svelte/discussions/15845) this month, but still found the time to ship some helpful features. If you're interested in trying out the async branch, or just want to follow along with the development, check out [feat: allow await in components #15844](https://github.com/sveltejs/svelte/pull/15844)

- Certain expressions will now be partially evaluated to improve runtime performance (**svelte@5.27.0/5.28.0**, [#15494](https://github.com/sveltejs/svelte/pull/15494)/[#15781](https://github.com/sveltejs/svelte/pull/15781))
- The Svelte CLI (`sv`) has added a `--install <package-manager>` flag to `create` and `add` to specify which package manager to use when running (**cli@0.8.1**, [#531](https://github.com/sveltejs/cli/pull/531))
- The two separate CloudFlare adapters have been merged into one: `adapter-cloudflare` (**adapter-cloudflare@7.0.0**, [#13634](https://github.com/sveltejs/kit/pull/13634))
- `adapter-vercel` will now create symlink functions for each route, for better observability (**adapter-vercel@5.7.0**, [#13679](https://github.com/sveltejs/kit/pull/13679))

There were a number of fixes in SvelteKit too - including an improvement to the `HandleServerError` hook to give it access to `getRequestEvent`! ([#13666](https://github.com/sveltejs/kit/pull/13666))

For a full list of bug fixes in Svelte, SvelteKit and its adapters, check out their CHANGELOGs [here](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) and [here](https://github.com/sveltejs/kit/tree/main/packages). Interested in all the new fixes in language tools? You can find them [here](https://github.com/sveltejs/language-tools/releases).

---

## Community Showcase

### Apps & Sites built with Svelte

- [TableSlayer](https://github.com/siege-perilous/tableslayer) is an open source software for managing in person RPG games with digital displays (check out the video demo on [Reddit](https://www.reddit.com/r/sveltejs/comments/1jnco5h/built_with_svelte_my_open_source_software_for/))
- [Iconia](https://iconia.dev/) is a free tool that understands natural language and responds with relevant icons from famous icon libraries
- [CMSDocs](https://cmsdocs.com/) transforms your Google Docs into Blog CMS
- [Svelte Changelog v2](https://svelte-changelog.dev/) is out now and is a reimagined way of staying up to date on all the new changes in the Svelte ecosystem
- [Hookah UI](https://github.com/AdamShannag/hookah-ui) is a visual configuration builder for the Hookah project
- [mockiapi](https://github.com/sfeSantos/mockiapi) is a mock API server that allows you to define endpoints, return custom JSON responses, and simulate real-world API behavior
- [soarSQL](https://soarsql.com/) is an SQL editor made for analytical processing on Postgres, MySQL, and CSVs - powered by duckDB
- [Persona Simulator](https://personasim.fow.sh/) helps you practice your communication skills by chatting with different personas
- [Typo](https://typo.robino.dev/) is a web-based markdown editor with formatting in codeblocks and typescript execution
- [FernOS](https://github.com/mrtechtroid/fernos) is a lightweight operating system running inside your browser

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [SvelteKit is the best way to build single page apps - and it just got even better!](https://www.youtube.com/watch?v=vCMTxL1jWbw) by Stanislav Khromov (Video)
- [Svelte London - April 2025](https://www.youtube.com/watch?v=7m6HExTKAqM)
  - Building cross-platform browser extensions with Svelte by Oliver Turner ([10:52](https://www.youtube.com/live/7m6HExTKAqM?si=tWUKbSm2IuhO0N_r&t=652))
  - Kioko: Coding CAD by Armel de Montgros and Soloman Azizi ([43:00](https://www.youtube.com/live/7m6HExTKAqM?si=EOmS3Hy-AwIgrBTU&t=2613))

_This Week in Svelte_

- [Ep. 100](https://www.youtube.com/watch?v=BGNykPO4L7c) — Q&A with Rich Harris
- [Ep. 101](https://www.youtube.com/watch?v=yp4330KsYcU) — Changelog

_To Read_

- Graphite - an open source 2D procedural graphics editor built with Svelte - has released a [product update blog post](https://graphite.rs/blog/graphite-progress-report-q4-2024/)
- [Cloudflare Workers & SvelteKit: BetterAuth, Custom Domain, Google OAuth, OTP & Email - Securing Your Application](https://jilles.me/cloudflare-workers-sveltekit-betterauth-custom-domain-google-oauth-otp-email-securing-your-application/) by Jilles Soeters
- [Building a Real-time Dashboard with Flask and Svelte](https://testdriven.io/blog/flask-svelte/) by Amir Tadrisi
- [Copying Nuxt's useState in Qwik and Svelte](https://dev.to/jdgamble555/copying-nuxts-usestate-in-qwik-and-svelte-5eo3) by Jonathan Gamble

### Libraries, Tools & Components

- [diaper](https://github.com/devantic/diaper) is an advanced bottom sheet component for Svelte 5
- [mcp-svelte-docs](https://github.com/spences10/mcp-svelte-docs) is an MCP server that lets you search and access Svelte documentation with built-in caching
- [Version 4 of Anime.js](https://animejs.com/) - a popular JS animation library - has been released
- [DeepWiki](https://deepwiki.com/sveltejs/svelte) has created a comprehensive introduction to the Svelte framework repository
- [Vite Static Assets Plugin](https://www.npmjs.com/package/vite-static-assets-plugin) is a Vite plugin that automatically scans your static assets directory, generates a type-safe TypeScript module with all asset paths to help during build or development time
- [Mode Watcher v1](https://github.com/svecosystem/mode-watcher) provides simple light/dark mode management, now rewritten with first-class Svelte 5 support

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
