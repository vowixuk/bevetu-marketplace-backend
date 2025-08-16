/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BuyerStripeCustomerAccountMapping } from '../entities/buyer-customer-account-mapping.entity';
import { BuyerStripeCustomerAccountMappingRepository } from '../repositories/buyer-account-mapping.repository';
import { CreateBuyerStripeCustomerAccountMappingDto } from '../dto/create-buyer-account-mapping.dto';

@Injectable()
export class BuyerStripeCustomerAccountMappingService {
  constructor(
    private readonly BuyerStripeCustomerAccountMappingRepository: BuyerStripeCustomerAccountMappingRepository,
  ) {}

  async create(
    userId: string,
    createDto: CreateBuyerStripeCustomerAccountMappingDto,
  ): Promise<BuyerStripeCustomerAccountMapping> {
    return await this.BuyerStripeCustomerAccountMappingRepository.create(
      new BuyerStripeCustomerAccountMapping({
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
  ): Promise<BuyerStripeCustomerAccountMapping> {
    const mapping = await this.BuyerStripeCustomerAccountMappingRepository.findOne(id);
    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }
    if (mapping.userId !== userId) {
      throw new ForbiddenException('Mapping does not belong to this user');
    }
    return mapping;
  }

  async findOneByUserId(
    userId: string,
  ): Promise<BuyerStripeCustomerAccountMapping> {
    const mapping =
      await this.BuyerStripeCustomerAccountMappingRepository.findByUserId(userId);
    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }
    return mapping;
  }

  async remove(
    id: string,
    userId: string,
  ): Promise<BuyerStripeCustomerAccountMapping> {
    const mapping = await this.findOne(id, userId);
    const deletedMapping =
      await this.BuyerStripeCustomerAccountMappingRepository.remove(mapping.id);
    return deletedMapping;
  }
}
