---
title: "What's new in Svelte: May 2026"
description: 'Svelte CLI Community Add-ons, TypeScript 6.0 support in SvelteKit'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

This month we got a ton of improvements to SvelteKit's remote functions, TypeScript 6.0 support and the experimental release of community plugins in the Svelte CLI.

Svelte was also [featured in ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar/languages-and-frameworks/summary/svelte)!

Big month, bigger showcase... so let's dive in!

## What's new in SvelteKit

- SvelteKit now supports TypeScript 6.0 (**2.56.0**, [Docs](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/), [#15595](https://github.com/sveltejs/kit/pull/15595))
- `form` fields can now specify a default value using `field.as(type, value)`, reducing boilerplate for pre-populated forms (**2.56.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#form-Fields), [#15577](https://github.com/sveltejs/kit/pull/15577))
- Remote function transport now uses `hydratable`, enabling richer data types in query results (**2.56.0**, [#15533](https://github.com/sveltejs/kit/pull/15533))
- Form `submit` now returns a `boolean` to indicate submission validity for enhanced form remote functions (**2.57.0**, [Docs](https://svelte.dev/docs/kit/app-forms#enhance), [#15530](https://github.com/sveltejs/kit/pull/15530))
- **Remote Function Breaking Changes (2.56.0)**
  - Rework client-driven refreshes ([#15562](https://github.com/sveltejs/kit/pull/15562))
  - Stabilize remote function caching by sorting object keys ([#15570](https://github.com/sveltejs/kit/pull/15570))
  - Add `run()` method to queries, disallow awaiting queries outside render ([#15533](https://github.com/sveltejs/kit/pull/15533))
  - Isolate command-triggered query refresh failures per-query ([#15562](https://github.com/sveltejs/kit/pull/15562))

Looking for more details on the many bug fixes and performance optimizations from this month? Check out the SvelteKit / Adapter [CHANGELOGs](https://github.com/sveltejs/kit/tree/main/packages).

## What's new in Svelte and Svelte Dev Tools

- Community add-ons are now available in `sv` as an experimental feature (**sv@0.1.0**, [Docs](https://svelte.dev/docs/cli/community), [#1020](https://github.com/sveltejs/cli/pull/1020))
- The `sv` and `sv-utils` packages are now separate in the CLI package - leading to a more explicit public API and a deprecation pass for old features (**sv@0.2.0**, [Docs](https://svelte.dev/docs/cli/sv), [#1046](https://github.com/sveltejs/cli/pull/1046))
- Types for `TweenOptions`, `SpringOptions`, `SpringUpdateOptions` and `Updater` are now available as exports from `svelte/motion` (**svelte@5.55.0**, [Docs](https://svelte.dev/docs/svelte/svelte-motion), [#17967](https://github.com/sveltejs/svelte/pull/17967))

For a full list of changes - including all the important bugfixes that went into the releases this month - check out the Svelte compiler's [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md).

---

## Community Showcase

### Apps & Sites built with Svelte

- [4Track](https://www.4track.cc/) is a faithful recreation of a 4-track tape recorder in the browser
- [Kumamap](https://kumamap.com/) is a bear incident map that collates official reports, news and community reports in Japan
- [Overshoot](https://overshoot.dev/) is an interactive exploration of Disney's 12 Principles of Animation
- [DockScope](https://github.com/ManuelR-T/dockscope) is a visual Docker dashboard with a 3D dependency graph, live metrics, logs, terminal and container actions
- [dnsoptic](https://dnsoptic.com/) is a DNS health audit tool that checks nameservers, mail authentication, DNSSEC, security posture and migration diffs
- [swap.](https://swapjs.dev/) is a collection of little games built around sorting algorithms
- [Scapedle](https://github.com/asbedb/Scapedle) is a Wordle game with Old School RuneScape (OSRS) words
- [Ephemeral Forms](https://github.com/ra9/ephemeral-forms) is a modern, zero-login, offline-first form builder with AI-powered generation, real-time collaboration and cross-device sync
- [CORDIAL](https://www.youtube.com/watch?v=ZVy0vXBHaCM) is an AI Native IDE optimized for a big screen experience. "Good for people who want to feel like Tom Cruise in Minority Report"

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Paolo Ricciuti - Svelte, TMCP](https://www.youtube.com/watch?v=2r25fPn95M8) by devtools-fm

_This Week in Svelte_

- [Ep. 137](https://www.youtube.com/watch?v=KepF0I5iLb0) - Changelog, Community `sv` add-ons
- [Ep. 138](https://www.youtube.com/watch?v=YwKsLJ5p-uQ) - Changelog
- [Ep. 139](https://www.youtube.com/watch?v=6muvGbGOG7E) - Changelog, Imperative interfaces

_To Read_

- [hello svelte: migrating and redesigning my oss project](https://www.jaydip.me/blog/hello-svelte) by Jaydip Sanghani

### Libraries, Tools & Components

_UI Components and Animations_

- [Blossom Color Picker](https://blossom.dayflow.studio/) is a flower-style color picker
- [thisux/sveltednd](https://sveltednd.thisux.com/) (last featured in December 2024) has been updated to support Svelte 5
- [phantom-ui](https://github.com/Aejkatappaja/phantom-ui) is a structure-aware skeleton loader built with web components
- [Svelte Spell UI](https://sv-animations.vercel.app/spell) is a port of the original Spell UI that you can copy-paste into any project
- [Svileo](https://www.reddit.com/r/sveltejs/comments/1sbgc9j/svileo_physicsbased_toast_component_for_svelte/) is a physics-based toast component inspired by Sileo
- [Motion Core](https://motion-core.dev/) (last featured in February) has been rewritten from Three.js to OGL with a much-reduced file size

_State Management_

- [Stately](https://github.com/selfagency/stately) is a Pinia-inspired state management library that provides a structured way to define shared state, mutate it directly and observe changes

_Utilities and Integrations_

- [Sveltia I18n](https://github.com/sveltia/sveltia-i18n) is an internationalization library powered by runes and the messageformat library for formatting messages using Unicode MessageFormat 2 (MF2)
- [Nabu](https://github.com/aionbuilders/nabu) is a modular, local-first Svelte block editor engine built on a Single ContentEditable architecture
- [Svelte Agentation](https://github.com/SikandarJODD/sv-agentation) turns UI annotations into structured context that AI coding agents can understand and act on

_Developer Tools_

- [Atom Forge](https://atom-forge.eu/) is a full-stack TypeScript toolkit with Svelte 5 UI components, type-safe RPC and a battle-tested architecture pattern that scales
- [svelte-check-native](https://github.com/harshmandan/svelte-check-native) is a Rust/tsgo drop-in replacement for `svelte-check` with the same flags, output formats and exit codes

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
