---
title: Component events
---

TODO some createEventDispatcher stuff migrated to props

## Why we did this

`createEventDispatcher` was always a bit boilerplate-y:

- import the function
- call the function to get a dispatch function
- call said dispatch function with a string and possibly a payload
- retrieve said payload on the other end through a `.details` property, because the event itself was always a `CustomEvent`

It was always possible to use component callback props, but because you had to listen to dom events using `on:`, it made sense to use `createEventDispatcher` for component events due to syntactical consiscency. Now that we have event attributes (`onclick`), it's the other way around: Callback props are now the more sensible thing to do.

They also unlock event spreading, which we discuss in the next section.
