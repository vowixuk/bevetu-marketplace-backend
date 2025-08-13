/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BuyerStripeAccountMapping } from '../entities/buyer-account-mapping.entity';
import { BuyerStripeAccountMappingRepository } from '../repositories/buyer-account-mapping.repository';
import { CreateBuyerStripeAccountMappingDto } from '../dto/create-buyer-account-mapping.dto';

@Injectable()
export class BuyerStripeAccountMappingService {
  constructor(
    private readonly buyerStripeAccountMappingRepository: BuyerStripeAccountMappingRepository,
  ) {}

  async create(
    userId: string,
    createDto: CreateBuyerStripeAccountMappingDto,
  ): Promise<BuyerStripeAccountMapping> {
    return await this.buyerStripeAccountMappingRepository.create(
      new BuyerStripeAccountMapping({
        id: '',
        userId,
        stripeCustomerId: createDto.stripeCustomerId,
        identifyId: createDto.identifyId,
        createdAt: new Date(),
      }),
    );
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<BuyerStripeAccountMapping> {
    const mapping = await this.buyerStripeAccountMappingRepository.findOne(id);
    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }
    if (mapping.userId !== userId) {
      throw new ForbiddenException('Mapping does not belong to this user');
    }
    return mapping;
  }

  async findOneByUserId(userId: string): Promise<BuyerStripeAccountMapping> {
    const mapping =
      await this.buyerStripeAccountMappingRepository.findByUserId(userId);
    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }
    return mapping;
  }

  async remove(id: string, userId: string): Promise<BuyerStripeAccountMapping> {
    const mapping = await this.findOne(id, userId);
    const deletedMapping =
      await this.buyerStripeAccountMappingRepository.remove(mapping.id);
    return deletedMapping;
  }
}
