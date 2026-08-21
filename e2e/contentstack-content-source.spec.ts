import { expect, test } from '@playwright/test';
import { extractAssetUrls, trackContentstackResponses } from './support/contentstack';

/**
 * "Is the content on screen actually FROM Contentstack" — not just "did we call the API".
 * Ties a Contentstack API response directly to a rendered DOM node by asset URL, since
 * Contentstack asset URLs (images.contentstack.io) can never come from OCC. This is the
 * check that would have caught the CS-owned slot silently rendering OCC data instead
 * (see cms-adapter-override-lazy-bug in project memory).
 */
test('a CS-owned slot renders the image Contentstack actually returned, not a stand-in', async ({
  page,
}) => {
  const responses = trackContentstackResponses(page);

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const assetUrls = new Set<string>();
  for (const res of responses) {
    extractAssetUrls(await res.json(), assetUrls);
  }
  expect(
    assetUrls.size,
    'no Contentstack asset URLs found in any entries response — cannot verify content source',
  ).toBeGreaterThan(0);

  const renderedSrcs = await page.locator('img').evaluateAll((imgs) =>
    imgs.map((img) => (img as HTMLImageElement).src),
  );

  const matched = [...assetUrls].some((url) => renderedSrcs.includes(url));
  expect(
    matched,
    'none of the images Contentstack returned appear as an <img src> on the page — ' +
      'content may be falling back to OCC/placeholder data instead of the CS response',
  ).toBe(true);
});

/**
 * The other half of the hybrid model: a page/slot Contentstack doesn't own must still
 * render its OCC content, not go blank. (Config comments call out a missing localeMapping
 * as the common cause of a blank page — this guards the fallback path in general.)
 */
test('a non-CMS page (cart) still renders its OCC content', async ({ page }) => {
  await page.goto('/cart');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: 'Your Shopping Cart', level: 1 })).toBeVisible();
});
