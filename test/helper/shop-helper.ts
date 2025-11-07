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
    country: 'UK',
    attributes: { category: 'Books' },
  };

  return await setupShopUseCase.execute(testSellerId, dto);
}

export async function createTestShop2(
  testSellerId: string,
  setupShopUseCase: SetupShopUseCase,
): Promise<{ shop: Shop; shipping: SellerShipping }> {
  const dto: CreateShopDto = {
    name: 'Test Shop 2',
    description: 'My first shop 2',
    country: 'UK',
    attributes: { category: 'cup' },
  };

  return await setupShopUseCase.execute(testSellerId, dto);
}

export async function createTestShop3(
  testSellerId: string,
  setupShopUseCase: SetupShopUseCase,
): Promise<{ shop: Shop; shipping: SellerShipping }> {
  const dto: CreateShopDto = {
    name: 'Test Shop 3',
    description: 'My first shop 3',
    country: 'UK',
    attributes: { category: 'books' },
  };
  return await setupShopUseCase.execute(testSellerId, dto);
}

export async function createTestShop4(
  testSellerId: string,
  setupShopUseCase: SetupShopUseCase,
): Promise<{ shop: Shop; shipping: SellerShipping }> {
  const dto: CreateShopDto = {
    name: 'Test Shop 4',
    description: 'My first shop 4',
    country: 'UK',
    attributes: { category: 'clothes' },
  };
  return await setupShopUseCase.execute(testSellerId, dto);
}

export async function createTestShop5(
  testSellerId: string,
  setupShopUseCase: SetupShopUseCase,
): Promise<{ shop: Shop; shipping: SellerShipping }> {
  const dto: CreateShopDto = {
    name: 'Test Shop 5',
    description: 'My first shop 5',
    country: 'UK',
    attributes: { category: 'toys' },
  };
  return await setupShopUseCase.execute(testSellerId, dto);
}

export async function createTestShop6(
  testSellerId: string,
  setupShopUseCase: SetupShopUseCase,
): Promise<{ shop: Shop; shipping: SellerShipping }> {
  const dto: CreateShopDto = {
    name: 'Test Shop 6',
    description: 'My first shop 6',
    country: 'UK',
    attributes: { category: 'furniture' },
  };
  return await setupShopUseCase.execute(testSellerId, dto);
}
