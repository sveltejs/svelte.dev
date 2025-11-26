---
title: "What's new in Svelte: November 2025"
description: 'Svelte MCP, typed contexts and improved form validation in remote functions'
author: Dani Sandoval
authorURL: https://dreamindani.com
---

The official Svelte MCP server (for all your agentic needs) is now available with its own [section of the docs site](https://svelte.dev/docs/mcp/overview) and [GitHub repo](https://github.com/sveltejs/mcp). If you haven't gotten a chance to try it out with the AI of your choice, definitely take it for a spin. It should replace the copy/pasting of the Svelte docs that's often required to get LLMs to write valid Svelte 5 code and can provide suggestions on the generated code with static analysis.

But it's not just AIs that have been writing code; our maintainers have too! Let's take a look at what they've been up to in Svelte/Kit before diving into our community showcase...

## What's new in Svelte

- `createContext` passes types with a stored context - replacing the need to type every `getContext` return value (**5.40.0**, [Docs](https://svelte.dev/docs/svelte/svelte#createContext), [#16948](https://github.com/sveltejs/svelte/pull/16948))
- The `$state.eager(value)` rune will update the UI immediately instead of waiting for the corresponding `await` to resolve (**5.41.0**, [Docs](https://svelte.dev/docs/svelte/$state#$state.eager), [#16849](https://github.com/sveltejs/svelte/pull/16849))
- The `fork` API lets you change some state 'offscreen' in such a way that you can discover any async work resulting from the state change without committing it to the screen. (**5.42.0**, [Docs](https://svelte.dev/docs/svelte/await-expressions#Forking), [#17004](https://github.com/sveltejs/svelte/pull/17004))

For a full list of changes - including the dozens of valuable bugfixes that went into the releases this month - check out the Svelte compiler's [CHANGELOG](https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md).

## What's new in SvelteKit

- `event.route` and `event.url` are now available in remote functions making it easier to know which page a remote function was called from (**2.44.0**, [Docs](https://svelte.dev/docs/kit/remote-functions), [#14606](https://github.com/sveltejs/kit/pull/14606))
- `form.for(id)` will now implicitly set an id on the form object (**2.45.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#form-Multiple-instances-of-a-form), [#14623](https://github.com/sveltejs/kit/pull/14623))
- Form validation can now be done imperatively in cases where it can't be done via a schema (**2.46.0**, [Docs](https://svelte.dev/docs/kit/remote-functions#form-Programmatic-validation), [#14624](https://github.com/sveltejs/kit/pull/14624))
- The new signal request property provides the `AbortSignal` associated with the request (**2.47.0**, [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Request/signal), [#14715](https://github.com/sveltejs/kit/pull/14715))
- Kit will now use the `fork` API when it's available. See the Svelte updates above for more info (**2.48.0**, [#14793](https://github.com/sveltejs/kit/pull/14793))

---

## Community Showcase

### Apps & Sites built with Svelte

- [Deep Time](https://www.abc.net.au/news/deeptime/) is an interactive article from ABC Australia that tells the story of the Aboriginal and Torres Strait Islander peoples
- [Ririkku](https://demo.ririkku.com/) (リリック) is a karaoke-style music player with an intelligent Japanese text analyzer built-in
- [Glucose](https://github.com/rudi-q/glucose_media_player) is an ultra-lightweight, video player for Windows with AI powered subtitle generation
- [Restring](https://restring.dev/) is a fast, smart toolbox for dev tasks like formatting JSON, decoding JWTs, and converting strings
- [Huly](https://github.com/hcengineering/platform) is an all-in-one project management platform (alternative to Linear, Jira, Slack, Notion, Motion)
- [Nokiafied](https://nokiafied.pages.dev/) converts your videos into super low-quality Nokia phone style videos for memes
- [Contracko](https://contracko.com/) is an AI contract management platform for small businesses

### Learning Resources

_Featuring Svelte Contributors and Ambassadors_

- [Full Stack SvelteKit CRUD App Using Remote Functions Tutorial](https://www.youtube.com/watch?v=Ldnmirx0QtI), [How Svelte Reactivity Works](https://www.youtube.com/watch?v=M5oAYP6Rxkg) and [Stop Looking For Code And Use The Svelte Inspector](https://www.youtube.com/watch?v=Qglbt8M8H_w) by Joy of Code
- [I Was Wrong About Svelte...](https://www.youtube.com/watch?v=IpJh0VEzMRo) by Ben Davis
- [Storybook is actually good now, with Jeppe Reinhold](https://www.svelteradio.com/episodes/storybook-is-actually-good-now-with-jeppe-reinhold) and [Macrodata Refinement with Ken Kunz](https://www.svelteradio.com/episodes/macrodata-refinement-with-ken-kunz) by Svelte Radio

_This Week in Svelte_

- [Ep. 119](https://www.youtube.com/watch?v=f6zLcQxMsU4) — svelte.dev/packages
- [Ep. 120](https://www.youtube.com/watch?v=P8jdPBKwq54) — Storybook for Svelte Part 3: Testing
- [Ep. 121](https://www.youtube.com/watch?v=V-j4w6j8OB4) — Svelte MCP Server
- [Ep. 122](https://www.youtube.com/watch?v=o4kcABS-XH4) — svedit.dev

_Svelte London - October 2025_

You can [watch the full video on YouTube](https://www.youtube.com/watch?v=fsWp3bvLA4c) or skip to the specific talks below:

- [Precision vs Prediction: The Trouble with LLMs and Libraries](https://www.youtube.com/live/fsWp3bvLA4c?si=x0OR5XQVjIo64xjS&t=712) by Maria Gorinova (Tessl AI Research)
- [Building a game level editor with SvelteKit](https://www.youtube.com/live/fsWp3bvLA4c?si=i_Sgf-kpwV7UVSex&t=3985) by Elliot Bentley

_To Read / Watch_

- [SvelteKit Remote Functions - Interactive Showcase](https://github.com/wiesson/svelte-async-remote-fn) by Arne Wiese
- [BetterAuth and Google Login on Cloudflare Workers with SvelteKit](https://www.youtube.com/watch?v=zIvGs0FOMvA) by Jilles Soeters

### Libraries, Tools & Components

- [aphex](https://github.com/IcelandicIcecream/aphex) is a modern, extensible headless CMS featuring a portable core package, database/storage agnostic adapters, and a Sanity-inspired admin interface
- [svelte-o-phone](https://github.com/kevwpl/svelte-o-phone) is a flexible, headless phone number input component powered by `libphonenumber-js`
- [motion-svelte](https://github.com/hanielu/motion-svelte) is an attempt to bring a Motion (formerly known as Framer Motion) to Svelte
- [better-captcha](https://github.com/LuggaPugga/better-captcha/) provides framework-agnostic wrappers for a bunch of captcha providers
- [svelte-runtime-template](https://www.npmjs.com/package/svelte-runtime-template) is a lightweight Svelte component for handling templates at runtime with curly brace substitutions in text content
- [RetroUI](https://retroui-svelte.netlify.app/) is a copy/pastable component library built for Svelte with `shadcn-svelte`
- [Skeleton](https://github.com/skeletonlabs/skeleton/discussions/3920) - the Svelte-native component library - just released its v5 version with a ton of quality of life improvements
- [Tanstack Query Svelte v6](https://tanstack.com/query/latest/docs/framework/svelte/migrate-from-v5-to-v6) is now based on the runes syntax

That's it for this month! Let us know if we missed anything on [Reddit](https://www.reddit.com/r/sveltejs/) or [Discord](https://discord.gg/svelte).

Until next time 👋🏼!
