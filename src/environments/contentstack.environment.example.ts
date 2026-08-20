import { Region } from '@contentstack/delivery-sdk';

/**
 * Template for Contentstack delivery credentials. Copy this file to
 * `contentstack.environment.ts` (gitignored) and fill in your own stack's values.
 * apiKey/deliveryToken are read-only, environment-scoped delivery credentials —
 * safe to ship in the client bundle, but keep them out of this repo's history
 * regardless so each fork/deployment uses its own stack.
 */
export const contentstackDelivery = {
  apiKey: '<STACK_API_KEY>',
  deliveryToken: '<DELIVERY_TOKEN>',
  environment: 'development',
  region: Region.US,
  livePreview: false,
};
