import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionEventRecordRepository } from '../repositories/event-record.repository';
import {
  SubscriptionEventRecord,
  EventRecordType,
} from '../entities/event-record.entity';
import { CreateSubscriptionEventRecordDto } from '../dto/create-subscription-event-record.dto';
@Injectable()
export class SubscriptionEventRecordService {
  constructor(
    private readonly recordRepository: SubscriptionEventRecordRepository,
  ) {}

  async create<T extends EventRecordType>(
    subscriptionId: string,
    createDto: CreateSubscriptionEventRecordDto<T>,
  ): Promise<SubscriptionEventRecord<T>> {
    const record = new SubscriptionEventRecord<T>({
      id: '',
      subscriptionId,
      type: createDto.type,
      metadata: createDto.metadata ?? null,
      createdAt: new Date(),
    });

    return this.recordRepository.create(record);
  }

  async findAllBySubscriptionId(
    subscriptionId: string,
  ): Promise<SubscriptionEventRecord<EventRecordType>[]> {
    return this.recordRepository.findAllBySubscriptionId(subscriptionId);
  }

  async findOne(id: string): Promise<SubscriptionEventRecord<EventRecordType>> {
    const record = await this.recordRepository.findOne(id);
    if (!record) {
      throw new NotFoundException('Subscription event record not found');
    }
    return record;
  }

  async remove(id: string): Promise<SubscriptionEventRecord<EventRecordType>> {
    const record = await this.findOne(id);
    return this.recordRepository.remove(record.id);
  }
}
