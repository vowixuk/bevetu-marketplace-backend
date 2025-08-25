import {
  IProduct,
  IProductCode,
} from '../../src/seller-subscription/entities/vo/product.vo';
import { SellerSubscriptionService } from '../../src/seller-subscription/services/seller-subscription.service';
import { CompleteSellerListingSubscriptionEnrollmentDto } from '../../src/seller-subscription/dto/complete-seller-listing-subscription-enrollment.dto';
import { SellerSubscription } from '../../src/seller-subscription/entities/seller-subscription.entity';
import { SellerSubscriptionMapping } from '../../src/stripe/entities/seller-subscription-mapping.entity';
import puppeteer from 'puppeteer';
import { StripeService } from '../../src/stripe/services/stripe.service';

export async function testEnrollSubscription(
  testUserId: string,
  email: string,
  sellerId: string,
  buyerId: string,
  productCode: IProductCode,
  stripeCustomerId: string,
  sellerSubscriptionService: SellerSubscriptionService,
  stripeService: StripeService,
): Promise<{
  subscription: SellerSubscription;
  subscriptionMapping: SellerSubscriptionMapping;
  currentProduct: IProduct;
}> {
  const paymentUrl =
    await sellerSubscriptionService.getListingSubscriptionPaymentLink(
      testUserId,
      sellerId,
      stripeCustomerId,
      email,
      productCode,
      null,
    );
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(paymentUrl);
    await page.waitForSelector('#cardNumber');
    // await page.type('#email', user.email);
    await page.type('#cardNumber', '4242424242424242');
    await page.type('#cardExpiry', '12/34');
    await page.type('#cardCvc', '123');
    await page.type('#billingName', 'testing user in marketplace');
    await page.type('#billingPostalCode', 'M50 2AJ');
    await page.click('.SubmitButton');
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle0',
        timeout: 30000,
      }),
      page.click('.SubmitButton'),
    ]);
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
  }

  const subscriptionDetails =
    await stripeService.getSubscriptionDetailsByCustomerId(stripeCustomerId);

  const bevetuSellerSubscriptionId =
    await sellerSubscriptionService.completeSellerListingSubscriptionEnrollment(
      Object.assign(new CompleteSellerListingSubscriptionEnrollmentDto(), {
        stripeCustomerId: subscriptionDetails.stripeCustomerId,
        stripeSubscriptionId: subscriptionDetails.stripeSubscriptionId,
        stripeSubscriptionItemId: subscriptionDetails.stripeSubscriptionItemId,
        userId: testUserId,
        buyerId: buyerId,
        sellerId: sellerId,
        productCode,
        amount: subscriptionDetails.amount,
        currency: subscriptionDetails.currency,
        quantity: subscriptionDetails.quantity,
      }),
    );

  return await sellerSubscriptionService.findCurrentSubscriptionAndMapping(
    sellerId,
    bevetuSellerSubscriptionId,
  );
}
