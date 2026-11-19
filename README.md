# SAP Composable Storefront (Spartacus) + Contentstack — Powertools Demo

A B2B powertools storefront built with **Angular 21** and **SAP Composable Storefront
(Spartacus `221121.15.1`)**, using the
[`@contentstack/contentstack-spartacus-connector`](https://github.com/contentstack/contentstack-spartacus-connector)
to drive its CMS layer from **Contentstack**.

Commerce data (products, pricing, cart, checkout) comes from a SAP Commerce Cloud (OCC) backend;
page content — the homepage, navigation, footer, and marketing slots — comes from Contentstack,
rendered as a hybrid over the OCC base (unauthored pages/slots fall back to OCC automatically).

> **📘 Full guide:** setup, the optional SAP product picker, Live Preview and troubleshooting are in
> [Set Up the SAP Composable Storefront Demos][demo-guide]. This README is the quick start.

## Prerequisites

| Requirement | Notes |
| --- | --- |
| Node.js | `^22.22.0` (older 22.x prints non-fatal `EBADENGINE` warnings) |
| Angular CLI 21 | `npx -p @angular/cli@21 ng ...` — no global install required |
| SAP RBSC registry access | Needed to install `@spartacus/*` packages — see below |
| An empty Contentstack stack | Master locale **English - United States (`en-us`)**. The import publishes everything in it. |
| Contentstack CLI | `npm install -g @contentstack/cli`, then `csdx auth:login --oauth` |
| Python 3.9+ | Runs the import skill's scripts |
| An AI coding agent with the [Contentstack agent skills](https://github.com/contentstack/contentstack-agent-skills#install) | Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI, … |

## Step 1 — Install

`@spartacus/*` packages are served from SAP's RBSC registry, not public npm. Create a `.npmrc` in
the project root:

```ini
@spartacus:registry=https://<YOUR_RBSC_REGISTRY_HOST>/
//<YOUR_RBSC_REGISTRY_HOST>/:_auth=<YOUR_RBSC_BASE64_AUTH>
legacy-peer-deps=true
```

This file is gitignored — it holds an organization credential and must never be committed. Then:

```bash
npm install
```

## Step 2 — Seed your stack with the agent skill

The demo content isn't shipped as a stack export. The
[`dx-sap-spartacus-import`](https://github.com/contentstack/contentstack-agent-skills/blob/main/docs/skills/dx-sap-spartacus-import.md)
agent skill reads the content the SAP site serves and recreates it in your stack, in the model the
connector reads (6 pages, 83 component entries, 41 images, plus navigation and footer).

From the project root, export the settings in your own shell:

```bash
export CS_API_KEY=<YOUR_STACK_API_KEY>
export OCC_BASE_URL=https://<SAP_HOST>/occ/v2   # the server in proxy.conf.json
export OCC_INSECURE_TLS=1                      # only for a self-signed dev server you trust

# Optional: let editors pick carousel products from SAP (SAP Commerce Cloud app)
export SAP_APP_API_BASE_URL=<SAP_API_HOST>     # host only, publicly trusted certificate
export SAP_APP_BASE_SITE=powertools-spa
export SAP_APP_BACKOFFICE_URL=<BACKOFFICE_HOST>/backoffice
```

Then ask your agent:

> Import the `powertools-spa` SAP storefront into my Contentstack stack, with German, Japanese and Chinese.

The agent does a dry run first, shows what it will write, and asks before it writes and publishes
to the `development` environment. With the picker settings exported, it first checks that SAP
server and stops before installing anything if the check fails. Re-running it updates entries in
place.

## Step 3 — Configure and run

1. In the stack, go to **Settings › Tokens** and create a **Delivery token** for `development`
   (generate its preview token too if you want Live Preview).
2. Create `.env` and fill it in:

   ```bash
   cp .env.example .env
   #   CS_API_KEY=<YOUR_STACK_API_KEY>
   #   CS_DELIVERY_TOKEN=<YOUR_DELIVERY_TOKEN>
   #   CS_ENVIRONMENT=development
   #   CS_REGION=US            # match your stack's region
   npm start
   ```

3. Open `http://localhost:4200/`.

`npm start` (and `npm run build`) generate `src/environments/contentstack.environment.ts` from
`.env` via `scripts/generate-contentstack-env.js`. That file is gitignored, so use `npm start` and
`npm run build` rather than `ng serve` / `ng build` on a fresh clone: without it the build fails with
`Cannot find module '.../environments/contentstack.environment'`. See `.env.example` for all
supported variables.

**Live Preview:** enable it in the stack (**Settings › Visual Experience**), set
`CS_LIVE_PREVIEW=true` and `CS_PREVIEW_TOKEN` in `.env`, and restart `npm start`. See the
[full guide][demo-guide] for the steps.

On a hosting platform, set the same variables (`CS_API_KEY`, `CS_DELIVERY_TOKEN`, `CS_ENVIRONMENT`,
`CS_REGION`, `CS_LIVE_PREVIEW`) as real environment variables instead of a `.env` file — the
generator script reads `process.env` either way.

Something not rendering? See [Troubleshooting][demo-troubleshooting] in the full guide.

## Build

```bash
npm run build
```

Build artifacts are written to `dist/`.

## Notes on credentials

`CS_API_KEY`/`CS_DELIVERY_TOKEN` are **read-only, environment-scoped Contentstack Delivery API
tokens** — safe to ship in the client bundle (they can only read already-published content, not
write or delete). They are kept out of git history for portability/rotation hygiene, not because
they're a runtime secret.

<!-- TODO(docs URL): replace both placeholder links below with the published guide's URL. -->
[demo-guide]: https://www.contentstack.com/docs/TODO-sap-composable-storefront-demos-guide
[demo-troubleshooting]: https://www.contentstack.com/docs/TODO-sap-composable-storefront-demos-guide#troubleshooting
