import { ForbiddenException, Injectable } from '@nestjs/common';
import { Product } from '../../entities/product.entity';
import { ProductService } from '../../product.services';
import { SellerSubscriptionService } from 'test/helper/testing-module';
import { UpdateProductDto } from 'src/product/dto/update-product.dto';
import { ShopService } from '../../../shop/shop.service';
@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly shopService: ShopService,
    private readonly productService: ProductService,
    private readonly subscriptionService: SellerSubscriptionService,
  ) {}

  async execute(
    productId: string,
    sellerId: string,
    shopId: string,
    updateDto: UpdateProductDto,
  ): Promise<Product> {
    // Step 1 - Check if vaid subscription
    await this.subscriptionService.validSubscriptionGuard(sellerId);

    // Step 2 - Validate the shop ownership
    await this.shopService.findOne(shopId, sellerId);

    // Step 3 - not allow update the following key throw this use case:
    // isApproved
    // onShelf
    if (updateDto.onShelf || updateDto.isApproved) {
      throw new ForbiddenException(
        '`isApproved` and `onShelf` cannot be modified through this operation.',
      );
    }
    return this.productService.update(productId, shopId, updateDto);
  }
}
