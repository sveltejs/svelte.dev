---
title: Advent of Svelte
description: Twenty-four days, twenty-four features
author: The Svelte team
authorURL: https://svelte.dev/
pinnedUntil: 2024-12-26
---

Last December, [Svelte Society](https://bsky.app/profile/sveltesociety.dev) presented an advent calendar's worth of [festive Svelte-themed code challenges](https://advent.sveltesociety.dev/).

This year, we're turning it around: you get to relax while _we_ take on a challenge. We've set ourselves a goal of releasing one thing a day from here until Christmas, whether it's a new feature in Svelte or SvelteKit or an improvement to the website.

Follow [@svelte.dev](https://bsky.app/profile/svelte.dev) and [@sveltesociety.dev](https://bsky.app/profile/sveltesociety.dev) and check back every day to see what we've been cooking up.

## Day 1: error boundaries

This is a long-awaited and much-requested feature, that allows you to isolate and recover from errors that occur during rendering.

- [docs](/docs/svelte/svelte-boundary)
- [tutorial](/tutorial/svelte/svelte-boundary)

## Day 2: `each` without `as`

If you just want to render something in an `{#each ...}` block _n_ times, and don't care about the value, you can now omit the `as` part.

- [docs](/docs/svelte/each#Each-blocks-without-an-item)
- [demo](/playground/untitled#H4sIAAAAAAAAA3WP3WrDMAyFX0VoDFqWtGRXxWsKY4-x7MKx1SbUtY2tdi0h7z7s_myD9k6c8-lIZ0Ard4QCPzqKEVong8YC172hiOJzQD75ZCcBiyv87v0sHshw0loZ6Z6unGWyHFHgUvcHUEbGWDeo0qUyX2pw1diGhyeSqoMBDNkNdwIWMBYQpN2OyX4EpJ8uQMO_J0RrpNrWwyQFwEvGpvAMr1DXNVTjajnX_WF1SZ6n5JxyG2--XUY-Gcro7M_bMJyXdR-9kScBm9Drt7OWxpJp541kKpUz-52NAgJ5kjxZFFCtw_QuG9z3I7B1QVMQUPkjRGd6DbnjxZXRk-IySO6dgCqpWZ9l6Ppsw61U201we6vFv_3cPvc-18UCmY6MgsOexq_xBw8BVaUkAgAA)

## Day 3: exported snippets

You can now export snippets from a component's `<script module>`, for use in other components, as long as those snippets don't reference anything belonging to the component instance.

- [docs](/docs/svelte/snippet#Exporting-snippets)
- [demo](/playground/16b7dd7105c248e59ec8a437697f588d)

## Day 4: form control default values

When you reset a form, the value of each `<input>` element reverts to its `defaultValue`. This is normally the empty string, but you can now control it directly in your template.

- [docs](/docs/svelte/bind#input-bind:value)
- [demo](/playground/b30cfac16c3c4a3ab3d76ad20a5925cf)

## Day 5: `MediaQuery`, `prefersReducedMotion` and `createSubscriber`

It's a three-in-one kind of day. `new MediaQuery(...)` gives you an object with a reactive `current` property that's true when the media query matches. `prefersReducedMotion` is an instance of `MediaQuery` that matches if the user has expressed a [preference for reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), helping you build accessible apps. Under the hood, both are using the `createSubscriber` mechanism, which gives you an easy way to set up event listeners when a value is read inside an effect.

- [`createSubscriber` docs](/docs/svelte/svelte-reactivity#createSubscriber)
- [`MediaQuery` docs](/docs/svelte/svelte-reactivity#MediaQuery)
- [`prefersReducedMotion` docs](/docs/svelte/svelte-motion#prefersReducedMotion)
- [demo](/playground/89f6f3bb738149fcb6e708cfce878e0f)

## Day 6

Coming soon!

## Day 7

Coming soon!

## Day 8

Coming soon!

## Day 9

Coming soon!

## Day 10

Coming soon!

## Day 11

Coming soon!

## Day 12

Coming soon!

## Day 13

Coming soon!

## Day 14

Coming soon!

## Day 15

Coming soon!

## Day 16

Coming soon!

## Day 17

Coming soon!

## Day 18

Coming soon!

## Day 19

Coming soon!

## Day 20

Coming soon!

## Day 21

Coming soon!

## Day 22

Coming soon!

## Day 23

Coming soon!

## Day 24

Coming soon!
