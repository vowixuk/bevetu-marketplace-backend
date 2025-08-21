import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { SellerSubscriptionMapping } from '../entities/seller-subscription-mapping.entity';
import { CreateSellerSubscriptionMappingDto } from '../dto/create-seller-subscrption-mapping.dto';
import { SellerSubscriptionMappingRepository } from '../repositories/seller-subscription-mapping.repository';

@Injectable()
export class SellerSubscriptionMappingService {
  constructor(
    private readonly sellerSubscriptionMappingRepository: SellerSubscriptionMappingRepository,
  ) {}

  async create(
    sellerId: string,
    createDto: CreateSellerSubscriptionMappingDto,
  ): Promise<SellerSubscriptionMapping> {
    const mapping = new SellerSubscriptionMapping({
      id: '',
      sellerId,
      bevetuSubscriptionId: createDto.bevetuSubscriptionId,
      identifyId: createDto.identifyId,
      stripeCustomerId: createDto.stripeCustomerId,
      stripeSubscriptionId: createDto.stripeSubscriptionId,
      stripeSubscriptionItems: createDto.stripeSubscriptionItems ?? [],
      createdAt: new Date(),
    });

    return this.sellerSubscriptionMappingRepository.create(mapping);
  }

  async findOne(
    id: string,
    sellerId: string,
  ): Promise<SellerSubscriptionMapping> {
    const mapping = await this.sellerSubscriptionMappingRepository.findOne(id);
    if (!mapping) {
      throw new NotFoundException('Subscription mapping not found');
    }
    if (mapping.sellerId !== sellerId) {
      throw new ForbiddenException('Mapping does not belong to this seller');
    }
    return mapping;
  }

  async findBySellerId(sellerId: string): Promise<SellerSubscriptionMapping[]> {
    return this.sellerSubscriptionMappingRepository.findBySellerId(sellerId);
  }

  async findByBevetuSubscriptionId(
    sellerId: string,
    bevetuSubscriptionId: string,
  ): Promise<SellerSubscriptionMapping> {
    const mapping =
      await this.sellerSubscriptionMappingRepository.findOneByBevetuSubscriptionId(
        bevetuSubscriptionId,
      );
    if (!mapping) {
      throw new NotFoundException('Subscription mapping not found');
    }
    if (mapping.sellerId !== sellerId) {
      throw new ForbiddenException('Mapping does not belong to this seller');
    }
    return mapping;
  }

  async findOneByStripeSubscriptionId(
    sellerId: string,
    bevetuSubscriptionId: string,
  ): Promise<SellerSubscriptionMapping> {
    const mapping =
      await this.sellerSubscriptionMappingRepository.findOneByStripeSubscriptionId(
        bevetuSubscriptionId,
      );
    if (!mapping) {
      throw new NotFoundException('Subscription mapping not found');
    }
    if (mapping.sellerId !== sellerId) {
      throw new ForbiddenException('Mapping does not belong to this seller');
    }
    return mapping;
  }

  async update(
    sellerId: string,
    mappingId: string,
    updateItem: Partial<SellerSubscriptionMapping>,
  ): Promise<SellerSubscriptionMapping> {
    const existingMapping = await this.findOne(mappingId, sellerId);
    return this.sellerSubscriptionMappingRepository.update({
      ...existingMapping,
      ...updateItem,
    });
  }

  async remove(
    id: string,
    sellerId: string,
  ): Promise<SellerSubscriptionMapping> {
    const mapping = await this.findOne(id, sellerId);
    return this.sellerSubscriptionMappingRepository.remove(mapping.id);
  }
}
