import { Controller, Post, Req, Body, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { IRequest } from '../auth/middlewares/auth.middleware';
import { SellerSubscriptionService } from './services/seller-subscription.service';

import {
  ApiCancelListingSubscription,
  ApiCreatelistingSubscriptionPaymentLink,
  ApiDowngradeListingSubscription,
  ApiRestoreSubscription,
  ApiUpgradeListingSubscription,
  ApiViewPreviewProrationAmount,
  ApiViewUserActiveSubscription,
} from './sellerSubscription.swagger';

import {
  CancelListingSubscriptionReturnSchema,
  CreatelistingSubscriptionPaymentLinkReturnSchema,
  DowngradeListingSubscriptionReturnSchema,
  PreviewProrationAmountkReturnSchema,
  RestoreListingSubscriptionReturnSchema,
  UpdateListingSubscriptionReturnSchema,
  ViewUserActiveSubscriptionReturnSchema,
} from './sellerSubscription.types';

import {
  CreatelistingSubscriptionPaymentLinkDto,
  PreviewProrationAmountDto,
  UpgradeListingSubscriptionDto,
  DowngradeListingSubscriptionDto,
  CancelListingSubscriptionDto,
} from './dto';

@ApiTags('Seller Subscription')
@Controller({ path: 'seller-subscriptions', version: '1' })
export class SellerSubscriptionController {
  constructor(
    private readonly sellerSubscriptionService: SellerSubscriptionService,
  ) {}

  @Post('listing-subscription-payment-link')
  @ApiCreatelistingSubscriptionPaymentLink()
  async createlistingSubscriptionPaymentLink(
    @Req() req: IRequest,
    @Body() dto: CreatelistingSubscriptionPaymentLinkDto,
  ): Promise<CreatelistingSubscriptionPaymentLinkReturnSchema> {
    const paymentLink =
      await this.sellerSubscriptionService.getListingSubscriptionPaymentLink(
        req.middleware.userId,
        req.middleware.seller!.id,
        req.middleware.buyer.stripeCustomerId,
        req.middleware.email,
        dto.productCode,
        dto.promotionCode,
      );
    return {
      paymentLink,
    };
  }

  @Get('preview-proration-amount')
  @ApiViewPreviewProrationAmount()
  async previewProrationAmount(
    @Req() req: IRequest,
    @Query() dto: PreviewProrationAmountDto,
  ): Promise<PreviewProrationAmountkReturnSchema> {
    return await this.sellerSubscriptionService.previewProrationAmount(
      req.middleware.seller!.id,
      dto.productCode,
      null,
    );
  }

  @Post('upgrade-listing-subscription')
  @ApiUpgradeListingSubscription()
  async upgradeListingSubscription(
    @Req() req: IRequest,
    @Body() dto: UpgradeListingSubscriptionDto,
  ): Promise<UpdateListingSubscriptionReturnSchema> {
    return this.sellerSubscriptionService.upgradeListingSubscription(
      req.middleware.seller!.id,
      dto.productCode,
      null,
    );
  }

  @Post('downgrade-listing-subscription')
  @ApiDowngradeListingSubscription()
  async downgradeListingSubscription(
    @Req() req: IRequest,
    @Body() dto: DowngradeListingSubscriptionDto,
  ): Promise<DowngradeListingSubscriptionReturnSchema> {
    return this.sellerSubscriptionService.downgradeListingSubscription(
      req.middleware.seller!.id,
      dto.productCode,
      null,
    );
  }

  @Post('cancel')
  @ApiCancelListingSubscription()
  async cancelSubscription(
    @Req() req: IRequest,
    @Body() cancelSubscriptionDto: CancelListingSubscriptionDto,
  ): Promise<CancelListingSubscriptionReturnSchema> {
    return this.sellerSubscriptionService.cancellingSubscription(
      req.middleware.seller!.id,
      null,
      cancelSubscriptionDto.cancelReason,
    );
  }

  @Post('restore')
  @ApiRestoreSubscription()
  async restoreSubscription(
    @Req() req: IRequest,
  ): Promise<RestoreListingSubscriptionReturnSchema> {
    return this.sellerSubscriptionService.restoreSubscription(
      req.middleware.seller!.id,
      null,
    );
  }

  @Get('me')
  @ApiViewUserActiveSubscription()
  async viewUserActiveSubscription(
    @Req() req: IRequest,
  ): Promise<ViewUserActiveSubscriptionReturnSchema> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, sellerId, ...subscriptionData } =
      await this.sellerSubscriptionService.findOne(
        req.middleware.seller!.id,
        null,
      );
    return subscriptionData;
  }
}
