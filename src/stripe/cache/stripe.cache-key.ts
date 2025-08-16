/*
 * This key store the stripe webhook event id
 * It is to prevent the webhook send duplicated event to our server.
 */
export const stripeWebhookEventKey = (id: string) =>
  `stripe-webhook:event#${id}`;
