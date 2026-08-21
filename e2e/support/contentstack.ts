import { Page, Response } from '@playwright/test';

/** Host the Delivery SDK calls for `Region.US` (see src/environments/contentstack.environment.ts). */
export const CONTENTSTACK_CDN_HOST = 'cdn.contentstack.io';
export const CONTENTSTACK_ASSET_HOST = 'images.contentstack.io';

export function isContentstackEntriesRequest(url: string): boolean {
  return (
    url.includes(CONTENTSTACK_CDN_HOST) && /\/v3\/content_types\/[^/]+\/entries/.test(url)
  );
}

/**
 * Starts collecting every Contentstack Delivery API response for a page. Call before
 * navigating; read `.responses` after `page.goto()`/`waitForLoadState('networkidle')`.
 */
export function trackContentstackResponses(page: Page) {
  const responses: Response[] = [];
  page.on('response', (res) => {
    if (isContentstackEntriesRequest(res.url())) {
      responses.push(res);
    }
  });
  return responses;
}

/**
 * Walks a Contentstack entry JSON body and pulls out every asset URL it references
 * (`images.contentstack.io`). Used to fingerprint "this DOM element's src came from this
 * API response" without hardcoding entry/asset UIDs that will drift as content changes.
 */
export function extractAssetUrls(value: unknown, found: Set<string> = new Set()): Set<string> {
  if (typeof value === 'string') {
    if (value.includes(CONTENTSTACK_ASSET_HOST)) {
      found.add(value);
    }
  } else if (Array.isArray(value)) {
    value.forEach((v) => extractAssetUrls(v, found));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => extractAssetUrls(v, found));
  }
  return found;
}
