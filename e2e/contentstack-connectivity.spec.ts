import { expect, test } from '@playwright/test';
import { trackContentstackResponses } from './support/contentstack';

/**
 * Is the connector actually talking to Contentstack, and is what comes back usable?
 * These two checks are the floor: if either fails, everything downstream (content-source,
 * live preview) is moot because there's no real connection to test against.
 */
test.describe('Contentstack API connectivity', () => {
  test('the storefront calls the Contentstack Delivery API on page load', async ({ page }) => {
    const responses = trackContentstackResponses(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(
      responses.length,
      'expected at least one request to cdn.contentstack.io/v3/content_types/*/entries — ' +
        'none fired, so the app is not calling Contentstack at all on this page',
    ).toBeGreaterThan(0);
  });

  test('Contentstack responses are successful and contain entries', async ({ page }) => {
    const responses = trackContentstackResponses(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(responses.length).toBeGreaterThan(0);

    for (const res of responses) {
      expect(res.status(), `${res.url()} returned ${res.status()}`).toBe(200);

      const body = await res.json();
      const entryOrEntries = body.entries ?? body.entry;
      expect(
        entryOrEntries,
        `${res.url()} responded 200 but had no "entries"/"entry" field — not a valid ` +
          'Contentstack Delivery API payload',
      ).toBeTruthy();
    }
  });

  test('a non-CMS route (cart) queries Contentstack by URL and gets told "not mine"', async ({
    page,
  }) => {
    // Every route queries `landing_page` by its url (Contentstack's generic "page" content
    // type, not just the homepage) — cart has no such entry, so this asserts CS correctly
    // returns zero entries for it rather than assuming the call is skipped entirely.
    const responses = trackContentstackResponses(page);

    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    const pageQueries = responses.filter(
      (res) => res.url().includes('/content_types/landing_page/entries') && res.url().includes('query='),
    );
    expect(pageQueries.length, 'expected a landing_page-by-url query for /cart').toBeGreaterThan(0);

    for (const res of pageQueries) {
      const body = await res.json();
      expect(
        body.entries,
        `expected an empty entries array for /cart (no CS page owns this route); got ${JSON.stringify(body.entries)}`,
      ).toEqual([]);
    }
  });
});
