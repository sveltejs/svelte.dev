---
title: "What's new in Svelte: September 2025"
description: 'Deno support, await in consts and open telemetry support'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

In case you missed it, the main Svelte blog covered how to use [SvelteKit's new OpenTelemetry traces](https://svelte.dev/blog/sveltekit-integrated-observability) to reliably set up observability instrumentation using instrumentation.server.ts. This month's round up covers that release and a few other features that rolled out before and after it.

Plenty in the showcase, as well, so let's dive in!

## What's new in Svelte and Svelte CLI (sv)

- `await` is now allowed inside `@const` declarations (**svelte@5.38.0**, [Docs](https://svelte.dev/docs/svelte/await), [#16542](https://github.com/sveltejs/svelte/pull/16542))
- The `sv add` command has been updated to remove the `--no-preconditions` and add `--no-git-check`. With this new flag, even if some files are dirty, no prompt will be shown (**sv@0.9.0**, [Docs](https://svelte.dev/docs/cli/sv-add), [#650](https://github.com/sveltejs/cli/pull/650))

## What's new in SvelteKit and its adapters

- Deno is now supported as a supported package manager (**sveltejs/adapter-auto@6.1.0**, [#14163](https://github.com/sveltejs/kit/pull/14163))
- A new `instrumentation.server.ts` adds tracing and observability setup (**sveltejs/adapter-node@5.3.0**, [Docs](https://svelte.dev/docs/kit/observability), [#13899](https://github.com/sveltejs/kit/pull/13899))
- The `--preserve-output` flag prevents deletion of the output directory before packaging (**sveltejs/package@2.5.0**, [Docs](https://svelte.dev/docs/kit/packaging), [#13055](https://github.com/sveltejs/kit/pull/13055))

For a full list of bug fixes in Svelte, SvelteKit and its adapters, check out their CHANGELOGs [here](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md) and [here](https://github.com/sveltejs/kit/tree/main/packages).

---

## Community Showcase

### Apps & Sites built with Svelte

- [Pollinate](https://apps.apple.com/us/app/pollinate-pollen-forecast/id6749463028) provides accurate forecasts designed for allergy sufferers who want to plan their day, or vacation, around pollen levels (Check out the [Reddit post](https://www.reddit.com/r/sveltejs/comments/1mk05ym/mobile_app_made_with_svelte_5_capacitor/) on how it was built)
- [Ferndesk](https://ferndesk.com/) is a help center that is kept up to date automatically (the creator shared their demo on the [Svelte Reddit](https://www.reddit.com/r/sveltejs/comments/1mqe9ez/i_built_a_tool_that_keeps_your_help_center_up_to/))
- [Wplace](https://wplace.live/) lets you paint whatever you want on a map of the world
- [Domain Watcher](https://github.com/Scorpio3310/domain-watcher) is a domain availability monitor and expiration tracker built with SvelteKit & Cloudflare Workers
- [Motley](https://trymotley.com/) is a local-first bookmarking/moodboard app
- [TallyHo](https://tallyho.app/) is a simple time tracking for freelancers
- [MenuScan](https://www.getmenuscan.app/) lets you take a picture of any restuarant menu and get access to the calorie and macro counts for each item
- [Vibe Check](https://vibechecked.app/) provides quick, honest diagnostics for AI‑built apps
- [Joyful](https://joyful.to/) is a simple way to write, design, and send beautiful newsletters
- [Eagle Cite](https://eaglecite.com/) lets you highlight, organize, and search your citations in one place
- [Volkara](https://volkara.stormlightlabs.org/) is a set of ADHD-Friendly Productivity Tools
- [Simple Man Archive](https://simplemanarchive.com/) is an ASCII art archive where anyone can contribute by creating unique ASCII art
- [Thirty](https://github.com/thirtycalendar/thirty) is an open-source AI calendar built on familiar foundations
- [Timezones](https://time.tem.dev/) quickly shows and converts timezones across many locations

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Compile Svelte 5 in your head](https://lihautan.com/compile-svelte-5-in-your-head) by Tan Li Hau
- [Introducing SvelteKit Remote Functions](https://www.youtube.com/watch?v=0hy7PCbXyqs) by Simon Holthausen
- [The Svelte MCP server](https://www.reddit.com/r/sveltejs/comments/1mju9yj/new_features_in_the_svelte_mcp_server_directly/) now allows you to directly reference documentation sections, and prompt templates

_This Week in Svelte_

- [Ep. 112](https://www.youtube.com/watch?v=GQLgq09-knM) — Storybook for Svelte Part 1
- [Ep. 113](https://www.youtube.com/watch?v=aerlBIuinFQ) — Storybook for Svelte Part 2 - Docs
- [Ep. 114](https://www.youtube.com/watch?v=FnUWuLQDCfM) — Changelog Review

_To Read_

- [Securing the supply chain at scale: Starting with 71 important open source projects](https://github.blog/open-source/maintainers/securing-the-supply-chain-at-scale-starting-with-71-important-open-source-projects/) by GitHub
- [Epicenter (YC S25)](https://www.reddit.com/r/sveltejs/comments/1mjqq3t/update_epicenter_yc_s25_just_sponsored_our_first/) is sponsoring Svelte maintainers to spend their time half pushing local-first OSS forward with Epicenter and half building their dream projects
- [Project Two: Creating Mobile app using Tauri + Svelte](https://minosiants.com/blog/two-project) by Kaspar Minosiants
- [Ways to use Anime.js with Svelte](https://brandonma.dev/blog/animejs-svelte/) by Brandon Ma
- [Svelte, Markdown, and the Magic of Web Components](https://www.sh4jid.me/blog/svelte-markdown-and-the-magic-of-web-components) by Shajid Hasan

_To Watch_

- [SvelteKit Remote Functions are INSANE! Type-Safe Full Stack in Minutes](https://www.youtube.com/watch?v=Xbdiwq_88iE) by Tyler Codes
- [Deploy a SvelteKit Application to Cloudflare Workers with Drizzle & D1](https://www.youtube.com/watch?v=ZZaExhqW5II) by Jilles Soeters

### Libraries, Tools & Components

- [EXE](https://github.com/Hugo-Dz/exe) is a build tool to distribute your full-stack web app as a single executable binary with zero runtime dependencies
- [Svelte Sortable List](https://github.com/rodrigodagostino/svelte-sortable-list) is a comprehensive package for creating accessible, sortable lists in Svelte applications
- [Markdown UI](https://github.com/BlueprintLabIO/markdown-ui) turns static docs into interactive experiences - instantly
- [Tark UI](https://www.tarkui.com/) provides beautiful UI components built with Ark UI and Tailwind
- [Uniface Element](https://github.com/ticatec/uniface-element) is a comprehensive enterprise-grade UI component library built with Svelte 5, designed for modern web applications
- [microfolio](https://github.com/aker-dev/microfolio) is a modern static portfolio generator featuring a file-based content management system using folders and Markdown files
- [Keycloakify](https://docs.keycloakify.dev/) is a tool for creating custom Keycloak themes, enabling you to modify the appearance and behavior of Keycloak's user interfaces
- [PDJsonEditor](https://github.com/podosoft-dev/pdjsoneditor) is a powerful JSON visualization and editing tool with both a code editor and interactive graph views
- [Show & Svelte](https://github.com/retrotheft/show-and-svelte) lets you create fully interactive presentations with Svelte
- [wuchale](https://github.com/wuchalejs/wuchale) is a compile-time internationalization (i18n) toolkit that requires zero code changes
- [svelte-overflow-fade](https://github.com/harshmandan/svelte-overflow-fade?tab=readme-ov-file) is a Svelte action and attachment for adding beautiful fade effects to overflowing content
- [formshape](https://www.npmjs.com/package/formshape) is a type-safe form validation for SvelteKit Remote Functions using Standard Schema compatible validators
- [vite-plugin-svelte-inline-component](https://github.com/hanielu/vite-plugin-svelte-inline-component) lets you write tiny Svelte components straight inside your JavaScript / TypeScript tests using tagged‑template literals.
- [vite-plugin-sveltekit-decorators](https://github.com/KiraPC/vite-plugin-sveltekit-decorators) is a Vite plugin that automatically decorates SvelteKit functions with customizable wrappers for logging, analytics, error handling, and more
- [jetbrains-svelte-templates](https://github.com/ruben-sprengel/jetbrains-svelte-templates) is a compact collection of Live Templates for JetBrains IDEs (like WebStorm and IntelliJ IDEA Ultimate) designed to speed up your Svelte & SvelteKit development

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
