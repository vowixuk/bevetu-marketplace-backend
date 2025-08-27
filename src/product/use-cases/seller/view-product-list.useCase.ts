import { Injectable } from '@nestjs/common';
import { Product } from '../../entities/product.entity';
import { ProductService } from '../../product.services';
import { SellerSubscriptionService } from '../../../seller-subscription/services/seller-subscription.service';
import { ViewProductsDto } from '../../../product/dto/view-products.dto';
import { ShopService } from '../../../shop/shop.service';
@Injectable()
export class ViewProductListUseCase {
  constructor(
    private readonly shopService: ShopService,
    private readonly productService: ProductService,
    private readonly subscriptionService: SellerSubscriptionService,
  ) {}

  async execute(
    sellerId: string,
    shopId: string,
    viewProductDto: ViewProductsDto,
  ): Promise<{
    products: Omit<Product, 'sellerId'>[];
    currentPage: number; // current page of this return
    limit: number; // no of record in this return
    totalRecords: number; // Total number record in the database
    totalPages: number; // Total page
    start: number; // This return start from x record.
    end: number; // This return end to y record.
    next: string | null; // url of next page
    prev: string | null; // url of previous page
  }> {
    // Step 1 - Validate subscription
    await this.subscriptionService.validSubscriptionGuard(sellerId);

    // Step 2 - Validate the shop ownership
    await this.shopService.findOne(shopId, sellerId);

    const productlist = await this.productService.findBySellerIdAndShopId(
      sellerId,
      shopId,
      viewProductDto.page,
      viewProductDto.limit,
    );

    return {
      ...productlist,
      ...{
        products: productlist.products.map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ sellerId, ...productData }) => productData,
        ),
      },
    };
  }
}
