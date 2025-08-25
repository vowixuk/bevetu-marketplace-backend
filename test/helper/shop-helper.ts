import { ShopService } from '../../src/shop/shop.service';
import { CreateShopDto } from '../../src/shop/dto/create-shop.dto';
import { Shop } from '../../src/shop/entities/shop.entity';

export async function createTestShop(
  testSellerId: string,
  shopService: ShopService,
): Promise<Shop> {
  const dto: CreateShopDto = {
    name: 'Test Shop',
    description: 'My first shop',
    country: 'US',
    attributes: { category: 'Books' },
  };

  return await shopService.create(testSellerId, dto);
}
