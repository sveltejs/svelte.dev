---
title: "What's new in Svelte: December 2025"
description: 'A new Svelte Society website and file upload streaming in forms'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

Just in time for the end of the year, there's a new [Svelte Society Website](https://sveltesociety.dev/)! It brings a whole new experience. Instead of just being a site with static resources, it now serves a dynamic feed of all the latest Svelte content out there. Videos, libraries, events, etc.

Instead of opening PRs to add libraries and packages you can now just submit them [on the website](https://sveltesociety.dev/submit). If you find an interesting package, head on over and submit it. Logged in users also have the ability to like and save content. So be sure to try it out and [share your feedback](https://www.reddit.com/r/sveltejs/comments/1ox9znh/announcing_the_new_svelte_society_website/)!

There's a bunch of updates to SvelteKit and a showcase to cover, so lets dive in...

## What's new in Svelte & SvelteKit

- `hydratable` API is a low-level API to coordinate hydration between the server and client (**svelte@5.44.0**, [Docs](https://svelte.dev/docs/svelte/hydratable), [#17154](https://github.com/sveltejs/svelte/pull/17154))
- `print` converts a Svelte AST node back into Svelte source code. It is primarily intended for tools that parse and transform components using the compiler’s modern AST representation (**svelte@5.45.0**, [Docs](https://svelte.dev/docs/svelte/svelte-compiler#print), [#16188](https://github.com/sveltejs/svelte/pull/16188))
- File uploads can now be streamed inside `form` remote functions allowing form data to be accessed before large files finish uploading (**kit@2.49.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#form), [#14775](https://github.com/sveltejs/kit/pull/14775))
- (Minor) Breaking Changes in **kit@2.48.8**:
  - `invalid` now must be imported from @sveltejs/kit ([#14768](https://github.com/sveltejs/kit/pull/14768))
  - The `submitter` option was removed from the experimental form `validate()` method. It will now always use the default submitter ([#14762](https://github.com/sveltejs/kit/pull/14762))
- **Svelte CLI:**
  - Links are now wrapped with `resolve()` to follow best practices (**sv@0.9.14**, [Docs](https://svelte.dev/docs/kit/$app-paths#resolve), [#754](https://github.com/sveltejs/cli/pull/754))
  - `npx sv create` now supports a new argument `--add` to add add-ons to the project in the same command (**sv@0.10.0**, [#695](https://github.com/sveltejs/cli/pull/695))
  - The new `--no-dir-check` option in sv create will, even if the folder is not empty, suppress all directory check prompts (**sv@0.9.15**, [#785](https://github.com/sveltejs/cli/pull/785))

For a full list of changes - including all the important bugfixes that went into the releases this month - check out the Svelte compiler's [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) and the Svelte Kit / Adapter [CHANGELOGs](https://github.com/sveltejs/kit/tree/main/packages).

---

## Community Showcase

### Apps & Sites built with Svelte

- [Apple's new web-based App Store](https://apps.apple.com) is built with Svelte! This adds onto the other Apple products spotted using Svelte in the wild - including Apple Music and Apple Podcasts
- [Aphex](https://getaphex.com/) is a modern, open source headless CMS built with SvelteKit
- [ShareNhac](https://www.sharenhac.com/) lets you and your friends watch videos and listen to music together in sync, without any ad interruptions
- [starterindex](https://starterindex.com/) is a curated list of top boilerplates to help you start your next project (which is great because we stopped putting "starter" repos in the Svelte newsletter over a year ago)
- [PGPlayground](https://pg.firoz.co/playground) helps any backend engineer quickly prototype and validate fixes or changes to their schema without leaving the browser
- [Engramma](https://engramma.dev) is a web-based editor and converter to manage design tokens, visualize them in a tree structure, and export them as CSS variables, SCSS or JSON format
- [Multi](https://multi.dev/) is a coding agent for VS Code
- [Gardenjs](https://gardenjs.org/) provides a centralized platform for developers to create, test, and present UI components and pages in isolation
- [bookemoji](https://bookemoji.dev/) is a tool to showcase, collaborate, and develop the technical aspects of user interfaces - an alternative to StoryBook.js or Histoire in your favorite tech stack

### Learning Resources

- [Rich Harris - Remote Control](https://www.youtube.com/watch?v=N4WQVmJbpFI) at ViteConf 2025
- [SvelteKit has solved data loading!](https://www.youtube.com/watch?v=U7ifCxAuuZE) from Syntax
- [Paolo Ricciuti - Progressively enhanced apps with Svelte](https://www.youtube.com/watch?v=Ji4Y5vo-gOg) at FrontKon#25
- [Adding Storybook to Svelte Society with Jeppe Reinhold](https://www.youtube.com/watch?v=3u-PXSbU5iA) from Svelte Society (Kev)
- [How to Navigate Like a Pro in SvelteKit](https://www.youtube.com/watch?v=yRtyjOOAECY) by Thiago Temple

### Libraries, Tools & Components

- [better-svelte-email](https://github.com/Konixy/better-svelte-email) lets you render emails in Svelte with first-class Tailwind support
- [svelte-number-format](https://www.npmjs.com/package/svelte-number-format) is a lightweight and reactive number input component that is now available as a stable v1.0 release
- [chain-enhance](https://github.com/michaelcuneo/chain-enhance) lets you sequentially chain multiple SvelteKit form actions with deep-merged data propagation, type-safe results, reactive progress tracking, and automatic file-safety
- [svelte-socket](https://www.npmjs.com/package/@hardingjam/svelte-socket) is a WebSocket wrapper for Svelte 5 using runes
- [@edgeone/sveltekit](https://pages.edgeone.ai/document/framework-sveltekit) lets you deploy your SvelteKit app to Tencent Cloud EdgeOne Pages to provide lightning-fast speeds in China while maintaining excellent performance worldwide
- [Davia](https://github.com/davialabs/davia) is an open-source tool designed for AI coding agents to generate interactive internal documentation for your codebase
- [svelte-ui-kit](https://github.com/ChulkovDanila/svelte-ui-kit) provides an easy to use, customizable button component with smooth hover animations - inspired by shadcn/ui style
- [Svelte AI Elements](https://github.com/SikandarJODD/ai-elements) is a component registry built on top of shadcn-svelte that provides production-ready components designed for building AI-powered applications
- [sveltekit-api-gen](https://github.com/Michael-Obele/sveltekit-api-gen) automatically generates OpenAPI 3.0 specifications from your SvelteKit server endpoints using JSDoc `@Swagger` annotations
- [Rune Scroller](https://runescroller.lelab.dev/) provides "enchanting" scroll animations for Svelte 5, built with native performance and zero dependencies
- [vite-plugin-sveltekit-decorators](https://github.com/KiraPC/vite-plugin-sveltekit-decorators/), a plugin that automatically decorates SvelteKit functions, now supports remote functions
- [svelte-breakpoint-badge](https://github.com/AnakKucingTerbang/svelte-breakpoint-badge) is a lightweight Svelte component that displays the current Tailwind CSS breakpoint during development

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
