import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Product } from '../../entities/product.entity';
import { ProductService } from '../../product.services';
import { ShopService } from '../../../shop/shop.service';
import { SellerSubscriptionService } from '../../../seller-subscription/services/seller-subscription.service';
import { Products } from '../../../seller-subscription/entities/vo/product.vo';

@Injectable()
export class SetProductOnShelfUseCase {
  constructor(
    private readonly shopService: ShopService,
    private readonly productService: ProductService,
    private readonly subscriptionService: SellerSubscriptionService,
  ) {}

  async execute(
    sellerId: string, // Passed from the middleware
    shopId: string,
    productId: string,
    isOnShelf: boolean,
  ): Promise<Product> {
    // Step 1 - Validate subscription
    const validSubscription =
      await this.subscriptionService.validSubscriptionGuard(sellerId);

    // Step 1 - Validate the shop ownership
    await this.shopService.findOne(shopId, sellerId);

    // Step 2 - Find the subscription item that controls listing quota
    const listingSubscriptionItem = validSubscription.items.find(
      (item) => item.category === 'LISTING_SUBSCRIPTION',
    );

    if (!listingSubscriptionItem?.productCode) {
      throw new InternalServerErrorException(
        "Product's code missing in subscription",
      );
    }

    // Max number of products allowed on-shelf
    const maximumOnShelfQuota =
      Products[listingSubscriptionItem.productCode].listingNo;

    // Step 3 - Get all onshelf products for this seller & shop
    const currentlyOnShelfProducts =
      await this.productService.findAllOnShelfByShopId(shopId);

    // Step 4 - Check if turning on-shelf would exceed quota
    if (
      isOnShelf &&
      currentlyOnShelfProducts.totalRecords + 1 > maximumOnShelfQuota
    ) {
      throw new BadRequestException('Exceed maximum on-shelf quota');
    }

    // Step 5 - check if the product has the shipping profile attached
    const currentProduct = await this.productService.findOne(productId, shopId);
    const newProduct: Product = {
      ...currentProduct,
      ...{ onShelf: isOnShelf },
    };

    if (
      isOnShelf === true &&
      (!newProduct.shippingProfileId ||
        typeof newProduct.shippingProfileId !== 'string')
    ) {
      throw new BadRequestException(
        'Cannot mark a product as "on shelf" without a valid shipping profile.',
      );
    }
    // Step 6 - Update product onShelf status
    return this.productService.noCheckingUpdate(productId, newProduct);
  }
}
