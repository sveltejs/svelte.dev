---
title: "What's new in Svelte: December 2024"
description: 'A better CLI and a bunch of UI libraries now support Svelte 5'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

I can't believe it's already the last newsletter of the year! So much has happened in the Svelte community - from two great Svelte Summits to the release Svelte 5 🎉

As we look forward to the next year and watch the Svelte team do [24 features in 24 days](advent-of-svelte), let's dive into what's new in the past month...

## What's new in Svelte

The bugfix versions in 5.1.x and 5.2.x addressed a bunch of issues reported by the community. So if you're noticing anything weird, make sure you upgrade to the latest version and, as always, check out the [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) for all the bug fixes.

The features since last month can be found below:

- `ContentVisibilityAutoStateChangeEvent` has been added to element definitions (**5.2.5**, [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/ContentVisibilityAutoStateChangeEvent), [#14373](https://github.com/sveltejs/svelte/pull/14373))

## What's new in SvelteKit, Svelte CLI and Language Tools

- `isActionFailure` is a new helper method to check if a variable is an instanceof `ActionFailure` - helpful for debugging parsing of user input (**2.8.0**, [#12878](https://github.com/sveltejs/kit/pull/12878))
- `const load = ...` declarations will now be typed automatically (**svelte2tsx-0.7.23**, [#2540](https://github.com/sveltejs/language-tools/pull/2540))
- The CLI will now include a `jsconfig.json` in the 'no type checking' template (**0.6.2**, [#290](https://github.com/sveltejs/cli/pull/290))
- When installing dependencies, the CLI will display the package manager's output (**0.6.3**, [#305](https://github.com/sveltejs/cli/pull/305))
- A short description will now be shown for each add-on in the CLI menu (**0.6.5**, [#299](https://github.com/sveltejs/cli/pull/299))
- Instance types will now be provided automatically in Svelte 5 (**svelte2tsx-0.7.23**, [#2553](https://github.com/sveltejs/language-tools/pull/2553))
- A code lens indicator for "runes mode" will now appear atop a file when detected - "legacy mode" when not (**language-server-0.17.4**, [#2554](https://github.com/sveltejs/language-tools/pull/2554))

---

## Community Showcase

### Apps & Sites built with Svelte

- [Unsubscribe](https://unsubscribe.jnr.cx/) is an interactive site that makes fun of how hard it is to unsubscribe from things on the internet these days
- [Dealcrane](https://dealcrane.com/?utm_source=discord&utm_medium=social&utm_campaign=beta_promo&utm_content=svelte) helps technology shoppers find discounts across popular internet shopping sites
- [Raw Web](https://rawweb.org/) is a search engine for indexing the content of independent, especially personal, websites
- [Jovian Moon's personal site](https://github.com/StephenGunn/jovian) features an interactive rocket ship to fly you straight to Jupiter (or anywhere else you want to go)
- [Font Preview](https://github.com/songkeys/font-preview) makes it easy to analyze and explore font characters in the browser
- [Dunks & Threes](https://dunksandthrees.com/) is a professional basketball analysis platform that provides data-driven NBA predictions
- [AdresseDuBien](https://adressedubien.com/) is a small utility to find addresses for real estate ads (for France) with a Libre Map implementation
- [PixelAttack](https://jason1610.github.io/PixelAttack/) takes an image, pixelizes it and makes the pixels fight each other
- [NeoHtop](https://github.com/Abdenasser/neohtop) is a modern, process monitoring tool that combines the power of terminal-based system monitors with a clean, desktop-native UI
- [WebVM](https://github.com/leaningtech/webvm) is a Linux virtual machine that runs in your browser
- [Sveltris](/playground/8594eea15c6244908c3efad284fe2aa4?version=5.2.1) is Tetris built entirely in the Svelte REPL

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Svelte 🧡](https://bsky.app/profile/paolo.ricciuti.me/feed/svelte-feed) is a Bluesky feed to keep up to date on Svelte news in that application
- [SvelteKit Streaming: The Complete Guide](https://khromov.se/sveltekit-streaming-the-complete-guide/) by Stanislav Khromov
- [Remote Workshop: Svelte 5 & Runes](https://ti.to/mainmatter/svelte-5-runes-feb-2025) is taking place February 6-7th, 2025 and taught by Paolo Ricciuti
- [Svelte 5: In Action | Build A Tasks App](https://www.youtube.com/watch?v=uSWMvDPpG0k) by Syntax
- [Svelte Society London](https://www.youtube.com/watch?v=mxM208nCvHc) - featuring Paolo with his talk, _Herd your async tasks!_

_This Week in Svelte_

- [Ep. 83](https://www.youtube.com/watch?v=1a-iKUCF5_g) — You might not need an effect
- [Ep. 84](https://www.youtube.com/watch?v=kVbQyKf4Oe4) — manifest.build
- [Ep. 85](https://www.youtube.com/watch?v=yY963ovcDQ0) — @sheepdog/svelte

_To Read_

- [Web software development (2024)](https://fitech101.aalto.fi/web-software-development/) is a self-study course for all things web development and features Svelte heavily
- [Async Fetching in Svelte 5](https://dev.to/jdgamble555/async-fetching-in-svelte-5-826) by Jonathan Gamble
- [Cross-Origin-Isolation with SvelteKit, Vite, and Firebase](https://www.captaincodeman.com/cross-origin-isolation-with-sveltekit-vite-and-firebase) by Captain Codeman
- [The $effect.tracking rune](https://www.matsimon.dev/blog/svelte-in-depth-effect-tracking) by Matt Simon

### Libraries, Tools & Components

_Component Libraries_

- [shadcn-svelte](https://next.shadcn-svelte.com/) now supports Svelte 5 and has brand new docs to go with the update
- [Zag](https://zagjs.com/overview/introduction) now supports Svelte 5
- [Skeleton V3](https://github.com/skeletonlabs/skeleton/discussions/2919) is now in beta (and, as expected, supports Svelte 5)
- [Storybook 8.4](https://www.reddit.com/r/sveltejs/comments/1gpqusy/storybook_84_release/) now supports Svelte 5 and CSF natively with component testing built-in

_Icon Libraries_

- [svelicon](https://github.com/friendofsvelte/svelicon) converts Iconify SVG icons to type-safe components with one command
- [moving icons](https://www.movingicons.dev/) is a collection of animated icons based on the lucide icon library
- [Monicon](https://github.com/oktaysenkan/monicon) is an all-in-one icon library that provides 200,000+ icons from popular sets like Material Design, Feather, and Font Awesome

_Everything Else_

- [Svelte Multitone Image](https://stephane-vanraes.github.io/svelte-multitoneimage/) is a simple image renderer to apply multitone effects for Svelte
- [number-flow](https://github.com/barvian/number-flow) is a component to transition, format, and localize numbers
- [sveltednd](https://github.com/thisuxhq/SvelteDnD) is a lightweight, flexible drag and drop library for Svelte 5 applications
- [ShadEditor](https://github.com/Tsuzat/ShadEditor) is a highly extensible text editor for svelte made with TipTap and ShadCN UI
- [Tipex](https://www.npmjs.com/package/@friendofsvelte/tipex) is an advanced rich text editor based on Tiptap and Prosemirror
- [svelte-bundle](https://github.com/uhteddy/svelte-bundle) is a tool for bundling Svelte components into a single HTML file
- [svelte5-router](https://github.com/mateothegreat/svelte5-router) is an SPA router that allows you to divide & conquer your app with nested routers
- [@sheepdog/svelte](https://github.com/mainmatter/sheepdog) is a library to manage async tasks and concurrency with ease.

That's it for this huge month in Svelte! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next ~~time~~ year! 👋
