---
title: 'Introducing integrated observability in SvelteKit'
description: 'SvelteKit apps can now emit OpenTelemetry traces and reliably set up observability instrumentation using instrumentation.server.ts'
author: Elliott Johnson
authorURL: https://bsky.app/profile/gruntled.bsky.social
---

Understanding how your SvelteKit application behaves in production — from request flows to performance bottlenecks — is crucial for building reliable user experiences. SvelteKit now has first-class support for observability: built-in [OpenTelemetry](https://opentelemetry.io/) tracing, and a dedicated instrumentation setup file that ensures your monitoring tools work seamlessly.

To opt in, upgrade SvelteKit and your adapter and add the following to your `svelte.config.js`:

```js
/// file: svelte.config.js
export default {
	kit: {
		experimental: {
			tracing: {
				server: true
			},
			instrumentation: {
				server: true
			}
		}
	}
};
```

## First-party OpenTelemetry traces

SvelteKit can now emit [OpenTelemetry](https://opentelemetry.io) traces for the following:

- [`handle`](/docs/kit/hooks#Server-hooks-handle) hook (`handle` functions running in a [`sequence`](/docs/kit/@sveltejs-kit-hooks#sequence) will show up as children of each other and the root handle hook)
- [`load`](/docs/kit/load) functions (includes universal `load` functions when they run on the server)
- [Form actions](/docs/kit/form-actions)
- [Remote functions](/docs/kit/remote-functions)

The emitted spans include attributes describing the current request, such as `http.route`, and surrounding context, such as the `+page` or `+layout` file associated with a `load` function. If there are additional attributes you think might be useful, please file an issue on the [SvelteKit GitHub issue tracker](https://github.com/sveltejs/kit/issues).

## A convenient home for all of your instrumentation

Emitting traces alone is not enough: You also need to collect them and send them somewhere. Under normal circumstances, this can be a bit challenging. Because of the nature of observability instrumentation, it needs to be loaded prior to loading any of the code from your app. To aid in this, SvelteKit now supports a `src/instrumentation.server.ts` file which, assuming your adapter supports it, is guaranteed to be loaded prior to your application code.

In Node, your instrumentation might look something like this:

```ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { createAddHookMessageChannel } from 'import-in-the-middle';
import { register } from 'module';

const { registerOptions } = createAddHookMessageChannel();
register('import-in-the-middle/hook.mjs', import.meta.url, registerOptions);

const sdk = new NodeSDK({
	serviceName: 'my-sveltekit-app',
	traceExporter: new OTLPTraceExporter(),
	instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();
```

If you're deploying to Vercel, it would look something like this:

```ts
import { registerOTel } from '@vercel/otel';

registerOTel({
	serviceName: 'my-sveltekit-app'
});
```

Consult your platform's documentation for specific instrumentation instructions. As of now, all of the official SvelteKit adapters with a server component (sorry, `adapter-static`) support `instrumentation.server.ts`.

## Acknowledgements

A huge thank-you to Lukas Stracke, who kicked us off on this adventure with his excellent [talk at Svelte Summit 2025](https://www.youtube.com/watch?v=hFVmFAyB_YA) and his initial draft PR for `instrumentation.server.ts`. Another thank-you to [Sentry](https://sentry.io/welcome/) for allowing him to spend his working hours reviewing and testing our work.
