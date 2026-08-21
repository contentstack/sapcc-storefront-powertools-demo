import { expect, test } from '@playwright/test';

/**
 * `data-cslp` format is `{content_type_uid}.{entry_uid}.{locale}[.{field}…]`
 * (see contentstack-spartacus-connector/src/live-preview/tag-entry-tree.ts).
 */
const CSLP_PATTERN = /^[^.]+\.[^.]+\.[a-z]{2}-[a-z]{2}(\..+)?$/;

/**
 * Live Preview is force-disabled unless `delivery.livePreview`, a `previewToken`, AND dev
 * mode are all true (contentstack-client.service.ts) — and as of this writing the example
 * app's env generator (scripts/generate-contentstack-env.js) never writes a previewToken at
 * all, so it can't actually be turned on via `.env` yet. Set E2E_LIVE_PREVIEW_EXPECTED=true
 * once that's wired up (or when pointing this suite at an app build that has it) to assert
 * tags actually appear; otherwise this suite only asserts the (current, correct) off-state.
 */
const expectLivePreview = process.env.E2E_LIVE_PREVIEW_EXPECTED === 'true';

test.describe('Contentstack Live Preview edit tags', () => {
  test(
    expectLivePreview
      ? 'CS-sourced elements carry a data-cslp tag matching the active locale'
      : 'no data-cslp tags leak into the DOM when Live Preview is off',
    async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const tags = await page.locator('[data-cslp]').evaluateAll((els) =>
        els.map((el) => el.getAttribute('data-cslp')),
      );

      if (!expectLivePreview) {
        expect(
          tags,
          'found data-cslp attribute(s) in the DOM with Live Preview expected off — ' +
            'edit metadata is leaking into the public storefront',
        ).toEqual([]);
        return;
      }

      expect(tags.length, 'Live Preview is expected on but no data-cslp tags were found').toBeGreaterThan(0);

      const activeLocale = await page
        .locator('label:has-text("Language:") select')
        .inputValue();

      for (const tag of tags) {
        expect(tag, `malformed data-cslp tag: "${tag}"`).toMatch(CSLP_PATTERN);
        const [, , locale] = (tag as string).split('.');
        expect(
          locale.startsWith(activeLocale),
          `tag "${tag}" targets locale "${locale}", storefront is on "${activeLocale}"`,
        ).toBe(true);
      }
    },
  );
});
