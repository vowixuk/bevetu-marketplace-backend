import { ShopService } from '../../src/shop/shop.service';
import { CreateShopDto } from '../../src/shop/dto/create-shop.dto';
import { Shop } from '../../src/shop/entities/shop.entity';
import { SetupShopUseCase } from './testing-module';
import { SellerShipping } from '../../src/seller-shipping/entities/seller-shipping.entity';

export async function createTestShop1(
  testSellerId: string,
  setupShopUseCase: SetupShopUseCase,
): Promise<{ shop: Shop; shipping: SellerShipping }> {
  const dto: CreateShopDto = {
    name: 'Test Shop 1',
    description: 'My first shop 1',
    country: 'US',
    attributes: { category: 'Books' },
  };

  return await setupShopUseCase.execute(testSellerId, dto);
}

export async function createTestShop2(
  testSellerId: string,
  shopService: ShopService,
): Promise<Shop> {
  const dto: CreateShopDto = {
    name: 'Test Shop 2',
    description: 'My first shop 2',
    country: 'US',
    attributes: { category: 'cup' },
  };

  return await shopService.create(testSellerId, dto);
}
