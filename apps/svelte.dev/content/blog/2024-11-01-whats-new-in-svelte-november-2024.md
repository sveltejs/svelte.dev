---
title: "What's new in Svelte: November 2024"
description: 'New features in Svelte 5 and a ton of new community libraries'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

In case you missed the [announcement post](/blog/svelte-5-is-alive), the brand new [omnisite](/blog/the-omnisite) or the maintainers [shipping it LIVE during Svelte Summit](https://www.youtube.com/live/fAPFsRP-mbc?si=Atd1WNpoMddssSna&t=13084)... Svelte 5 is out!

Also announced at Svelte Summit was [SvelteHack 2024: A Svelte Hackathon (with not-so-svelte prizes)](https://hack.sveltesociety.dev/2024). The submission period ends January 9 and only projects started after October 18th are eligible. So get those `$`s ready and start hacking!

Since the release of Svelte 5, there's already been one minor version to introduce a couple of helpful features. We'll dive into those - along with a number of updates across the CLI, SvelteKit and more - in this month's roundup...

## What's new in Svelte

If you've only recently [migrated to Svelte 5](/docs/svelte/v5-migration-guide), check out the last few months of updates for all the features that have gone into this release. For this month, you'll see some marked `-next.XXX`. These changes were in the 5.0 release.

- Snippets can now be used to fill slots (**5.0.0-next.262**, [#13427](https://github.com/sveltejs/svelte/pull/13427))
- `hidden until-found` and `beforematch` are now available on DOM elements (**5.0.0-next.266**, [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden#using_until-found), [#13612](https://github.com/sveltejs/svelte/pull/13612))
- **Breaking:** State mutations are not allowed in logic block expressions (**5.0.0-next.269**, [#13625](https://github.com/sveltejs/svelte/pull/13625))
- `getContext()` is now allowed within `$derived` runes (**5.1.0**, [Docs](/docs/svelte/$derived), [#13830](https://github.com/sveltejs/svelte/pull/13830))

To see all the amazing work that has gone into making the Svelte compiler better - including everything that went into making migrations easier - check out the [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md).

## What's new in SvelteKit, Svelte CLI and Language Tools

- `adapter-auto` now supports the Bun package manager (**3.3.1**, [#12854](https://github.com/sveltejs/kit/pull/12854))
- The [Svelte CLI](/blog/sv-the-svelte-cli) now supports a number of add-ons for new and existing projects. You can find the entire list of add ons in [the CLI Repository](https://github.com/sveltejs/cli) or by running `npx sv create` from your command line.
- The Svelte extension now provides a Svelte 5 component migration command (**extensions-109.1.0**)

---

## Community Showcase

### Apps & Sites built with Svelte

- [DocumentCloud](https://github.com/MuckRock/documentcloud-frontend/tree/sveltekit) is an all-in-one platform used by newsrooms around the world to manage primary source documents
- [Chord](https://chord.fm/) is an app for recording podcasts and interviews in high quality
- [Monokai.pro](https://monokai.pro/) uses Svelte 5 now (See the [Reddit Post](https://www.reddit.com/r/sveltejs/comments/1gd87ej/monokaipro_uses_svelte_5_now/) for more details)
- [svelte audio visualizations](https://github.com/flo-bit/svelte-audio-visualizations) are useful for visualizing voice input and output
- [avi12's](https://chromewebstore.google.com/detail/youtube-auto-hd-+-fps/fcphghnknhkimeagdglkljinmpbagone) [YouTube](https://chromewebstore.google.com/detail/youtube-time-manager/fpoooibdndpjcnoodfionoeakeojdjaj) [extensions](https://chromewebstore.google.com/detail/youtube-like-dislike-shor/fdkpkpelkkdkjhpacficichkfifijipc) are great examples of how Svelte can be used in Chrome extensions
- [Multy](https://multy.me/) is a simple tool that allows you to create a list of URLs, and share it with a single link
- [BlackJack](https://github.com/baterson/blackjack-svelte-5) is a card game built with Svelte 5, showcasing Svelte features for educational and demonstration purposes

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Svelte Summit Fall 2024](https://www.youtube.com/watch?v=fAPFsRP-mbc&list=PL8bMgX1kyZTg28nrVEDoyRTQFWweUR6fn) was a blast! Keep an eye out on this playlist to see all the talks split up into individual videos
- [Svelte 5 Basics - Complete Svelte 5 Course for Beginners](https://www.youtube.com/watch?v=8DQailPy3q8) by Syntax
- [Reduce your SvelteKit & Svelte 5 bundle sizes with server load functions](https://www.youtube.com/watch?v=8Sy04DGbJV8) by Stanislav Khromov

_This Week in Svelte_

- [Ep. 79](https://www.youtube.com/watch?v=wlngWKmIShA) — Changelog, Global/shared state, Kampsy-ui
- [Ep. 80](https://www.youtube.com/watch?v=SHBxjWtlv4A) — Changelog, formgator
- [Ep. 81](https://www.youtube.com/watch?v=xnNARAcjl9w) — Changelog, Inertia.js
- [Ep. 82](https://www.youtube.com/watch?v=CS2Nuwdwvi0) — Changelog, Migration guide

_To Read_

- [Speed of Svelte reactive bindings vs keyboard events](https://zellwk.com/blog/svelte-reactive-bindings-speed/) by Zell Liew
- [SvelteKit + Passkeys](https://passlock.dev/blog/passkeys/sveltekit-passkeys) by Passlock
- [Local-First Web Development with Replicache: Building smooth user experiences](https://shootmail.app/blog/local-first-web-development-with-replicache) by Shootmail
- [10 game-changing tools that level up Svelte developers in 2025](https://dev.to/sebconejo/10-game-changing-tools-that-level-up-svelte-developers-in-2025-14g3) by Sébastien Conejo

_To Watch_

- [Svelte 5 Is Like React, But Better](https://www.youtube.com/watch?v=31CyquY8RNE) by Theo - t3․gg
- [JavaScript framework reinvents itself… Did "runes" just ruin Svelte?](https://www.youtube.com/watch?v=aYyZUDFZTrM) by Fireship

### Libraries, Tools & Components

- [Svelte 5 testing example](https://github.com/PaoloTorregroza/weather-testing) is a good example project demonstrating how to test Svelte 5 applications with Vitest
- [Origin UI - Svelte](https://originui-svelte.pages.dev/) is an extensive collection of copy-and-paste components for quickly building app UIs
- [Cancellable](https://choco-ui.com/blocks/cancellable) is a building block adds three reactive attributes to button and anchor elements to create a more consistent user experience across browsers and platforms
- [svelte-simple-router](https://github.com/dvcol/svelte-simple-router) is a client-side router made for Svelte 5
- [svelte-openai-realtime-api](https://github.com/flo-bit/svelte-openai-realtime-api) is a Svelte component for using the OpenAI realtime api
- [FlyonUI](https://github.com/themeselection/flyonui) is an open-source Tailwind CSS Components Library with semantic classes and powerful JS plugins
- [Svelte-Next](https://svelte-next.codewithshin.com/) automates Svelte version updates
- [SvelteKit Dynamic Component Load demo](https://github.com/khromov/sveltekit-dynamic-component-load-demo/#sveltekit-dynamic-component-load-demo) shows how you can dynamically load different Svelte components depending on what content your backend API delivers
- [Tzezar's datagrid](https://github.com/tzezar/datagrid) is an easy to use, easy to customize, datagrid made in Svelte 5
- [svelte-bundle](https://github.com/uhteddy/svelte-bundle) is a tool for bundling Svelte components into single HTML files (with SSR!)
- [svelte-virtuallists](https://github.com/orefalo/svelte-virtuallists) keeps your tables and lists efficient and fast: only render the visible items, instead of displaying all your data in large lists
- [Sveltick](https://www.npmjs.com/package/sveltick) is a lightweight traffic-tracking library for your Svelte apps

That's it for this huge month in Svelte! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋
