import { UserService } from '../../src/user/user.service';
import { CreateUserDto } from '../../src/user/dto/create-user.dto';
import { User } from '../../src/user/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

export async function createTestUser_1(
  userService: UserService,
): Promise<User> {
  const createUserDto = new CreateUserDto();
  createUserDto.email = 'testingUser1@bevetu.marketplace.com';
  createUserDto.mainId = 'Testing_1_mainId';
  return await userService.create(createUserDto);
}

export async function createTestUser_2(
  userService: UserService,
): Promise<User> {
  const createUserDto = new CreateUserDto();
  createUserDto.email = 'testingUser2@bevetu.marketplace.com';
  createUserDto.mainId = 'Testing_2_mainId';
  return await userService.create(createUserDto);
}

export async function createTestUser_3(
  userService: UserService,
): Promise<User> {
  const createUserDto = new CreateUserDto();
  createUserDto.email = 'testingUser3@bevetu.marketplace.com';
  createUserDto.mainId = 'Testing_3_mainId';
  return await userService.create(createUserDto);
}

export async function removeTestingUser(
  userService: UserService,
  testUserId: string,
) {
  try {
    await userService.remove(testUserId);
  } catch (error) {
    if (error instanceof NotFoundException) {
      // ignore, user already removed
    } else {
      console.error('Not able to remove testUserId:', error);
    }
  }
}
