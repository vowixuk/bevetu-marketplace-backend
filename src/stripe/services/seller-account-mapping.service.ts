/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SellerStripeAccountMapping } from '../entities/seller-account-mapping.entity';
import { SellerStripeAccountMappingRepository } from '../repositories/seller-account-mapping.repository';
import { CreateSellerStripeAccountMappingDto } from '../dto/create-seller-account-mapping.dto';

@Injectable()
export class SellerStripeAccountMappingService {
  constructor(
    private readonly sellerStripeAccountMappingRepository: SellerStripeAccountMappingRepository,
  ) {}

  async create(
    userId: string,
    createDto: CreateSellerStripeAccountMappingDto,
  ): Promise<SellerStripeAccountMapping> {
    return await this.sellerStripeAccountMappingRepository.create(
      new SellerStripeAccountMapping({
        id: '',
        userId,
        sellerId: createDto.sellerId,
        stripeAccountId: createDto.stripeAccountId,
        identifyId: createDto.identifyId,
        createdAt: new Date(),
      }),
    );
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<SellerStripeAccountMapping> {
    const mapping = await this.sellerStripeAccountMappingRepository.findOne(id);
    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }
    if (mapping.userId !== userId) {
      throw new ForbiddenException('Mapping does not belong to this user');
    }
    return mapping;
  }

  /**
   * one user can only have one seller account and one stripe mapping
   * so , user id is enough to get the mapping record.
   */
  // async findOneBySellerId(
  //   id: string,
  //   userId: string,
  //   sellerId: string,
  // ): Promise<SellerStripeAccountMapping> {
  //   const mapping = await this.sellerStripeAccountMappingRepository.findOne(id);
  //   if (!mapping) {
  //     throw new NotFoundException('Mapping not found');
  //   }
  //   if (mapping.sellerId !== sellerId) {
  //     throw new ForbiddenException('Mapping does not belong to this seller');
  //   }
  //   if (mapping.userId !== userId) {
  //     throw new ForbiddenException('Mapping does not belong to this seller');
  //   }
  //   return mapping;
  // }

  async findOneByUserId(userId: string): Promise<SellerStripeAccountMapping> {
    const mapping =
      await this.sellerStripeAccountMappingRepository.findOneByUserId(userId);
    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }
    return mapping;
  }

  async remove(
    id: string,
    userId: string,
  ): Promise<SellerStripeAccountMapping> {
    const existing = await this.findOne(id, userId);
    const mapping = await this.sellerStripeAccountMappingRepository.remove(
      existing.id,
    );

    return mapping;
  }
}
