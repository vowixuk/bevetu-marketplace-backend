import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
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

import { CartModule } from '../cart/cart.module';
import { OrderController } from './order.controller';
import { ShopModule } from '../shop/shop.module';
import { ProductModule } from '../product/product.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  controllers: [OrderController],
  imports: [
    forwardRef(() => StripeModule),
    ProductModule,
    CartModule,
    ShopModule,
  ],
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
  ],
  exports: [
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
  ],
})
export class OrderModule {}
