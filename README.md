# SAP Composable Storefront (Spartacus) + Contentstack — Powertools Demo

A B2B powertools storefront built with **Angular 21** and **SAP Composable Storefront
(Spartacus `221121.15.1`)**, using the
[`@contentstack/contentstack-spartacus-connector`](https://github.com/contentstack/contentstack-spartacus-connector)
to drive its CMS layer from **Contentstack**.

Commerce data (products, pricing, cart, checkout) comes from a SAP Commerce Cloud (OCC) backend;
page content — the homepage, navigation, footer, and marketing slots — comes from Contentstack,
rendered as a hybrid over the OCC base (unauthored pages/slots fall back to OCC automatically).

## Prerequisites

| Requirement | Notes |
| --- | --- |
| Node.js | `^22.22.0` (older 22.x prints non-fatal `EBADENGINE` warnings) |
| Angular CLI 21 | `npx -p @angular/cli@21 ng ...` — no global install required |
| SAP RBSC registry access | Needed to install `@spartacus/*` packages — see below |
| A Contentstack stack | Delivery token + API key (read-only) |

### RBSC `.npmrc`

`@spartacus/*` packages are served from SAP's RBSC registry, not public npm. Create a `.npmrc` in
the project root:

```ini
@spartacus:registry=https://<YOUR_RBSC_REGISTRY_HOST>/
//<YOUR_RBSC_REGISTRY_HOST>/:_auth=<YOUR_RBSC_BASE64_AUTH>
legacy-peer-deps=true
```

This file is gitignored — it holds an organization credential and must never be committed.

## Setup

```bash
npm install
cp .env.example .env
# fill in your Contentstack stack's CS_API_KEY / CS_DELIVERY_TOKEN in .env
npm start
```

`npm start` (and `npm run build`) automatically generate
`src/environments/contentstack.environment.ts` from your `.env` via
`scripts/generate-contentstack-env.js` — that generated file is gitignored too, so nothing
credential-bearing ever needs to live in source control. See `.env.example` for all supported
variables.

On a hosting platform, set the same variables (`CS_API_KEY`, `CS_DELIVERY_TOKEN`, `CS_ENVIRONMENT`,
`CS_REGION`, `CS_LIVE_PREVIEW`) as real environment variables instead of a `.env` file — the
generator script reads `process.env` either way.

## Development server

```bash
ng serve
```

Then open `http://localhost:4200/`.

## Build

```bash
ng build
```

Build artifacts are written to `dist/`.

## Notes on credentials

`CS_API_KEY`/`CS_DELIVERY_TOKEN` are **read-only, environment-scoped Contentstack Delivery API
tokens** — safe to ship in the client bundle (they can only read already-published content, not
write or delete). They are kept out of git history for portability/rotation hygiene, not because
they're a runtime secret.
