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
  ): Promise<Omit<SellerStripeAccountMapping, 'userId'>> {
    const mapping = await this.sellerStripeAccountMappingRepository.create(
      new SellerStripeAccountMapping({
        id: '',
        userId,
        sellerId: createDto.sellerId,
        stripeAccountId: createDto.stripeAccountId,
        identifyId: createDto.identifyId,
        createdAt: new Date(),
      }),
    );

    const { userId: id, ...mappingWithoutId } = mapping;

    return mappingWithoutId;
  }

  async findOneBySellerId(
    id: string,
    userId: string,
    sellerId: string,
  ): Promise<Omit<SellerStripeAccountMapping, 'userId'>> {
    const mapping = await this.sellerStripeAccountMappingRepository.findOne(id);
    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }
    if (mapping.sellerId !== sellerId) {
      throw new ForbiddenException('Mapping does not belong to this seller');
    }
    if (mapping.userId !== userId) {
      throw new ForbiddenException('Mapping does not belong to this seller');
    }
    const { userId: uid, ...mappingWithoutId } = mapping;

    return mappingWithoutId;
  }

  async findOneByUserId(
    userId: string,
  ): Promise<Omit<SellerStripeAccountMapping, 'userId'>> {
    const mapping =
      await this.sellerStripeAccountMappingRepository.findOneByUserId(userId);
    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }
    if (mapping.userId !== userId) {
      throw new ForbiddenException('Mapping does not belong to this seller');
    }
    const { userId: uid, ...mappingWithoutId } = mapping;

    return mappingWithoutId;
  }

  async findBySellerId(
    sellerId: string,
  ): Promise<Omit<SellerStripeAccountMapping, 'userId'>[]> {
    const mappings =
      await this.sellerStripeAccountMappingRepository.findBySellerId(sellerId);

    return mappings.map(({ userId, ...rest }) => rest);
  }

  async findByUserId(
    sellerId: string,
  ): Promise<Omit<SellerStripeAccountMapping, 'userId'>[]> {
    const mappings =
      await this.sellerStripeAccountMappingRepository.findBySellerId(sellerId);

    return mappings.map(({ userId, ...rest }) => rest);
  }

  // async update(
  //   id: string,
  //   updateDto: UpdateSellerStripeAccountMappingDto,
  // ): Promise<SellerStripeAccountMapping> {
  //   const existing = await this.sellerStripeAccountMappingRepository.findOne(id);
  //   if (!existing) {
  //     throw new NotFoundException('Mapping not found');
  //   }
  //   const updated = await this.sellerStripeAccountMappingRepository.update({
  //     ...existing,
  //     ...updateDto,
  //   });
  //   return updated;
  // }

  async remove(
    id: string,
  ): Promise<Omit<SellerStripeAccountMapping, 'userId'>> {
    const existing =
      await this.sellerStripeAccountMappingRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Mapping not found');
    }
    const mapping = await this.sellerStripeAccountMappingRepository.remove(id);

    const { userId, ...mappingWithoutId } = mapping;

    return mappingWithoutId;
  }
}
