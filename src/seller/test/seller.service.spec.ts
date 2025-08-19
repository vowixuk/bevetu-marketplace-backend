/**
 *  To run this test solely:
 *
 *  npm run test -- seller/test/seller.service.spec.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SellerService } from '../services/seller.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { SellerRepository } from '../seller.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateSellerDto } from '../dto/create-seller.dto';
import { UpdateSellerDto } from '../dto/update-seller.dto';
import { UserModule } from '../../user/user.module';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entities/user.entity';

import {
  createTestUser_1,
  createTestUser_2,
  removeTestingUser,
} from '../../../test/helper/user-helper';

describe('SellerService', () => {
  let service: SellerService;
  let userService: UserService;
  let testUser: User;
  let anotherUser: User;

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
      providers: [SellerService, SellerRepository],
    }).compile();

    service = module.get<SellerService>(SellerService);
    userService = module.get<UserService>(UserService);

    testUser = await createTestUser_1(userService);
    anotherUser = await createTestUser_2(userService);
  });

  afterAll(async () => {
    await removeTestingUser(userService, testUser.id);
    await removeTestingUser(userService, anotherUser.id);
  });

  it('test 1 - should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test 2 - should create a new seller with attributes', async () => {
    const dto: CreateSellerDto = {
      status: 'ACTIVE',
      attributes: { shopName: 'My Shop', category: 'Books' },
    };

    const seller = await service.create(testUser.id, dto);

    expect(seller.status).toBe(dto.status);
    expect(seller.attributes.shopName).toBe('My Shop');
    expect(seller.attributes.category).toBe('Books');

    await service.remove(testUser.id, seller.id);
  });

  it('test 3 - should find seller by seller id', async () => {
    const dto: CreateSellerDto = {
      status: 'PENDING',
      attributes: { shopName: 'FindMe' },
    };

    const seller = await service.create(testUser.id, dto);
    const found = await service.findOne(testUser.id, seller.id);

    expect(found.id).toBe(seller.id);
    expect(found.status).toBe('PENDING');
    expect(found.attributes.shopName).toBe('FindMe');

    await service.remove(testUser.id, seller.id);
  });

  it('test 4 - should throw NotFoundException if seller does not exist', async () => {
    try {
      await service.findOne(testUser.id, 'non-existent-id');
      fail('should raise error');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it('test 5 - should throw ForbiddenException if seller belongs to another user', async () => {
    const dto: CreateSellerDto = {
      status: 'PENDING',
      attributes: { shopName: 'OtherUserShop' },
    };

    const seller = await service.create(testUser.id, dto);

    try {
      await service.findOne(anotherUser.id, seller.id);
      fail('should raise error');
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    }

    await service.remove(testUser.id, seller.id);
  });

  it('test 6 - should update a seller', async () => {
    const dto: CreateSellerDto = {
      status: 'PENDING',
      attributes: { shopName: 'BeforeUpdate' },
    };

    const seller = await service.create(testUser.id, dto);

    const updateDto: UpdateSellerDto = {
      status: 'ACTIVE',
      attributes: { shopName: 'AfterUpdate', rating: 5 },
    };

    let updated = await service.update(testUser.id, seller.id, updateDto);
    expect(updated.status).toBe('ACTIVE');
    expect(updated.attributes.shopName).toBe('AfterUpdate');
    expect(updated.attributes.rating).toBe(5);

    // will not change other field if partially update
    const updateDto2: UpdateSellerDto = {
      status: 'SUSPENDED',
    };

    updated = await service.update(testUser.id, seller.id, updateDto2);
    expect(updated.status).toBe('SUSPENDED');
    expect(updated.attributes.shopName).toBe('AfterUpdate');
    expect(updated.attributes.rating).toBe(5);

    const updateDto3: UpdateSellerDto = {
      attributes: { rating: 1 },
    };

    updated = await service.update(testUser.id, seller.id, updateDto3);
    expect(updated.status).toBe('SUSPENDED');
    expect(updated.attributes).toEqual({ rating: 1 });

    await service.remove(testUser.id, seller.id);
  });

  it('test 7 - should soft delete and restore a seller', async () => {
    const dto: CreateSellerDto = {
      status: 'ACTIVE',
      attributes: { shopName: 'SoftDeleteShop' },
    };

    let seller = await service.create(testUser.id, dto);
    expect(seller.deletedAt).toBeUndefined();

    await service.softDelete(testUser.id, seller.id);
    seller = await service.findOne(testUser.id, seller.id);
    expect(seller.deletedAt).toBeDefined();

    await service.restore(testUser.id, seller.id);

    seller = await service.findOne(testUser.id, seller.id);
    expect(seller.id).toBeDefined();
    expect(seller.deletedAt).toBeUndefined();

    await service.remove(testUser.id, seller.id);
  });

  it('test 8 - should remove a seller', async () => {
    const dto: CreateSellerDto = {
      status: 'SUSPENDED',
      attributes: { shopName: 'RemoveMeShop' },
    };

    const seller = await service.create(testUser.id, dto);

    try {
      await service.remove(testUser.id, seller.id);
      await service.findOne(testUser.id, seller.id);
      fail('should raise error');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });
});
