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
    buyerId: string,
    createDto: CreateBuyerStripeCustomerAccountMappingDto,
  ): Promise<BuyerStripeCustomerAccountMapping> {
    return await this.BuyerStripeCustomerAccountMappingRepository.create(
      new BuyerStripeCustomerAccountMapping({
        id: '',
        buyerId,
        stripeCustomerId: createDto.stripeCustomerId,
        identifyId: createDto.identifyId,
        createdAt: new Date(),
      }),
    );
  }

  async findOne(
    id: string,
    buyerId: string,
  ): Promise<BuyerStripeCustomerAccountMapping> {
    const mapping =
      await this.BuyerStripeCustomerAccountMappingRepository.findOne(id);
    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }
    if (mapping.buyerId !== buyerId) {
      throw new ForbiddenException('Mapping does not belong to this buyer');
    }
    return mapping;
  }

  async findOneByBuyerId(
    buyerId: string,
  ): Promise<BuyerStripeCustomerAccountMapping> {
    const mapping =
      await this.BuyerStripeCustomerAccountMappingRepository.findByBuyerId(
        buyerId,
      );
    if (!mapping) {
      throw new NotFoundException('Mapping not found');
    }
    return mapping;
  }

  async remove(
    id: string,
    buyerId: string,
  ): Promise<BuyerStripeCustomerAccountMapping> {
    const mapping = await this.findOne(id, buyerId);
    const deletedMapping =
      await this.BuyerStripeCustomerAccountMappingRepository.remove(mapping.id);
    return deletedMapping;
  }
}
