---
title: The Omnisite
description: Your one-stop-shop for everything Svelte
author: Rich Harris
authorURL: https://bsky.app/profile/rich-harris.dev
---

Launching [Svelte 5](svelte-5-is-alive) and [the brand new `sv` CLI](https://www.youtube.com/watch?v=fAPFsRP-mbc#t=3h15m40s) wasn't enough: we've also released a brand new website. You're looking at it.

Up until now, we've maintained multiple different sites under the `svelte.dev` domain — the main site, for Svelte itself, along with `kit.svelte.dev` and `learn.svelte.dev`. This had some minor benefits, but was mostly a nuisance:

- inability to search across sites
- subtly different navigation
- potential for broken links (at build time, SvelteKit automatically validates that every internal link is correct, but links to other sites are a different matter)
- preferences such as dark mode are not shared between sites
- navigating between (for example) documentation and the tutorial involves a full page reload

From an implementation perspective, keeping multiple sites in sync proved to be a headache.

Having everything under a single roof means you'll have an easier time finding the information you need. Right now, the site includes documentation for [Svelte](/docs/svelte) and [SvelteKit](/docs/kit); soon, it will also cover the CLI and additional packages like `vite-plugin-svelte`.

## New look

We've also given the site a facelift. Our logo and hero artwork ('the machine'), designed by the brilliant Achim Vedam, are unchanged — these, and the Svelte orangey-red colour, are still the cornerstones of our visual identity.

But many other aspects of the site have been cleaned up, starting with the five Bs — boxes, backgrounds, borders, box-shadows, bold text — which are tempting to overuse when organising information on a page. By getting rid of most of these and simplifying our colour palette, the site is calmer, more cohesive and less cramped.

We've also updated our button styles so that they actually look like buttons (a radical concept in modern UI design, unfortunately).

## What the font?

Of course, the most salient difference is the typography. Previously, we used [Overpass](https://overpassfont.org/) for everything except code — logo, headers, UI elements and body copy. It's surprisingly versatile given its origins as an adaptation of [Highway Gothic](https://en.wikipedia.org/wiki/Highway_Gothic) (the typeface used on road signs in the US since 1948, aside from a [brief flirtation with Clearview](https://www.bloomberg.com/news/articles/2016-01-27/the-official-u-s-highway-sign-font-is-changing-from-clearview-to-highway-gothic)), but it's really not meant to be used for everything. We found ourselves making all sorts of ad hoc adjustments (tweaking colours, casing, line heights, spacing, weights and so on) and breaking other design rules (misaligning copy, adding unnecessary borders) to create hierarchy and reduce monotony. We needed a change.

At the same time, we couldn't bring ourselves to look the same as every other documentation site. Modern web design is stiflingly anodyne: everything is boxes, purple glowy nonsense, and the same handful of sans serif typefaces.

We should find that last part strange. Open any book or magazine and it's overwhelmingly likely that it will have been set in a serif typeface. There's a reason for that: serifs make individual letters more distinct, aiding readability, and help to define the type's personality.

On screens, serif type is less common. That's partly for historical and technological reasons: on the lower resolution screens of yore, particularly on Windows with its inferior font rendering, serifs lack definition and make readability _worse_. But most users today have much sharper screens, making this less of an issue. Indeed, most newspaper and magazine websites, and many blogs, use serifs for their body copy.

I suspect the real reason is mostly cultural: because we've come to associate serif type with the printed word, it is viewed as less _modern_. Conversely, sans serif type is associated with digital products.

I don't know about you, but I've come to associate digital products with unreliability: with bugs, cookie banners, exploitative business models, a disregard for privacy, planned obsolescence, and the many other sins of the technology industry.

I want the things I use to have analog sensibilities. I like things that feel _weighty_, that have an almost physical presence. (Svelte's HTML-first design, and ‘the machine', are, in a way, manifestations of this, even though we are inescapably a digital product.)

Above all, I want a web that isn't so damn homogeneous.

So our new site uses a selection of typefaces:

- DM Serif Display for headings
- EB Garamond for body copy, falling back to Georgia on low-resolution screens
- Fira Sans for UI elements
- Fira Mono for code

We know this is a controversial choice! Many people today engage with the written word almost exclusively through screens, and so the sight of serif typefaces might seem offensively strange. It may take some getting used to. We also recognise that there may be some legitimate readability concerns for some people with some combinations of operating system/screen/dark mode preference, and so we beg your understanding while we get everything just so.

## Contributing

As with any big update, there are a few details that still need polish, some of which may have escaped our notice until now. [The codebase is now open source](https://github.com/sveltejs/svelte.dev), and we welcome your contributions.
