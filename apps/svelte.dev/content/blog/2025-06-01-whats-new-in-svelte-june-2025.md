---
title: "What's new in Svelte: June 2025"
description: 'Attachments are the new actions, plus better snippets and classes'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

In addition to advancing the work on Async Svelte, the maintainers have been hard at work introducing long requested features like Attachments.

This month, we'll share a bit about the new API along with a huge showcase of apps/sites built with Svelte...

Let's dive in!

## What's new in Svelte and SvelteKit

- Attachments are essentially a more flexible and modern version of actions. Read more about their use-cases and improvements over actions in the PR ([#1500](https://github.com/sveltejs/svelte/pull/15000)) or in the [Svelte docs](https://svelte.dev/docs/svelte/@attach) (**svelte@5.29.0**, **language-tools@109.7.0**)
- Do you have actions you love and want to use them as attachments? The `fromAction` utility lets you convert actions into attachments (**svelte@5.32.0**, [#15933](https://github.com/sveltejs/svelte/pull/15933))
- Generics are now allowed on snippets - improving typing and type hints (**svelte@5.30.0**, **language-tools@109.8.0**, [#15915](https://github.com/sveltejs/svelte/pull/15915))
- The Svelte extension will now allow you to add missing imports on save (**language-tools@109.6.0**, [#2744](https://github.com/sveltejs/language-tools/pull/2744))
- State fields can now be declared inside class constructors (**svelte@5.31.0**, [#15820](https://github.com/sveltejs/svelte/pull/15820))
- Svelte is now XHTML compliant and the new `fragments: 'html' | 'tree'` option adds wider CSP compliance (**svelte@5.33.0**, [#15538](https://github.com/sveltejs/svelte/pull/15538))
- Client-side code is now allowed to run at the top-level of universal pages/layouts when SSR is disabled and page options are only boolean or string literals (**kit@2.21.0**, [#13684](https://github.com/sveltejs/kit/pull/13684))

For a full list of bug fixes in Svelte, SvelteKit and its adapters, check out their CHANGELOGs [here](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) and [here](https://github.com/sveltejs/kit/tree/main/packages).

---

## Community Showcase

### Apps & Sites built with Svelte

- [Whimsy](https://whimsy.rocks/) is a small game engine and a fantasy console for making interactive stories
- [DASHBOT](https://dashbot.jianong.me/) is a 1v1 Space Robot Sprint Battle game for two players - with local and online modes
- [Kraa](https://kraa.io/) is a web-based markdown editor that does things a little differently
- [Shovel AI](https://www.shovel-ai.com/) is a batch tool for interacting with large amounts of a text data with AI models
- [md.uy](https://md.uy/) is a collaborative, local-first, peer-to-peer markdown editor
- [BringYourAI](https://bringyourai.com/) is a browser extension that provides instant codebase context on any AI chat website
- [Joe Malatesta](https://www.joemmalatesta.com/film) figured out a way to present his film photos in a digital environment
- [Notion Avatar](https://notion-avatar-svelte.vercel.app/) is a Notion-style avatar editor with Svelte 5 Runes
- [ORBITS](https://www.orbits.so/) is your second brain for who you know and who you meet

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- In case you missed it, [all the videos from Svelte Summit](https://www.youtube.com/playlist?list=PL8bMgX1kyZThKy_B41FQHk_xsHMQouV1Z) are released over the course of the next few days on Svelte Society YouTube. More on how that happened in last month's [blog post](https://svelte.dev/blog/svelte-summit-videos)
- [Svelte Attachments Are Here And They're Awesome](https://www.youtube.com/watch?v=9PREEREiPAE) by Joy of Code
- [SvelteBench](https://khromov.github.io/svelte-bench/benchmark-results-merged.html) (from Stanislav Khromov) shows how different AI models perform out of the box on Svelte 5 syntax - now updated with Anthropic's new Claude 4 models
- [First look at GitHub Copilot Coding Agent - The $40/month AI developer that actually works!](https://www.youtube.com/watch?v=FRcOen6JuJc) by Stanislav Khromov (video)
- [Truly Native Apps with Svelte?](https://mainmatter.com/blog/2025/05/22/native-apps-with-svelte/) by Paolo Ricciuti

_This Week in Svelte_

- [Ep. 102](https://www.youtube.com/watch?v=frp8BXlBAZY) — Svelte+Lynx and Async Svelte
- [Ep. 103](https://www.youtube.com/watch?v=P3Ldkuksqu0) — Attachments
- [Ep. 104](https://www.youtube.com/watch?v=txM-BCrZcbc) — Skeleton v3.0
- [Ep. 105](https://www.youtube.com/watch?v=Tiq0wivUNAE) — Changelog

_To Watch/Read_

- [Svelte's Next Big Change? (server components soon?)](https://www.youtube.com/watch?v=nQB9iRijqBY) by Better Stack
- [I spent some time using Better-Auth and Polar with SvelteKit and this is what I think](https://www.reddit.com/r/sveltejs/comments/1kaiwkk/i_spent_some_time_using_betterauth_and_polar_with/) by elansx
- [Building md.uy - Peer-to-Peer Markdown Editor](https://mr19.xyz/blog/md-uy/) by mateor

### Libraries, Tools & Components

- [Bits UI v2 released](https://www.bits-ui.com) - with support for attachments, `$props.id()`, Shadow DOM, and more
- [Composably](https://github.com/kompismoln/composably) is a content processing plugin for Vite and SvelteKit with typed content + dynamic Svelte components at build time
- [Svelte Flow is now 1.0](https://svelteflow.dev/) - with Svelte 5 support, TSDoc and a bunch of new features to make interactive flow charts even better
- [fox ui](https://flo-bit.dev/ui-kit/) is a collection UI components built with Tailwind 4 and Svelte 5 - now with a [rich text editor](https://www.reddit.com/r/sveltejs/comments/1kjwuci/currently_building_a_svelte_rich_text_editor_on/)
- [fluid-dnd](https://github.com/carlosjorger/fluid-dnd) is a drag and drop library for Vue, React and Svelte
- [sveltekit-password-protect](https://github.com/humanshield-sidepack/sveltekit-password-protect) is a simple utility to add a layer of protection to your websites
- [sveltekit-image-optimize](https://github.com/humanshield-sidepack/sveltekit-image-optimize) is a simple utility that helps you create an endpoint of your svelte app that optimizes your images
- [svelte-inspect-value@0.7.0 introduces Panels](https://inspect.eirik.space/reference/panel) - a fixed-position resizable panel / drawer that separates the debugging UI from flow of your website
- [nuqs-svelte](https://github.com/rtrampox/nuqs-svelte) is an unnoficial Svelte port of nuqs library - a type-safe search params state manager
- [sv-router](https://sv-router.vercel.app/) is a type-safe SPA router with file-based or code-based routing
- [svelte-textcircle](https://github.com/LoStis-World/svelte-textcircle) displays text in a circular layout with customizable animations and styling

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
