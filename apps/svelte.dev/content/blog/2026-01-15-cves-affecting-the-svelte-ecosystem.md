---
title: 'CVEs affecting the Svelte ecosystem'
description: 'Time to upgrade'
author: Elliott Johnson
authorURL: https://bsky.app/profile/ell.iott.dev
---

We’ve released patches for 5 vulnerabilities across `devalue`, `svelte`, `@sveltejs/kit`, and `@sveltejs/adapter-node`. Here’s what you need to know:

## Upgrade now

If you’re using any of these packages, upgrade them to their corresponding non-vulnerable versions:

- `devalue`: `5.6.2`
- `svelte`: `5.46.4`
- `@sveltejs/kit`: `2.49.5`
- `@sveltejs/adapter-node`: `5.5.1`

For cross-dependent packages — `svelte` and `@sveltejs/kit` depend on `devalue` — patched versions already include upgraded dependencies.

## Commentary

We’re extremely thankful to all of the security researchers who responsibly disclosed these vulnerabilities and worked with us to get them fixed, to the security team at Vercel who helped us navigate the disclosure process, and to the maintainers who worked to publish the fixes.

Over the last few weeks, we've seen a spate of high profile vulnerabilities affecting popular tools across the web development ecosystem. While they are unfortunate, it has been encouraging to see the community pulling together to keep end users safe. Using the lessons learned from these vulnerabilities, we will invest in processes that will help catch future bugs during the writing and review phases, _before_ they go live.

If you think you have discovered a vulnerability in a package maintained by the Svelte team, we urge you to privately report it via the Security tab on the repo in question (or the [Svelte repo](https://github.com/sveltejs/svelte/security/), if unsure).

## Details

Full reports are available in the published security advisories, but we’ve included a brief summary of each below.

### [CVE-2026-22775](https://github.com/sveltejs/devalue/security/advisories/GHSA-g2pg-6438-jwpf): DoS in `devalue.parse` due to memory/CPU exhaustion

- Packages affected:
  - `devalue`
- You’re affected if:
  - You’re using `devalue` versions `5.1.0` through `5.6.1`, and
  - You’re parsing user-controlled input
- Effects:
  - A malicious payload can cause arbitrarily large memory allocation, potentially crashing the process
  - SvelteKit applications using remote functions are vulnerable, as the parameters are run through `devalue.parse`
    - If you don’t have remote functions enabled, SvelteKit is not vulnerable

### [CVE-2026-22774](https://github.com/sveltejs/devalue/security/advisories/GHSA-vw5p-8cq8-m7mv): DoS in `devalue.parse` due to memory exhaustion

(Yes, this is very similar to the previous CVE. No, it is not the same!)

- Packages affected:
  - `devalue`
- You’re affected if:
  - You’re using `devalue` versions `5.3.0` through `5.6.1`, and
  - You’re parsing user-controlled input
- Effects:
  - A malicious payload can cause arbitrarily large memory allocation, potentially crashing the process
  - SvelteKit applications using remote functions are vulnerable, as the parameters are run through `devalue.parse`
    - If you don’t have remote functions enabled, SvelteKit is not vulnerable

### [CVE-2026-22803](https://github.com/sveltejs/kit/security/advisories/GHSA-j2f3-wq62-6q46): **Memory amplification DoS in Remote Functions binary form deserializer**

- Packages affected:
  - `@sveltejs/kit`
- You’re affected if:
  - You’re using SvelteKit versions `2.49.0` through `2.49.4`, and
  - You’ve enabled the `experimental.remoteFunctions` flag, and
  - You’re using `form`
- Effects:
  - Users can submit a malicious request that causes your application to hang and allocate arbitrarily-large amounts of memory

### [CVE-2025-67647](https://github.com/sveltejs/kit/security/advisories/GHSA-j62c-4x62-9r35): **Denial of service and possible SSRF when using prerendering**

- Packages affected:
  - `@sveltejs/kit`
  - `@sveltejs/adapter-node`
- You’re vulnerable to DoS if:
  - You’re using `@sveltejs/kit` versions `2.44.0` through `2.49.4`, and
  - Your app has at least one prerendered route
- You’re vulnerable to DoS and SSRF if:
  - You’ve using `@sveltejs/kit` versions `2.19.0` through `2.49.4`, and
  - Your app has at least one prerendered route, and
  - You’re using `@sveltejs/adapter-node` without a configured `ORIGIN` environment variable, and you are not using a reverse proxy that implements Host header validation
- Effects:
  - DoS causes the server process to die
  - SSRF allows access to internal resources that can be reached without authentication from SvelteKit’s server runtime
  - If the stars align, it’s possible to obtain SXSS via cache poisoning by forcing a potential CDN to cache an XSS returned by the attacker's server (the latter being able to specify the cache-control of their choice)

### [CVE-2025-15265](https://github.com/sveltejs/svelte/security/advisories/GHSA-6738-r8g5-qwp3): XSS via `hydratable`

- Packages affected:
  - `svelte`
- You’re vulnerable if:
  - You’re using `svelte` versions `5.46.0` through `5.46.3`, and
  - You’re using [`hydratable`](https://svelte.dev/docs/svelte/hydratable), and you’re passing unsanitized, user-controlled strings in as keys
- Effects:
  - Your users are vulnerable to XSS if an attacker can manage to get a controlled key into `hydratable` that is then returned to another user
