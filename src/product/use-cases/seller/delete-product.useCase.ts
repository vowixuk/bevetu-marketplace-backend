import { Injectable } from '@nestjs/common';
import { Product } from '../../entities/product.entity';
import { ProductService } from '../../product.services';
import { SellerSubscriptionService } from '../../../seller-subscription/services/seller-subscription.service';
import { ShopService } from '../../../shop/shop.service';
@Injectable()
export class DeleteProductUseCase {
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
    // Step 1 - Check if vaid subscription
    await this.subscriptionService.validSubscriptionGuard(sellerId);

    // Step 2 - Validate the shop ownership
    await this.shopService.findOne(shopId, sellerId);

    // Step 3 - not allow update the following key throw this use case:
    return this.productService.remove(productId, shopId);
  }
}
