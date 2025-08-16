/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SellerSubscriptionRepository } from './../repositories/seller-subscription.repository';
import { SellerSubscription } from '../entities/seller-subscription.entity';
import { CreateSellerSubscriptionDto } from '../dto/create-seller-subscription.dto';
import { UpdateSellerSubscriptionDto } from '../dto/update-seller-subscription.dto';

@Injectable()
export class SellerSubscriptionService {
  constructor(
    private readonly subscriptionRepository: SellerSubscriptionRepository,
  ) {}

  async create(
    sellerId: string,
    createDto: CreateSellerSubscriptionDto,
  ): Promise<SellerSubscription> {
    return this.subscriptionRepository.create(
      new SellerSubscription({
        id: '',
        sellerId,
        status: createDto.status,
        items: createDto.items,
        nextPaymentDate: createDto.nextPaymentDate,
        createdAt: new Date(),
      }),
    );
  }

  async findAllBySellerId(sellerId: string): Promise<SellerSubscription[]> {
    const subscriptions =
      await this.subscriptionRepository.findAllBySellerId(sellerId);

    if (subscriptions.length === 0) {
      return [];
    }

    return subscriptions;
  }

  async findOne(
    sellerId: string,
    subscriptionId: string,
  ): Promise<SellerSubscription> {
    const subscription =
      await this.subscriptionRepository.findOne(subscriptionId);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.sellerId !== sellerId) {
      throw new ForbiddenException(
        'Subscription does not belong to this seller',
      );
    }

    return subscription;
  }

  async update(
    sellerId: string,
    subscriptionId: string,
    updateDto: UpdateSellerSubscriptionDto,
  ): Promise<SellerSubscription> {
    const subscription = await this.findOne(sellerId, subscriptionId);

    return this.subscriptionRepository.update({
      ...subscription,
      ...updateDto,
    });
  }

  async remove(
    sellerId: string,
    subscriptionId: string,
  ): Promise<SellerSubscription> {
    await this.findOne(sellerId, subscriptionId);
    return this.subscriptionRepository.remove(subscriptionId);
  }
}
