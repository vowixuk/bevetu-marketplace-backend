/**
 *  To run this test solely:
 *
 *  npm run test -- shop/test/shop.service.spec.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ShopService } from '../shop.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { ShopRepository } from '../shop.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateShopDto } from '../dto/create-shop.dto';
import { UpdateShopDto } from '../dto/update-shop.dto';
import { SellerService } from '../../seller/services/seller.service';
import { SellerRepository } from '../../seller/seller.repository';
import { UserModule } from '../../user/user.module';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entities/user.entity';

import {
  createTestUser_1,
  createTestUser_2,
  removeTestingUser,
} from '../../../test/helper/user-helper';
import { createActiveTestSeller } from '../../../test/helper/seller-helper';

describe('ShopService', () => {
  let service: ShopService;
  let sellerService: SellerService;
  let userService: UserService;
  let testUser: User;
  let anotherUser: User;
  let testSellerId: string;
  let anotherSellerId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        CacheModule.register({ isGlobal: true }),
        DatabaseModule,
        UserModule,
      ],
      providers: [ShopService, ShopRepository, SellerService, SellerRepository],
    }).compile();

    service = module.get<ShopService>(ShopService);
    sellerService = module.get<SellerService>(SellerService);
    userService = module.get<UserService>(UserService);

    testUser = await createTestUser_1(userService);
    anotherUser = await createTestUser_2(userService);

    const seller1 = await createActiveTestSeller(testUser.id, sellerService);
    const seller2 = await createActiveTestSeller(anotherUser.id, sellerService);

    testSellerId = seller1.id;
    anotherSellerId = seller2.id;
  });

  afterAll(async () => {
    await removeTestingUser(userService, testUser.id);
    await removeTestingUser(userService, anotherUser.id);
  });

  it('test 1 - should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test 2 - should create a new shop', async () => {
    const dto: CreateShopDto = {
      name: 'Test Shop',
      description: 'My first shop',
      country: 'US',
      attributes: { category: 'Books' },
    };

    const shop = await service.create(testSellerId, dto);

    expect(shop.name).toBe('Test Shop');
    expect(shop.description).toBe('My first shop');
    expect(shop.attributes.category).toBe('Books');

    await service.remove(shop.id, testSellerId);
  });

  it('test 3 - should find a shop by id', async () => {
    const dto: CreateShopDto = {
      name: 'FindShop',
      description: 'Shop to find',
      country: 'CA',
    };

    const shop = await service.create(testSellerId, dto);
    const found = await service.findOne(shop.id, testSellerId);

    expect(found.id).toBe(shop.id);
    expect(found.name).toBe('FindShop');

    await service.remove(shop.id, testSellerId);
  });

  it('test 4 - should throw NotFoundException for non-existent shop', async () => {
    try {
      await service.findOne('non-existent-id', testSellerId);
      fail('should raise error');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it('test 5 - should throw ForbiddenException if shop belongs to another seller', async () => {
    const dto: CreateShopDto = {
      name: 'OtherSellerShop',
      description: 'Invalid access test',
      country: 'UK',
    };

    const shop = await service.create(testSellerId, dto);

    try {
      await service.findOne(shop.id, anotherSellerId);
      fail('should raise error');
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    }

    await service.remove(shop.id, testSellerId);
  });

  it('test 6 - should update a shop', async () => {
    const dto: CreateShopDto = {
      name: 'BeforeUpdate',
      description: 'Old description',
      country: 'FR',
    };

    const shop = await service.create(testSellerId, dto);

    const updateDto: UpdateShopDto = {
      name: 'AfterUpdate',
      description: 'New description',
    };

    const updated = await service.update(shop.id, testSellerId, updateDto);

    expect(updated.name).toBe('AfterUpdate');
    expect(updated.description).toBe('New description');

    await service.remove(shop.id, testSellerId);
  });

  it('test 7 - should remove a shop', async () => {
    const dto: CreateShopDto = {
      name: 'RemoveShop',
      description: 'To be removed',
      country: 'DE',
    };

    const shop = await service.create(testSellerId, dto);

    try {
      await service.remove(shop.id, testSellerId);
      await service.findOne(shop.id, testSellerId);
      fail('should raise error');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });
});
