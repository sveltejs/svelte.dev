---
title: "What's new in Svelte: January 2025"
description: 'Svelte 5 just keeps getting better. Plus, an in-person Svelte Summit!'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

From new syntax to improved dev tooling, the Svelte team has been busy this month building new features in both Svelte and SvelteKit. And as we round the corner into the new year, there's even more to look forward to... like the _10th Svelte Summit_! [Join the Svelte community](https://www.sveltesummit.com/) online or in-person in Barcelona: May 8th and 9th.

Now let's get to the news 👀

## What's new in Svelte

- Snippets can now be exported from module scripts (**5.5.0**, [Docs](/docs/svelte/snippet#Exporting-snippets), [#14315](https://github.com/sveltejs/svelte/pull/14315))
- `defaultValue` and `defaultChecked` are now supported for inputs (**5.6.0**, [Docs](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/defaultChecked), [#14289](https://github.com/sveltejs/svelte/pull/14289))
- The loose parser mode creates a more modern AST for developer tools to consume (**5.13.0**, [Docs](/docs/svelte/svelte-compiler#parse), [#14691](https://github.com/sveltejs/svelte/pull/14691))
- A new "worker" exports condition helps better support bundling for worker-based environments (**5.15.0**, [#14779](https://github.com/sveltejs/svelte/pull/14779))
- The `class` attribute can now be an object or array, using `clsx` (**5.16.0**, [Docs](https://svelte.dev/docs/svelte/class#Attributes-Objects-and-arrays), [#14714](https://github.com/sveltejs/svelte/pull/14714))

_New/Updated Syntax_

- `<svelte:boundary>` is a new special element that can capture errors that occur from within its subtree during client rendering (**5.3.0**, [Docs](/docs/svelte/svelte-boundary), [#14211](https://github.com/sveltejs/svelte/pull/14211))
- #each is now supported without `as` (**5.4.0**, [Docs](/docs/svelte/each), [#14396](https://github.com/sveltejs/svelte/pull/14396))
- The new `Spring` and `Tween` classes in `svelte/motion` make it even easier to build custom animation (**5.8.0**, [Docs](/docs/svelte/svelte-motion), [#11519](https://github.com/sveltejs/svelte/pull/11519))
- The new `outro` option in `unmount` will play transitions before the component is removed from the DOM. (**5.13.0**, [Docs](/docs/svelte/svelte#unmount), [#14540](https://github.com/sveltejs/svelte/pull/14540))
- The `$inspect.trace` rune causes the surrounding function to be traced in development. Any time the function re-runs as part of an effect or a derived, information will be printed to the console about which pieces of reactive state caused the effect to fire (**5.14.0**, [Docs](</docs/svelte/$inspect#$inspect.trace()>), [#14290](https://github.com/sveltejs/svelte/pull/14290))

_Reactivity APIs_

- `createSubscriber` creates reactive values that depend on subscriptions (**5.7.0**, [Docs](/docs/svelte/svelte-reactivity#createSubscriber), [#14422](https://github.com/sveltejs/svelte/pull/14422))
- The reactive `MediaQuery` class creates a media query and provides a current property that reflects whether or not it matches (**5.7.0**, [Docs](/docs/svelte/svelte-reactivity#MediaQuery), [#14422](https://github.com/sveltejs/svelte/pull/14422))
- Getters and setters can now be bound to with `bind` (**5.9.0**, [Docs](/docs/svelte/bind), [#14307](https://github.com/sveltejs/svelte/pull/14307))
- The `svelte/reactivity/window` module exports reactive versions of various `window` values, each of which has a reactive current property that you can reference in reactive contexts (**5.11.0**, [Docs](/docs/svelte/svelte-reactivity-window), [#14660](https://github.com/sveltejs/svelte/pull/14660))

## What's new in SvelteKit, Svelte CLI and Language Tools

- The new `init` hook runs once, when the server is created or the app starts in the browser, and is a useful place to do asynchronous work such as initializing a database connection (**2.10.0**, [Docs](/docs/kit/hooks#Shared-hooks-init), [#13103](https://github.com/sveltejs/kit/pull/13103))
- The new [`transport`](https://svelte.dev/docs/kit/@sveltejs-kit#Transport) hook allows you to encode/serialize and decode/deserialize custom non-POJOs across the server/client boundary (**2.11.0**, [#13149](https://github.com/sveltejs/kit/pull/13149))
- The new `$app/state` module replaces the existing `$app/stores` module but using Svelte 5 state. The `migrate` tool in the CLI/language tools have been updated to match (**2.12.0**, [Docs](/docs/kit/$app-state), [#13140](https://github.com/sveltejs/kit/pull/13140))
- `bundleStrategy` lets you choose between `'split'`, `'single'` and `'inline'` output options for JS and CSS files (**2.13.0** and **2.15.0**, [Docs](/docs/kit/configuration#output), [#13173](https://github.com/sveltejs/kit/pull/13191) and [#13193](https://github.com/sveltejs/kit/pull/13193))
- The new `sveltekit-adapter` add-on for the Svelte CLI (`sv`) installs and replaces existing SvelteKit adapters ([Docs](/docs/cli/sv-add), [#346](https://github.com/sveltejs/cli/pull/346))
- The language tools extensions will now make use of loose Svelte parser and provide better intellisense (**109.4.0**, [#2631](https://github.com/sveltejs/language-tools/pull/2631))

_Adapter Updates_

- `adapter-auto` has added support for the bun language server (**3.3.0**, [#12854](https://github.com/sveltejs/kit/pull/12854))
- `adapter-cloudflare-workers` now supports `wrangler.json` config files (**2.7.0**, [#13151](https://github.com/sveltejs/kit/pull/13151))
- `adapter-cloudflare` will now generate an `.assetsignore` file for use with Cloudflare Workers Static Assets (**4.9.0**, [#13109](https://github.com/sveltejs/kit/pull/13109))

---

## Community Showcase

### Apps & Sites built with Svelte

- [Tokeko](https://tokeko.specy.app/) is an educational platform designed to help users understand and learn about different types of parsers, grammar structures, and parsing techniques
- [QuickFlags](https://flags.isaxk.com/) is a fast paced, simple, flag knowledge game
- [Hotspotter](https://github.com/BastiDood/hotspotter) is an incentivized crowdsensing system that collects, maps, and visualizes WiFi and cellular data to pinpoint hotspots and dead zones for the effective visualization of network coverage
- [Writastic](https://writastic.com/) is an AI social media writing assistant to optimize your content with the best strategies of successful creators
- [Walle](https://www.wallestudio.com/) is a macOS chatbot app that lets you interact with Claude, GPT, and Gemini simultaneously
- [Fli.so](https://fli.so/) is a free, modern open-source link shortener
- [VRDB](https://vrdb.app/) is a comprehensive database for Meta Quest Store, App Lab, and VR games
- [sv-resize-image](https://github.com/ssebastianoo/sv-resize-image) resizes images using just the browser
- [WickGPT](https://github.com/stormyzio/wickgpt) is an online tool to generate fake clips of chatGPT responses
- [other.supply](https://other.supply/) is a virtual vinyl shop that simulates the record-flipping experience

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Svelte at Bloomberg (feat Julian Burgess)](https://www.svelteradio.com/episodes/svelte-at-bloomberg) and [Scott Tolinski on Svelte 5 Local First Development](https://www.svelteradio.com/episodes/scott-tolinski-on-svelte-5-local-first-development) by Svelte Radio
- [Rich Harris' North Star](https://www.youtube.com/watch?v=UegUi2fWBaU) at JSNation US 2024
- [Perfect Svelte 5 code completion for any LLM - Claude, ChatGPT and GitHub Copilot](https://www.youtube.com/watch?v=tprMklFzy44) by Stanislav Khromov
- [Svelte 5 Is Here!](https://www.youtube.com/watch?v=t6-znHs8DDM) and [View Transitions Are More Powerful Than You Think](https://www.youtube.com/watch?v=jnYjIDKyKHw) by Syntax

_This Week in Svelte_

- [Ep. 86](https://www.youtube.com/watch?v=VTFAFqd51Fg) — Tabs component
- [Ep. 87](https://www.youtube.com/watch?v=TIaUCw4wKio) — GPU rendered components with svader
- [Ep. 88](https://www.youtube.com/watch?v=jFyMMu44t-s) — Live coding local storage

_To Read_

- [Building accessible sites with SvelteKit: seven practical tips](https://blog.datawrapper.de/sveltekit-accessibility-tips/) by Antonio Sarcevic
- [How to Fix Unexpected Logout Issues in SvelteKit Caused by data-sveltekit-preload-data](https://blog.yuki-dev.com/blogs/d2_e1zwgn3_o) by Yuki Ishii
- [Svelte Job's Svelte Salaries Report](https://sveltejobs.com/svelte-salaries) shows average and median salaries across remote, non-remote positions, locations, and seniority levels

_To Watch_

- [Build & Launch a Svelte Website in Just 15 Minutes!](https://www.youtube.com/watch?v=m9fsj5zXyDY) by NAD LABS
- [The Magic of Svelte](https://www.youtube.com/watch?v=AKZtk0suBTE) by Jürg Hunziker, Vendure Conf 2024

### Libraries, Tools & Components

- [The Svelte docs](https://svelte.dev/content.json) are now available in an LLM-friendly format (shout out to Stanislav Khromov for [svelte-llm](https://svelte-llm.khromov.se/))
- [svelte-mainloop](https://github.com/retrotheft/svelte-mainloop) is awrapper for MainLoop.js that handles function registration and cleanup, and lets you join and leave the loop with a single component ([Reddit](https://www.reddit.com/r/sveltejs/comments/1hfto6y/sveltemainloop_the_easiest_way_to_add_a_loop_to/))
- [bsky-comments-svelte](https://github.com/nsarrazin/bsky-comments-svelte/) is a simple customizable component to add comments to your website using Bluesky
- [Svelte Mini Router](https://github.com/rodrigocfd/svelte-mini-router) is a declarative, minimal SPA router for Svelte 5, without SvelteKit
- [svelte-firebase-state](https://github.com/pierregoutheraud/svelte-firebase-state) simplifies Firebase integration in Svelte/Sveltekit applications by providing easy-to-use reactive state classes for managing Firestore and Realtime Database data
- [monoco-svelte](https://github.com/monokai/monoco-svelte) lets you create custom (squircle) corners and borders for Svelte components
- [svelte-audio-waveform](https://github.com/Catsvilles/svelte-audio-waveform) transforms an array of peak data into beautifully rendered, customizable waveforms for music players, podcasts, audio editing tools, and more
- [Svader](https://github.com/sockmaster27/svader) creates GPU-rendered Svelte components with WebGL and WebGPU fragment shaders

That's it for this huge month in Svelte! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Happy new year! 🥳
