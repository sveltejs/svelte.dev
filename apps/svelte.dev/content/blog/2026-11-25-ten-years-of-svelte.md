---
title: 'Celebrating ten years of Svelte'
description: 'We gathered in Ljubljana. There was cake'
author: Rich Harris
authorURL: https://bsky.app/profile/rich-harris.dev
---

It started with a commit — specifically, [this one](https://github.com/sveltejs/svelte/commit/fc7e6e6827c3e9f2a29ec1c6ec957bab9f195841). Ten years later, we're far from done; software never is. But we've come an awful long way. Last week the community gathered in Ljubljana, at the third in-person [Svelte Summit](https://sveltesummit.com), to mark the anniversary.

<figure>
	<img alt="A white rectangular cake with a Svelte logo and the words '10th Anniversary'" src="/media/cake.webp">
	<figcaption>One of several cakes that were eaten at the conference</figcaption>
</figure>

To be completely honest, I expected the atmosphere to be a little subdued. Being enthusiastic about front end frameworks feels somewhat passé in the era of agentic coding and software factories, so a conference dedicated to one of the more boutique ones could easily have felt like a bit of a throwback.

But I was wrong. The energy was fantastic. We had two days of lively conversation and unbelievable demos in one of Europe's most beautiful cities, with a slew of announcements that we'll follow up on in more detail soon:

- [Custom renderers](https://svelte.dev/docs/svelte/custom-renderers) are now supported behind an `experimental` flag, allowing you to use Svelte to build native apps and terminal UIs and PDFs and just about anything else you can imagine.
- [Async Svelte](https://svelte.dev/docs/svelte/await-expressions) is making real progress towards production readiness.
- [`vite-devtools-svelte`](https://github.com/sveltejs/vite-devtools-svelte), which integrates with [Vite DevTools](https://devtools.vite.dev/), was moved into the Svelte organisation and is working towards a 1.0 release.
- [`rsvelte`](https://baseballyama.github.io/rsvelte/), by Svelte core team member [Yuichiro Yamashita](https://github.com/baseballyama), is a unified Svelte toolchain written in Rust. It's not quite production-ready yet, but it is _hilariously_ faster than the JavaScript equivalents.
- Svelte is now a [core framework](https://storybook.js.org/blog/storybook-11-beta/#framework-support) for [Storybook](https://storybook.js.org/).
- [`mdsvex`](https://mdsvex.pngwn.at/), a markdown preprocessor for Svelte components, reached version 1.0.

Naturally, we spent a lot of time talking about AI. Many of the announcements are directly relevant to agentic development (the devtools expose an MCP server, `rsvelte` makes it practical for fleets of agents to work on large apps concurrently, and so on), and most attendees described themselves as frequent — if ambivalent — users of the technology. But there's nothing like an in-person gathering to remind you that the best bits of the job can't be automated away.

Keep an eye on the [Svelte Society YouTube channel](https://www.youtube.com/sveltesociety), where the talks will be published in the coming days, starting with [Unfinished business](https://www.youtube.com/watch?v=v83Nh7EYJZg) by yours truly.

We're a decade in, and our best years are still ahead of us.
