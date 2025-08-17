import { Injectable } from '@nestjs/common';
import { CreateSellerSubscriptionDto } from './dto/create-seller-subscription.dto';
import { UpdateSellerSubscriptionDto } from './dto/update-seller-subscription.dto';

@Injectable()
export class SubscriptionService {
  create(CreateSellerSubscriptionDto: CreateSellerSubscriptionDto) {
    return 'This action adds a new subscription';
  }

  findAll() {
    return `This action returns all subscription`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subscription`;
  }

  update(id: number, UpdateSellerSubscriptionDto: UpdateSellerSubscriptionDto) {
    return `This action updates a #${id} subscription`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscription`;
  }
}
