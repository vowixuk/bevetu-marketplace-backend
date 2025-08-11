import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BuyerStripeAccountMapping } from '../entities/buyer-account-mapping.entity';
import { BuyerStripeAccountMappingRepository } from '../repositories/buyer-account-mapping.repository';
import { CreateBuyerStripeAccountMappingDto } from '../dto/create-buyer-account-mapping.dto';
// import { UpdateBuyerStripeAccountMappingDto } from './dto/update-buyer-stripe-account-mapping.dto';

@Injectable()
export class BuyerStripeAccountMappingService {
  constructor(
    private readonly buyerStripeAccountMappingRepository: BuyerStripeAccountMappingRepository,
  ) {}

  async create(
    userId: string,
    createDto: CreateBuyerStripeAccountMappingDto,
  ): Promise<BuyerStripeAccountMapping> {
    const mapping = await this.buyerStripeAccountMappingRepository.create(
      new BuyerStripeAccountMapping({
        id: '',
        userId,
        stripeCustomerId: createDto.stripeCustomerId,
        identifyId: createDto.identifyId,
        createdAt: new Date(),
      }),
    );
    return mapping;
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

  async findByUserId(userId: string): Promise<BuyerStripeAccountMapping[]> {
    const mappings =
      await this.buyerStripeAccountMappingRepository.findByUserId(userId);
    if (!mappings.length) {
      return [];
    }
    return mappings;
  }

  // async update(
  //   id: string,
  //   updateDto: UpdateBuyerStripeAccountMappingDto,
  // ): Promise<BuyerStripeAccountMapping> {
  //   const existing = await this.buyerStripeAccountMappingRepository.findOne(id);
  //   if (!existing) {
  //     throw new NotFoundException('Mapping not found');
  //   }
  //   const updatedMapping =
  //     await this.buyerStripeAccountMappingRepository.update({
  //       ...existing,
  //       ...updateDto,
  //     });
  //   return updatedMapping;
  // }

  async remove(id: string): Promise<BuyerStripeAccountMapping> {
    const existing = await this.buyerStripeAccountMappingRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException('Mapping not found');
    }
    const deletedMapping =
      await this.buyerStripeAccountMappingRepository.remove(id);
    return deletedMapping;
  }
}
