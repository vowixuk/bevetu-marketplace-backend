import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderEventRecordRepository } from '../repositories/event-record.repository';
import {
  OrderEventRecord,
  EventRecordType,
} from '../entities/event-record.entity';
import { CreateOrderEventRecordDto } from '../dto/create-event-record.dto';

@Injectable()
export class OrderEventRecordService {
  constructor(
    private readonly orderEventRepository: OrderEventRecordRepository,
  ) {}

  async create<T extends EventRecordType>(
    orderId: string,
    createDto: CreateOrderEventRecordDto<T>,
  ): Promise<OrderEventRecord<T>> {
    const record = new OrderEventRecord<T>({
      id: '',
      orderId,
      type: createDto.type,
      metadata: createDto.metadata ?? null,
      createdAt: new Date(),
    });

    return this.orderEventRepository.create(record);
  }

  async findAllByOrderId(
    orderId: string,
  ): Promise<OrderEventRecord<EventRecordType>[]> {
    const events = await this.orderEventRepository.findAllByOrderId(orderId);

    if (!events || events.length === 0) {
      return [];
    }

    return events;
  }

  async findOne(id: string): Promise<OrderEventRecord<EventRecordType>> {
    const event = await this.orderEventRepository.findOne(id);

    if (!event) {
      throw new NotFoundException('Order event record not found');
    }

    return event;
  }

  async remove(id: string): Promise<OrderEventRecord<EventRecordType>> {
    // Ensure it exists before deleting
    await this.findOne(id);
    return this.orderEventRepository.remove(id);
  }
}
