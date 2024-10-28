---
title: Introducing the new Svelte CLI
description: Tailwind, auth, databases and more — just an `npx sv` away
author: Ben McCann
authorURL: https://www.benmccann.com/
---

We’ve just released [sv](https://npmjs.com/package/sv), a new Command Line Interface (CLI) for creating, enhancing, and upgrading Svelte projects.

One of the most common question we hear is "how do I set up Tailwind on my new project?". Tailwind has [SvelteKit documentation](https://tailwindcss.com/docs/guides/sveltekit), but it lists eight steps. While the community-led `svelte-add` project could automate the process, few knew about it.

<div class="max">
<figure style="max-width: 960px; margin: 0 auto">
<div style="aspect-ratio: 1.777777778; position: relative; margin: 0 auto;">
	<iframe style="position: absolute; width: 100%; height: 100%; left: 0; top: 0; margin: 0;" src="https://www.youtube.com/embed/orYlYg27CiI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

<figcaption>Introducing <code>sv</code> at <a href="https://www.sveltesummit.com/">Svelte Summit Fall 2024</a></figcaption>
</figure>
</div>

Now, we're offering that functionality via our own CLI, directly within the project creation screen. And not just for Tailwind — we have built-in add-ons for formatting, linting, testing, setting up databases and auth and i18n and more. Just run `npx sv create` and follow the prompts:

```
$ npx sv create

┌  Welcome to the Svelte CLI! (v0.5.8)
│
◇  Where would you like your project to be created?
│  my-new-app
│
◇  Which template would you like?
│  SvelteKit minimal
│
◇  Add type checking with Typescript?
│  Yes, using Typescript syntax
│
◆  Project created
│
◆  What would you like to add to your project? (use arrow keys / space bar)
│  ◻ prettier (https://prettier.io)
│  ◻ eslint
│  ◻ vitest
│  ◻ playwright
│  ◻ tailwindcss
│  ◻ drizzle
│  ◻ lucia
│  ◻ mdsvex
│  ◻ paraglide
│  ◻ storybook
└
```

You can also run `npx sv add` to apply add-ons to existing projects. In the near future, we will also be supporting add-ons contributed by the community within `sv`. If you’re interested in building one, please subscribe to [the issue](https://github.com/sveltejs/cli/issues/184) in [the CLI repository](https://github.com/sveltejs/cli) to be notified when third party add-ons are supported.

It doesn't stop there. Over time, Svelte has accumulated a handful of CLIs: `svelte-check` type-checks your project from the command line, `npx svelte-migrate` helps you upgrade to new major versions, and in the future we might have even more capabilities. Remembering the package name of each tool is cumbersome, which is why we unify the experience under one roof, `sv`. That means you can now run `sv migrate svelte-5` to upgrade your Svelte 4 projects to Svelte 5. (The migration functionality can also be found in [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) as well as in the [playground](/playground).)

A huge thank you to Christopher Brown ([chbrown](https://github.com/chbrown)) who donated the sv package name on npm to make this CLI possible. This package merges the previous `create-svelte` and community-led `svelte-add` tools into a single package. Thank you to Manuel ([manuel3108](https://github.com/manuel3108)) and Adrian ([CokaKoala](https://github.com/AdrianGonz97)) who recently took over maintenance of the `svelte-add` project and have joined as the newest Svelte maintainers in making this project an official part of Svelte. Also thank you to J ([babichjacob](https://github.com/babichjacob)) for creating the `svelte-add` project and successfully stewarding it for years as an important part of the Svelte community.

To see the CLI in action, check out this demo from Ben Davis and t3.gg...

<div>
<figure style="max-width: 960px; margin: 0 auto">
<div style="aspect-ratio: 1.777777778; position: relative; margin: 0 auto;">
	<iframe style="position: absolute; width: 100%; height: 100%; left: 0; top: 0; margin: 0;" src="https://www.youtube.com/embed/31CyquY8RNE?si=qvI28kFHkEL9LNOr&amp;start=514" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

<figcaption>Introducing <code>sv</code> at <a href="https://www.sveltesummit.com/">Svelte Summit Fall 2024</a></figcaption>
</figure>
</div>

...or run `npx sv` to try it out yourself.
