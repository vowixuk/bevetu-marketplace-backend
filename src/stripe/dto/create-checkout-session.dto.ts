export class CreateCheckoutSessionDto {
  stripePriceId: string; // Price ID for Stripe
  mode: 'subscription' | 'payment'; // Mode of checkout
  quantity: number; // Quantity of the product
  success_url: string; // Redirect on success
  cancel_url: string; // Redirect on cancel
  promotionCode?: string; // Optional promotion code
  metadata: {
    email: string;
    userId: string;
    productCode: string;
    seatNo?: string;
    action: string;
    [key: string]: any; // Allows other optional metadata fields
  };
}
