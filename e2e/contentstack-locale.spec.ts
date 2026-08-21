import { expect, test } from '@playwright/test';
import { extractAssetUrls, trackContentstackResponses } from './support/contentstack';

/**
 * Switching the storefront language should re-fetch Contentstack content in the mapped
 * locale (localeMapping: en->en-us, de->de-de, ...) — not just relance OCC's own i18n.
 * Regression target: powertools-store shipped with banner images going stale on switch
 * because the per-component reload missed the real content type (see
 * language-switch-fixes in project memory) — this asserts the CS asset actually changes.
 */
test('switching language re-fetches Contentstack content for the new locale', async ({ page }) => {
  test.setTimeout(60_000);
  const responses = trackContentstackResponses(page);

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const enAssets = new Set<string>();
  for (const res of responses) {
    extractAssetUrls(await res.json(), enAssets);
  }
  expect(enAssets.size).toBeGreaterThan(0);

  responses.length = 0;
  const [deResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('locale=de-de')),
    page.locator('label:has-text("Language:") select').selectOption('de'),
  ]);
  expect(deResponse.url()).toContain('locale=de-de');
  await page.waitForLoadState('networkidle');

  const deAssets = new Set<string>();
  for (const res of responses) {
    extractAssetUrls(await res.json(), deAssets);
  }

  const staleUrls = [...enAssets].filter((url) => !deAssets.has(url));
  const freshUrls = [...deAssets].filter((url) => !enAssets.has(url));

  // The page has ~10 banner slots, each re-fetched (and re-rendered) independently, so
  // they settle at slightly different times after the locale switch — this polls the
  // eventual state rather than a single point-in-time snapshot mid-transition.
  await expect
    .poll(
      () =>
        page.locator('img').evaluateAll(
          (imgs, { fresh, stale }) => ({
            anyFresh: imgs.some((img) => fresh.includes((img as HTMLImageElement).src)),
            anyStale: imgs.some((img) => stale.includes((img as HTMLImageElement).src)),
          }),
          { fresh: freshUrls, stale: staleUrls },
        ),
      { timeout: 30_000 },
    )
    .toEqual({ anyFresh: true, anyStale: false });
});
