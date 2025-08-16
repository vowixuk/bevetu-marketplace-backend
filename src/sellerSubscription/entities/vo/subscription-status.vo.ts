export type SubscriptionStatusType =
  /**
   * The subscription is still effective
   */
  | 'ACTIVE'

  /**
   * The subscription is completely cancelled. Subscription is not effective anymore
   */
  | 'CANCELLED'

  /**
   * The subscription is cancelling. Subscription will be effective untill the end of the subscription period
   */
  | 'CANCELLING'

  /**
   * Billing Error. Subscription is not effective untill payment is made.
   */
  | 'PAYMENT_FAILED';
