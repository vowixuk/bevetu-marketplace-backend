import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { OrderItem } from '../entities/order-item.entity';
import { CreateOrderItemDto } from '../dto/create-order-item.dto';
import { UpdateOrderItemDto } from '../dto/update-order-item.dto';

@Injectable()
export class OrderItemService {
  constructor(private readonly orderItemRepository: OrderItemRepository) {}

  async create(dto: CreateOrderItemDto): Promise<OrderItem> {
    const orderItem = new OrderItem({
      ...dto,
      id: '',
      updatedAt: new Date(),
      createdAt: new Date(),
    });

    return this.orderItemRepository.create(orderItem);
  }

  async createMany(dtos: CreateOrderItemDto[]): Promise<boolean> {
    if (!dtos.length) return false;

    const now = new Date();

    const orderItems = dtos.map(
      (dto) =>
        new OrderItem({
          ...dto,
          id: '',
          createdAt: now,
          updatedAt: now,
        }),
    );

    await this.orderItemRepository.createMany(orderItems);
    return true;
  }

  async sellerUpdateIfOwned(
    sellerId: string,
    orderId: string,
    dto: UpdateOrderItemDto,
  ): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository.sellerFindOneIfOwned(
      orderId,
      sellerId,
    );

    if (!orderItem) {
      throw new BadRequestException('Unable to get the item');
    }

    return this.orderItemRepository.sellerUpdateIfOwned(orderId, sellerId, {
      ...orderItem,
      ...dto,
    });
  }
}
