import { Injectable } from '@nestjs/common';
import { Product } from '../../entities/product.entity';
import { CreateProductDto } from '../../dto/create-product.dto';
import { ProductService } from '../../../product/product.services';
import { SellerSubscriptionService } from '../../../seller-subscription/services/seller-subscription.service';
import { ShopService } from '../../../shop/shop.service';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly shopService: ShopService,
    private readonly productService: ProductService,
    private readonly subscriptionService: SellerSubscriptionService,
  ) {}

  async execute(
    sellerId: string,
    shopId: string,
    createDto: CreateProductDto,
  ): Promise<Product> {
    // Step 1 - Validate subscription
    await this.subscriptionService.validSubscriptionGuard(sellerId);

    // Step 2 - Validate the shop ownership
    await this.shopService.findOne(shopId, sellerId);

    // Step 3 - alway make sure the newly create product is not on shelf at default
    createDto.onShelf = false;
    return this.productService.create(sellerId, shopId, createDto);
  }
}
