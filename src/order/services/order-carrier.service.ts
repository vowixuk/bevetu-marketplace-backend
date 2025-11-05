import { Injectable } from '@nestjs/common';
import { CreateOrderCarrierDto } from '../dto/create-order-carrier.dto';
import { OrderCarrier } from '../entities/order-carrier.entity';
import { OrderCarrierRepository } from '../repositories/order-carrier.repository';

@Injectable()
export class OrderAddressService {
  constructor(
    private readonly orderCarrierRepository: OrderCarrierRepository,
  ) {}

  async create(dto: CreateOrderCarrierDto): Promise<OrderCarrier> {
    const address = new OrderCarrier({
      ...dto,
      id: '',
      shippedAt: dto.shippedAt ? new Date(dto.shippedAt) : undefined,
      estimatedDelivery: dto.estimatedDelivery
        ? new Date(dto.estimatedDelivery)
        : undefined,
      deliveredAt: dto.deliveredAt ? new Date(dto.deliveredAt) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.orderCarrierRepository.create(address);
  }
}
