import { defineConfig, devices } from '@playwright/test';

/**
 * These specs exercise the real Contentstack connector wiring end-to-end (network calls,
 * rendered content, live-preview tags) — not just the Angular app in isolation. They need:
 *   - `.env` populated (same credentials `npm start` uses)
 *   - network access to the OCC backend (self-signed cert — see `ignoreHTTPSErrors` below)
 *     and to `cdn.contentstack.io`
 * See e2e/README.md for what each spec checks and known gaps.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }]],
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
    // The OCC backend (40.76.109.9:9002) presents a self-signed cert in every non-prod
    // environment we've seen; without this every OCC call fails client-side before it
    // even reaches the network tab (see mystore-storefront-angular21 notes on the same gotcha).
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
