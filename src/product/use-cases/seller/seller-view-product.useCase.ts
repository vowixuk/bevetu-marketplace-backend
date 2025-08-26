import { Injectable } from '@nestjs/common';
import { Product } from '../../entities/product.entity';
import { ProductService } from '../../product.services';
import { SellerSubscriptionService } from '../../../seller-subscription/services/seller-subscription.service';
import { ShopService } from '../../../shop/shop.service';
@Injectable()
export class SellerViewProductUseCase {
  constructor(
    private readonly shopService: ShopService,
    private readonly productService: ProductService,
    private readonly subscriptionService: SellerSubscriptionService,
  ) {}

  async execute(
    sellerId: string,
    shopId: string,
    productId: string,
  ): Promise<Product> {
    // Step 1 - Validate subscription
    await this.subscriptionService.validSubscriptionGuard(sellerId);

    // Step 2 - Validate the shop ownership
    await this.shopService.findOne(shopId, sellerId);

    return await this.productService.findOne(productId, shopId);
  }
}
