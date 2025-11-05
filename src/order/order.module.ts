import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderAddressService } from './services/order-address.service';
import { OrderItemService } from './services/order-item.service';
import { OrderEventRecordService } from './services/event-record.service';
import { OrderRepository } from './repositories/order.repository';
import { OrderAddressRepository } from './repositories/order-address.repository';
import { OrderItemRepository } from './repositories/order-item.repository';
import { OrderEventRecordRepository } from './repositories/event-record.repository';
import { OrderCarrierRepository } from './repositories/order-carrier.repository';
import { AfterPaymentSuccessUseCase } from './use-cases/after-payment-success.useCase';
import { AfterPaymentFailUseCase } from './use-cases/after-payment-fail.useCase';
import { CreateOrderUseCase } from './use-cases/create-order.useCase';
import { UpdateProductUseCase } from 'test/helper/testing-module';
// import { OrderController } from './order.controller';

@Module({
  // controllers: [OrderController],
  providers: [
    OrderService,
    OrderAddressService,
    OrderItemService,
    OrderEventRecordService,
    OrderItemService,
    OrderRepository,
    OrderAddressRepository,
    OrderItemRepository,
    OrderEventRecordRepository,
    OrderCarrierRepository,

    AfterPaymentSuccessUseCase,
    AfterPaymentFailUseCase,
    CreateOrderUseCase,
    UpdateProductUseCase,
  ],
})
export class OrderModule {}
