---
title: "What's new in Svelte: March 2025"
description: 'Congrats to the SvelteHack winners! Plus improved SSR in Svelte and SvelteKit'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

[SvelteHack 2024](https://hack.sveltesociety.dev/2024) has ended and the winners were announced on February 9th. Congrats to all the [winners](https://hack.sveltesociety.dev/2024/winners) who you'll also find listed in the "Community Showcase" below.

But before we dive into that, let's get to some updates!

## What's new in Svelte and SvelteKit

- Native support for Websockets in SvelteKit is now available for testing! You can install the version of SvelteKit from the PR using pkg.pr.new and the PR number ([How To Install](https://github.com/sveltejs/kit/issues/1491#issuecomment-2645962690), [PR/Docs](https://github.com/sveltejs/kit/pull/12973))
- `$props.id()` provides SSR-safe ID generation - unique for each instance of a component (**Svelte@5.20.0**, [Docs](</docs/svelte/$props#$props.id()>), [#15185](https://github.com/sveltejs/svelte/pull/15185))
- SvelteKit now supports an option for server-side route resolution. This means that instead of loading the whole routing manifest in the client, and doing the route resolution there, the server runtime is invoked for each route request (**Kit@2.17.0**, [docs](/docs/kit/configuration#router), [pull request](https://github.com/sveltejs/kit/pull/13379))
- The values for `cache-control` and `content-type` headers are now validated in dev mode to help catch invalid values early (**2.17.0**, [#13114](https://github.com/sveltejs/kit/pull/13114))

For a full list of bug fixes in Svelte, SvelteKit and its adapters, check out their CHANGELOGs [here](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) and [here](https://github.com/sveltejs/kit/tree/main/packages).

---

## Community Showcase

### Apps & Sites built with Svelte

- [Faviconizer](https://www.faviconizer.com/) is a simple, functional favicon (.ico) converter made with SvelteKit
- [stocknear](https://github.com/stocknear) is an open source stock analysis & community platform (congrats on [2 years of development](https://www.reddit.com/r/sveltejs/comments/1iupfxb/from_learning_web_dev_to_building_my_saas_hit/)!)
- [Workouts](https://www.reddit.com/r/sveltejs/comments/1in1t0n/self_promotion_svelte_tauri_mobile_app_for/) is a simple and private app for tracking your strength training workouts
- [Perplexity Fast Chat](https://github.com/Ayfri/Deep-Research) is a modern web interface to interact with Perplexity AI and OpenAI models, featuring a unique deep research mode
- [exiftool-web](https://github.com/lucasgelfond/exiftool-web) is an exif data inspector tool, in the browser (via WebAssembly!)
- [Weekend Scanner](https://weekendscanner.com/) helps you find long weekends by combining your weekends and holidays
- [Linklink](https://linklink.ink/) is a link management tool for organising and sharing links
- [Multiplayer Globe App](https://github.com/lilnasy/multiplayer-globe) displays website visitor locations in real-time using Astro, Cloudflare and Redis
- [Mathesar](https://github.com/mathesar-foundation/mathesar) is an intuitive spreadsheet-like interface that lets users of all technical skill levels view, edit, query, and collaborate on Postgres data directly
- [Squash](https://image-squash.web.app/) lets you compress and convert your images to AVIF, JPEG, JPEG XL, PNG, or WebP
- [Segment Anything 2 in WebGPU](https://github.com/lucasgelfond/webgpu-sam2) is a WebGPU implementation of Facebook Research's model

_Svelte Hack Wizzbangery Wizard Winners_

1. [kunkun](https://github.com/kunkunsh/kunkun) is an open source, cross-platform, extensible app launcher (like Raycast) - it's also the winner of SvelteHack 2024 🏆
2. [Infinite Turtles](https://github.com/edsunman/infinite-turtles) is a card game made with Threlte
3. [Svudoku](https://github.com/fodor-lori/svudoku) is a modern-looking Sudoku application that lets you enjoy solving both Classic and Killer Sudoku puzzles
4. [Svelte Space](https://github.com/baterson/svelte-tower-defence) is a TowerDefence clicker game made with Svelte 5, without canvas. Playable on different screens, Mobile or Desktop.
5. [Haunted house](https://github.com/martaProsniak/haunted-house) is an old-school arcade game where you explore a haunted mansion full of ghosts. Control plasma bullets, use your wits and clear the whole house! Created only with Svelte 5.

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Svelte Hack 2024 Winners Announcement Livestream](https://www.youtube.com/live/NwRJvFX-lOk?si=kGLb_09XSitwdaqk) featuring GHOST, Paulo and Dominik
- [20 Svelte Features You Missed During Advent Of Svelte](https://www.youtube.com/watch?v=SJiE4tu39EQ) by Joy of Code
- [Use any JavaScript or TypeScript Library in Svelte 5 (The Right Way)](https://www.youtube.com/watch?v=R82Ptutku0M) by Stanislav Khromov
- [Svelte London - February 2025](https://www.youtube.com/watch?v=s79E0Q9f2YM)

_This Week in Svelte_

- [Ep. 92](https://www.youtube.com/watch?v=UHBekhrnKVs) — Changelog and Showcase
- [Ep. 93](https://www.youtube.com/watch?v=-VV-2FyBnng) — Changelog, dynamic layouts with snippets
- [Ep. 94](https://www.youtube.com/watch?v=Qo57-7JmUaw) — Go + Svelte as a hybrid SPA/MPA application
- [Ep. 95](https://www.youtube.com/watch?v=9ypawEnb12U) — Changelog

_To Watch_

- [GitHub Copilot: the agent awakens](https://www.youtube.com/watch?v=C95drFKy4ss) uses SvelteKit as their example project 🙌🏼
- [Full Stack E-Commerce + Dashboard: Svelte 5, Cloudflare, Tailwind, Drizzle, Sqlite, 2025](https://www.youtube.com/watch?v=lwbNPEPt0E8) by Lawal Adebola

_To Read_

- [How to Protect Your SvelteKit Routes](https://blog.yuki-dev.com/blogs/x2lxp2szm) by Yuki Ishii
- [Sharing Runes in Svelte 5 with the Rune Class](https://dev.to/jdgamble555/sharing-runes-in-svelte-5-the-rune-class-505e) by Jonathan Gamble
- [Mixed Signals with Svelte 5](https://blog.fullmeasure.uk/2025/01/07/mixed-signals-with-svelte5/) from the FullMeasure Blog
- [Did Svelte 5 Get Runed with Complexity?](https://steve-sob.medium.com/did-svelte-5-get-runed-with-complexity-cbeda34b9feb) by sobPilot
- [Background Jobs in SvelteKit with BullMQ](https://dev.to/ranjanpurbey/background-jobs-in-sveltekit-with-bullmq-4dn3) by Ranjan Purbey

### Libraries, Tools & Components

- [Svelte Form Builder](https://svelte-form-builder.vercel.app/) helps you create forms with Shadcn-Svelte, Superforms and schema within minutes
- [shadcn-svelte-enhancements](https://github.com/tzezar/shadcn-svelte-enhancements) is a collection of additional components designed specifically for Shadcn-Svelte
- [lomer-ui](https://ui.lomer.dev/) provides standalone components for Svelte powered by Tailwind CSS
- [Vite Plugin Svelte Anywhere](https://github.com/vidschofelix/vite-plugin-svelte-anywhere) empowers developers to define reusable custom elements directly within their Svelte components
- [Svelte 5 + SvelteKit Sage](https://chatgpt.com/g/g-Knj6VxTpl-svelte-5-sveltekit-sage) is a custom GPT to get the best answers out of ChatGPT
- [ModalFileManager](https://github.com/raguay/ModalFileManager/releases/tag/v2.0.0) and [PersonalKanban](https://github.com/raguay/PersonKanban/releases/tag/v0.5) have been updated to work with Svelte 5 (and fix a large number of bugs)
- [components-pack](https://github.com/Matb85/components-pack) provides photos-related UI components for Svelte 5, Vue 3, Astro 5 and vanilla JS

_Svelte Hack Rune Ritualist Winners_

1. [SyncroState](https://github.com/beynar/syncrostate) brings Svelte 5 reactivity DX to the multiplayer level. Built on top of Yjs, it's a typesafe, efficient and dead simple way to manage multiplayer state. It is just like a normal $state but synchronised in realtime.
2. [Twoslash Svelte](https://github.com/twoslashes/twoslash/pull/57) is an extension of `twoslashes/twoslash` which supports Svelte. This will be beneficial for adding type hints to code blocks on any documentation website targeting Svelte.
3. [svisx](https://github.com/xGEMINIx/svisx) is a port of Airbnb's visx to Svelte, bringing the power of D3 visualizations to the Svelte ecosystem.
4. [Svelte Value Inspect](https://github.com/ampled/svelte-inspect-value) is a "json tree"-like inspector inspired by the likes of react-json-view, and svelte-json-tree.
5. [Flexiboards](https://github.com/Blakintosh/svelte-flexiboards) provides headless, reactive drag and drop components for Svelte 5.

_Svelte Hack Migration Magician Winners_

1. [Svelte MapLibre GL](https://github.com/MIERUNE/svelte-maplibre-gl) lets you build interactive web maps effortlessly with MapLibre GL JS and Svelte 5.
2. [svelte-ux](https://github.com/techniq/svelte-ux/pull/530) is a collection of Svelte components, actions, stores, and utilities to build highly interactive applications.
3. [rokkit](https://github.com/jerrythomas/rokkit/tree/develop) is a data-driven, configurable, and themeable UI library built for use with Svelte. Rokkit controls are designed to be easily themeable, so you can match the look and feel of your project with minimal effort.
4. [Svelte MiniApps](https://github.com/Michael-Obele/Svelte-MiniApps) is a collection of user-friendly tools rebuilt with Svelte 5 for enhanced speed and reliability
5. [Roguelighter Engine](https://github.com/roguelighterengine/roguelighter) is a free, open-source, easy-to-use game engine for 2D game development.

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
