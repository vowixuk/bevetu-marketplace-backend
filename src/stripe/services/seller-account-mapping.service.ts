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
    createDto: CreateSellerStripeAccountMappingDto,
  ): Promise<SellerStripeAccountMapping> {
    const mapping = await this.sellerStripeAccountMappingRepository.create(
      new SellerStripeAccountMapping({
        id: '',
        sellerId: createDto.sellerId,
        stripeAccountId: createDto.stripeAccountId,
        identifyId: createDto.identifyId,
        createdAt: new Date(),
      }),
    );

    return mapping;
  }

  async findOne(
    id: string,
    sellerId: string,
  ): Promise<SellerStripeAccountMapping> {
    const mapping = await this.sellerStripeAccountMappingRepository.findOne(id);
    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }
    if (mapping.sellerId !== sellerId) {
      throw new ForbiddenException('Mapping does not belong to this user');
    }
    return mapping;
  }

  async findBySellerId(
    sellerId: string,
  ): Promise<SellerStripeAccountMapping[]> {
    return this.sellerStripeAccountMappingRepository.findBySellerId(sellerId);
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

  async remove(id: string): Promise<SellerStripeAccountMapping> {
    const existing =
      await this.sellerStripeAccountMappingRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Mapping not found');
    }
    return this.sellerStripeAccountMappingRepository.remove(id);
  }
}
