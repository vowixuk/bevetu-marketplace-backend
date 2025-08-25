import { Injectable } from '@nestjs/common';
import { Product } from '../../entities/product.entity';
import { ProductService } from '../../product.services';
import { ViewProductsDto } from '../../dto/view-products.dto';
import { ShopService } from '../../../shop/shop.service';
@Injectable()
export class ViewProductFromMultipleShopUseCase {
  constructor(
    private readonly productService: ProductService,
    private readonly shopService: ShopService,
  ) {}

  /**
   * Fetches products for the marketplace dashboard with associated shop information.
   */
  async execute(viewProductDto: ViewProductsDto): Promise<{
    products: Omit<
      Product,
      'reservedStock' | 'isApproved' | 'onShelf' | 'sellerId'
    >[];
    currentPage: number; // current page of this return
    limit: number; // no of record in this return
    totalRecords: number; // Total number record in the database
    totalPages: number; // Total page
    start: number; // This return start from x record.
    end: number; // This return end to y record.
    next: string | null; // url of next page
    prev: string | null; // url of previous page
  }> {
    // Step 1 - Get all the product from vairous shops
    const _products = await this.productService.findAllOnShelf(
      viewProductDto.page,
      viewProductDto.limit,
    );

    // Step 2 - Base on the id otained, get the basic info of the shop
    const shopIds = Array.from(
      new Set(_products.products.map((p) => p.shopId)),
    );
    const shopBasicInfo =
      await this.shopService.findShopsBasicInfoByIds(shopIds);

    // Step 3 - Mapping the product and the shop info
    const shopMap = Object.fromEntries(
      shopBasicInfo.map((shop) => [shop.id, shop]),
    );
    const productWithShopData = _products.products.map((product) => ({
      ...product,
      shop: shopMap[product.shopId],
    }));

    return { ..._products, products: productWithShopData };
  }
}
