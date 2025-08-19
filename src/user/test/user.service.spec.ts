/**
 *  To run this test solely:
 *
 *  npm run test -- user/test/user.service.spec.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { UserRepository } from '../user.repository';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let user: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        CacheModule.register({ isGlobal: true }),
        DatabaseModule,
      ],
      providers: [UserService, UserRepository],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('test 1 - should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test 2 - should create a new user', async () => {
    const dto: CreateUserDto = { email: 'test@example.com', mainId: '123' };
    const user = await service.create(dto);

    expect(user).toBeInstanceOf(User);
    expect(user.email).toBe(dto.email);
    expect(user.mainId).toBe(dto.mainId);
    await service.remove(user.id);
  });

  it('test 3 - should find user by id', async () => {
    const dto: CreateUserDto = { email: 'findme@example.com', mainId: '456' };
    user = await service.create(dto);

    const found = await service.findOne(user.id);
    expect(found.id).toBe(user.id);
    await service.remove(user.id);
  });

  it('test 4 - should throw NotFoundException for non-existent user', async () => {
    await expect(service.findOne('non-existent-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('test 5 - should remove a user', async () => {
    const dto: CreateUserDto = { email: 'toremove@example.com', mainId: '789' };
    const user = await service.create(dto);

    try {
      await service.remove(user.id);
      await service.findOne(user.id);
      fail('should raise error');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it('test 6 - should soft delete and restore a user', async () => {
    const dto: CreateUserDto = {
      email: 'softdelete@example.com',
      mainId: '999',
    };
    let user = await service.create(dto);
    expect(user.deletedAt).toBeUndefined();

    await service.softDelete(user.id);
    user = await service.findOne(user.id);
    expect(user.deletedAt).toBeDefined();

    await service.restore(user.id);
    user = await service.findOne(user.id);
    expect(user.deletedAt).toBeUndefined();

    await service.remove(user.id);
  });
});
