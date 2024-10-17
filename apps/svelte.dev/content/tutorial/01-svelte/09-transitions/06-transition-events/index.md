---
title: Transition events
---

It can be useful to know when transitions are beginning and ending. Svelte dispatches events that you can listen to like any other DOM event:

```svelte
/// file: App.svelte
<p
	transition:fly={{ y: 200, duration: 2000 }}
+++	onintrostart={() => status = 'intro started'}
	onoutrostart={() => status = 'outro started'}
	onintroend={() => status = 'intro ended'}
	onoutroend={() => status = 'outro ended'}+++
>
	Flies in and out
</p>
```
