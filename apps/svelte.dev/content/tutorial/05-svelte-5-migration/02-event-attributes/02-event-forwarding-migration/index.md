---
title: Event forwarding
---

TODO event forwarding

## Why we did this

This is a huge improvement over the old syntax: We had to manually forward each event separately, not know which of the events the consumer is actually interested in. With event spreading, we turn it around - the consumer is now in charge, and the component can spread events like props onto other components or the Dom.
