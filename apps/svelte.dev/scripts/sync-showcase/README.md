# The showcase

The sites at `/showcase` are listed in `src/routes/showcase/sites.ts`, and their screenshots and clips are taken by the script in this folder. Run everything here from `apps/svelte.dev`.

The flags of the script are listed at the top of `index.ts`, and what each field of a site does is on the `Site` type in `sites.ts`. This file is for the rules that neither can hold.

## Adding a site

1. Check that it is made with Svelte. The script does this too, and saves nothing for a site where it finds none.
2. Add it to `sites` in `sites.ts`, in its category. The first in a category is shown larger and is chosen by hand. The rest go from best known down: `pnpm sync-showcase --rank` prints each one's rank and marks any out of order. A site on part of a larger domain, such as a university's or a government's, gets that domain's rank, so use your judgement there.
3. A smaller site also goes in `MORE` at the end of the file, to show in the rows after the categories. Read the comment there: the rows are cut from that list in order, so it has to be put in order again each time.
4. Take its screenshot with `pnpm sync-showcase <id>`, look at the file, and add selectors to `screenshot.hide` for anything in the way.
5. Run `pnpm exec vitest run src/routes/showcase scripts/sync-showcase` and `pnpm check`, then look at the page with `pnpm dev`.

The script needs a Playwright browser (`pnpm exec playwright install chromium`), `ffmpeg` for `--clip` and `unzip` for `--rank`.

## Names and descriptions

Use the site's own words. The name is as the site writes it, and the description is quoted from its description meta tag, title or main heading, or from another page by the same owner, named in a comment. Never write or translate one yourself. Set `lang` when it is not in English.

Where you cannot read the page, because the site turns scripts away, open it yourself and copy what this prints in the console:

```js
document.querySelector('meta[name=description]')?.content ?? document.title;
```

## Sites that keep scripts out

- The script reads each site's `robots.txt` and will not load a page it disallows. Such a site is marked `screenshot.headed` and only taken with `--headed`, which opens a window for you to visit it in yourself.
- Never get round a check for robots, such as a CAPTCHA or a "just a moment" page, with the script or by hand on its behalf. If a site challenges the script, mark it `headed` and take it yourself, or leave it out.
- With `--headed` the script waits for you to press Enter before each screenshot. Read the comment on the site first: some need setting up by hand, such as putting something in a cart. Whatever page the window is on when you press Enter is what is taken, so go back to the one you mean.

## The page itself

- No counts of sites anywhere on the page.
- No italic type.
- It is laid out like the front page of a newspaper, not like a gallery of cards. Look at how news sites handle a thing before designing it.
- Anything that moves on its own stops for the pause button, for `prefers-reduced-motion` and while it has keyboard focus, and can be reached and used by keyboard alone.
