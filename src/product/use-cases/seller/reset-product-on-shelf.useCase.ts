import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductService } from '../../product.services';
import { ShopService } from '../../../shop/shop.service';
import { SellerSubscriptionService } from '../../../seller-subscription/services/seller-subscription.service';
import { Products } from '../../../seller-subscription/entities/vo/product.vo';
import { OnEvent } from '@nestjs/event-emitter';
/**
 * Use case triggered by a webhook to reset a seller’s on-shelf products.
 *
 * Example:
 *  - A seller currently has 20 products on shelf.
 *  - Their plan is downgraded to allow only 10 on-shelf products.
 *
 * This function will automatically turn off shelf the excess products
 * (in this case, 10 products) to comply with the new plan limits.
 */

@Injectable()
export class ResetProductOnShelfUseCase {
  constructor(
    private readonly shopService: ShopService,
    private readonly productService: ProductService,
    private readonly subscriptionService: SellerSubscriptionService,
  ) {}

  @OnEvent('product.usecase.resetProductOnShelfUseCase.event', { async: true })
  async execute(sellerId: string) {
    console.log(
      'product.usecase.resetProductOnShelfUseCase.event trigger !!!!',
    );
    // Step 1 - Validate subscription
    const validSubscription =
      await this.subscriptionService.validSubscriptionGuard(sellerId);

    // Step 2 - Find the shop
    const shop = await this.shopService.findOneBySellerId(sellerId);

    // Step 3 - Find the subscription item that controls listing quota
    const listingSubscriptionItem = validSubscription.items.find(
      (item) => item.category === 'LISTING_SUBSCRIPTION',
    );

    if (!listingSubscriptionItem?.productCode) {
      throw new InternalServerErrorException(
        "Product's code missing in subscription",
      );
    }

    // Step 4 - Max number of products allowed on-shelf
    const maximumOnShelfQuota =
      Products[listingSubscriptionItem.productCode].listingNo;

    // Step 5 - Get all onshelf products for this seller & shop
    const currentlyOnShelfProducts =
      await this.productService.findAllOnShelfByShopId(shop.id);

    // Step 6 - Check how many need to be off shelf
    const numberToOffShelf = Math.max(
      currentlyOnShelfProducts.totalRecords - maximumOnShelfQuota,
      0,
    );

    // Step 7 - if not excess, exit
    if (numberToOffShelf <= 0) {
      return;
    }

    // Step 8 - if  excess, dig out all the excess product
    const products = await this.productService.findExcessOnShelfByShopId(
      shop.id,
      maximumOnShelfQuota,
    );

    // Step 9 - set them on shelf to be false
    await Promise.all(
      products.map((p) => {
        p.onShelf = false;
        return this.productService.noCheckingUpdate(shop.id, p);
      }),
    );
  }
}
