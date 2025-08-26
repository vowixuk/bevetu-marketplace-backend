import { Injectable } from '@nestjs/common';
import { ShopService } from '../shop.service';
import { SellerShippingService } from '../../seller-shipping/services/seller-shipping.service';
import { CreateShopDto } from '../dto/create-shop.dto';
import { CreateSellerShippingDto } from '../../seller-shipping/dto/create-seller-shipping.dto';
import { Shop } from '../entities/shop.entity';
import { SellerShipping } from '../../seller-shipping/entities/seller-shipping.entity';
@Injectable()
export class SetupShopUseCase {
  constructor(
    private readonly shopService: ShopService,
    private readonly shippingService: SellerShippingService,
  ) {}

  async execute(
    sellerId: string,
    createShopDto: CreateShopDto,
  ): Promise<{ shop: Shop; shipping: SellerShipping }> {
    // Step 1 - Create Shop
    const shop = await this.shopService.create(sellerId, createShopDto);

    // Step 2 - Create Shipping Obj attaching to the shop
    const shipping = await this.shippingService.create(
      sellerId,
      Object.assign(new CreateSellerShippingDto(), { shopId: shop.id }),
    );

    return {
      shop,
      shipping,
    };
  }
}
