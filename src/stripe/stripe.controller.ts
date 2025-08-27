import { Controller } from '@nestjs/common';
import { StripeService } from './services/stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  /* *********************************************************************
   *                        ----- Testing use -----
   * The following routes are intended exclusively for testing purposes.
   *
   * They are specifically designed to modify datafor testing scenarios
   * and to clean up test data generated during end-to-end (e2e) testing.
   *
   * !!! THESE ROUTES MUST NEVER BE USED IN A PRODUCTION ENVIRONMENT !!!
   *
   * Ensure that each route below is secured with
   * @UseGuards(TestEnvironmentGuard) to restrict access.
   * **********************************************************************/

  /**
   * @caution Testing Only. Do not use in production
   * @purpose 1) Delete the subscription in Stripe immediately.
   * Wehbook event 'customer.subscription.deleted' will be triggered.
   * 2) clear the testing subscription in Stripe
   *
   * @remark The subscription record in bevetu database will not be deleted
   */
  @Delete(':subscriptionId/stripe')
  // @ApiDeleteSubscriptionInStripe()
  @UseGuards(TestEnvironmentGuard)
  async deleteSubscriptionInStripe(
    @Req() req: IRequest,
    @Param('subscriptionId') bevetuSubscriptionId: string,
  ): Promise<UpdateReturnSchema> {
    await this.subscriptionUseCase.cancelSubscriptionInStripe(
      req.middleware.seller?.id,
      bevetuSubscriptionId,
    );
    return { message: 'deleted' };
  }

    /**
     * @caution Testing Only. Do not use in production
     * @purpose To fetch the Stripe subscription details directly from Stripe.
     * So as to check if the action subscription function effective on Stripe
     * @examples Trigger the change seat no function, and then call this function
     * to check if Stripe update the seat number
     */
    @Get(':subscriptionId/stripe')
    @ApiViewStripeSubscription()
    @UseGuards(TestEnvironmentGuard)
    async viewStripeSubscription(
      @Req() req: IRequest,
      @Param('subscriptionId') bevetuSubscriptionId: string,
    ): Promise<Stripe.Response<Stripe.Subscription>> {
      return this.subscriptionUseCase.findStripeSubscription(
        req.middleware.userId,
        bevetuSubscriptionId,
      );
    }

    /**
     * @caution Testing Only. Do not use in production
     * @purpose Delete the customer in Stripe after testing
     */
    @Delete(':subscriptionId/stripe/customers')
    @UseGuards(TestEnvironmentGuard)
    @HttpCode(204)
    @ApiDeleteStripeCustomer()
    async deleteStripeCustomer(
      @Req() req: IRequest,
      @Param('subscriptionId') bevetuSubscriptionId: string,
    ): Promise<void> {
      await this.subscriptionUseCase.deleteStripeCustomer(
        req.middleware.userId,
        bevetuSubscriptionId,
      );
    }

    /**
     * @caution Testing Only. Do not use in production
     * @purpose Advance the test clock to trigger the webhook event
     * @remark `subscriptionId` required for future validation use.
     */
    @Post(':subscriptionId/stripe/test-clock/:testClockId')
    @UseGuards(TestEnvironmentGuard)
    @HttpCode(204)
    @ApiAdvanceTestClock()
    async advanceTestClock(
      @Param('testClockId') testClockId: string,
      @Body('advanceDay') advanceDay: number,
    ): Promise<void> {
      await this.subscriptionUseCase.advanceTestClock(testClockId, advanceDay);
    }
}
