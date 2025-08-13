import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { User } from './entities/user.entity';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(user: User): Promise<User> {
    return mapPrismaUserToDomain(
      await this.prisma.user.create({
        data: {
          email: user.email,
          mainId: user.mainId,
          createdAt: user.createdAt,
        },
      }),
    ) as User;
  }

  async findOne(id: string): Promise<User> {
    return mapPrismaUserToDomain(
      await this.prisma.user.findUnique({
        where: { id },
      }),
    ) as User;
  }

  async findOneByEmail(email: string): Promise<User> {
    return mapPrismaUserToDomain(
      await this.prisma.user.findUnique({
        where: { email },
      }),
    ) as User;
  }

  async findOneByMainId(mainId: string): Promise<User> {
    return mapPrismaUserToDomain(
      await this.prisma.user.findUnique({
        where: { mainId },
      }),
    ) as User;
  }

  async update(user: User): Promise<User> {
    return mapPrismaUserToDomain(
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email,
          mainId: user.mainId,
        },
      }),
    ) as User;
  }

  async remove(id: string): Promise<User> {
    return mapPrismaUserToDomain(
      await this.prisma.user.delete({
        where: { id },
      }),
    ) as User;
  }

  async softDelete(id: string): Promise<User> {
    return mapPrismaUserToDomain(
      await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      }),
    ) as User;
  }

  async restore(id: string): Promise<User> {
    return mapPrismaUserToDomain(
      await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: null,
        },
      }),
    ) as User;
  }
}

/**
 * @description Convert Prisma `User` to domain `User` entity.
 * This ensures Prisma-specific objects stay in the data layer.
 */
export function mapPrismaUserToDomain(
  prismaUser?: PrismaUser | null,
): User | null {
  if (!prismaUser) {
    return null;
  }
  return new User({
    id: prismaUser.id,
    email: prismaUser.email,
    mainId: prismaUser.mainId,
    createdAt: prismaUser.createdAt,
    updatedAt: prismaUser.updatedAt || null,
    deletedAt: prismaUser.deletedAt || null,
  });
}
