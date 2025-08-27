import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './services/stripe.service';
import type { IRequest } from 'src/auth/middlewares/auth.middleware';
import { TestEnvironmentGuard } from 'src/share/guards/testing-environmet.guard';
import {
  DeleteStripeCustomerReturnSchema,
  DeleteStripeSubscriptionReturnSchema,
  ViewStripeSubscriptionReturnSchema,
} from './stripe.type';
import {
  ApiAdvanceTestClock,
  ApiDeleteStripeCustomer,
  ApiDeleteSubscriptionInStripe,
  ApiViewStripeSubscription,
} from './stripe.swagger';
import { AdvanceTestClockDto } from './dto/advance-test-clock.dto';
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
  @ApiDeleteSubscriptionInStripe()
  @UseGuards(TestEnvironmentGuard)
  async deleteSubscriptionInStripe(
    @Req() req: IRequest,
  ): Promise<DeleteStripeSubscriptionReturnSchema> {
    await this.stripeService.cancelSubscriptionImmediately(
      req.middleware.buyer.stripeCustomerId,
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
  @Get()
  @ApiViewStripeSubscription()
  @UseGuards(TestEnvironmentGuard)
  async viewStripeSubscription(
    @Req() req: IRequest,
  ): Promise<ViewStripeSubscriptionReturnSchema> {
    return this.stripeService.getSubscriptionDetailsByCustomerId(
      req.middleware.buyer.stripeCustomerId,
    );
  }

  /**
   * @caution Testing Only. Do not use in production
   * @purpose Delete the customer in Stripe after testing
   */
  @Delete()
  @UseGuards(TestEnvironmentGuard)
  @HttpCode(204)
  @ApiDeleteStripeCustomer()
  async deleteStripeCustomer(
    @Req() req: IRequest,
  ): Promise<DeleteStripeCustomerReturnSchema> {
    await this.stripeService.removeStripeCustomer(
      req.middleware.buyer.stripeCustomerId,
    );
    return {
      message: 'deleted',
    };
  }

  /**
   * @caution Testing Only. Do not use in production
   * @purpose Advance the test clock to trigger the webhook event
   * @remark `subscriptionId` required for future validation use.
   */
  @Post('test-clock')
  @UseGuards(TestEnvironmentGuard)
  @HttpCode(204)
  @ApiAdvanceTestClock()
  async advanceTestClock(@Body() dto: AdvanceTestClockDto): Promise<void> {
    await this.stripeService.advanceTestClock(dto.testClockId, dto.advanceDay);
  }
}
