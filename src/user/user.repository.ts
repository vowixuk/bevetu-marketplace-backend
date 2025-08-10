import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { User } from './entities/user.entity';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async create(user: User) {
    return mapPrismaUserToDomain(
      await this.prisma.user.create({
        data: {
          email: user.email,
          mainId: user.mainId,
        },
      }),
    );
  }

  async findOne(id: string) {
    return mapPrismaUserToDomain(
      await this.prisma.user.findUnique({
        where: { id },
      }),
    );
  }

  async findOneByEmail(email: string) {
    return mapPrismaUserToDomain(
      await this.prisma.user.findUnique({
        where: { email },
      }),
    );
  }

  async findOneByMainId(mainId: string) {
    return mapPrismaUserToDomain(
      await this.prisma.user.findUnique({
        where: { mainId },
      }),
    );
  }

  async update(user: User) {
    return mapPrismaUserToDomain(
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email,
          mainId: user.mainId,
        },
      }),
    );
  }

  async delete(id: string) {
    return mapPrismaUserToDomain(
      await this.prisma.user.delete({
        where: { id },
      }),
    );
  }

  async softDelete(id: string) {
    return mapPrismaUserToDomain(
      await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      }),
    );
  }

  async restore(id: string) {
    return mapPrismaUserToDomain(
      await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: null,
        },
      }),
    );
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
