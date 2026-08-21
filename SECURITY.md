# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in this project, please report it
responsibly. **Do not open a public GitHub issue for security reports.**

- Email **security@contentstack.com** with a description of the issue, the
  affected version, and steps to reproduce.
- You will receive an acknowledgement, and we will keep you informed as we
  investigate and remediate.
- Please give us a reasonable period to address the issue before any public
  disclosure.

## Supported versions

This is a reference/demo application tracked on its `main` branch. Security
fixes are applied to `main`; there are no separate maintained release lines.

## Security model of this application

This is a demo storefront (Angular + SAP Composable Storefront / Spartacus)
using [`@contentstack/contentstack-spartacus-connector`](https://github.com/contentstack/contentstack-spartacus-connector)
to source CMS content from Contentstack, alongside a SAP Commerce Cloud (OCC)
backend for commerce data.

### Two-token model — never ship a privileged token

- The storefront uses only a **read-only Contentstack delivery token** (scoped
  to a single environment). It is designed to be present in the client bundle.
- A Contentstack **management token** is never used or stored by this
  application. Content modeling/seeding is a separate, one-time, dev-machine
  operation and is out of scope for this repository.

### Live Preview

- The **preview token** is only required when Live Preview / Visual Builder is
  enabled. This demo ships with Live Preview disabled by default.

### Secrets in configuration

- Real credentials belong in environment variables, not in source. See
  `.env.example` and `scripts/generate-contentstack-env.js` —
  `src/environments/contentstack.environment.ts` is generated at build time
  from `CS_API_KEY`/`CS_DELIVERY_TOKEN`/etc. and is gitignored, so no
  credential-bearing file is committed to this repository.
- No management tokens, API secrets, or private keys are stored in this
  repository.
