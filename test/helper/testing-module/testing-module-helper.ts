import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';

import {
  BuyerService,
  BuyerUseCase,
  ProductService,
  SellerService,
  SellerUseCase,
  SellerSubscriptionService,
  SellerShippingService,
  SellerShippingProfileService,
  ShopService,
  StripeService,
  SellerStripeAccountMappingService,
  SellerSubscriptionMappingService,
  UserService,
  BuyerRepository,
  ProductRepository,
  SellerRepository,
  SellerShippingRepository,
  SellerShippingProfileRepository,
  ShopRepository,
  SellerStripeAccountMappingRepository,
  SellerSubscriptionMappingRepository,
  DatabaseModule,
  UserModule,
  StripeModule,
  SubscriptionModule,
  CreateProductUseCase,
  SetProductOnShelfUseCase,
  UpdateProductUseCase,
  ViewProductListUseCase,
  DeleteProductUseCase,
  ResetProductOnShelfUseCase,
  ProductModule,
  SellerViewProductUseCase,
  SetupShopUseCase,
  OrderService,
  OrderAddressService,
  OrderItemService,
  OrderEventRecordService,
  OrderRepository,
  OrderAddressRepository,
  OrderItemRepository,
  OrderEventRecordRepository,
  OrderCarrierRepository,
  AfterPaymentSuccessUseCase,
  AfterPaymentFailUseCase,
  CreateOrderUseCase,
  UpdateProcessStatusUseCase,
  CartService,
  CartRepository,
  CartItemService,
  CartItemRepository,
  CheckItemsAvailability,
} from './index';

import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';

export type ServicesType = {
  productService: ProductService;
  userService: UserService;
  sellerService: SellerService;
  sellerUseCase: SellerUseCase;
  sellerStripeAccountMappingService: SellerStripeAccountMappingService;
  buyerUseCase: BuyerUseCase;
  stripeService: StripeService;
  sellerSubscriptionService: SellerSubscriptionService;
  sellerShippingService: SellerShippingService;
  sellerShippingProfileService: SellerShippingProfileService;
  shopService: ShopService;
  createProductUseCase: CreateProductUseCase;
  setProductOnShelfUseCase: SetProductOnShelfUseCase;
  updateProductUseCase: UpdateProductUseCase;
  viewProductListUseCase: ViewProductListUseCase;
  deleteProductUseCase: DeleteProductUseCase;
  resetProductOnShelfUseCase: ResetProductOnShelfUseCase;
  sellerViewProductUseCase: SellerViewProductUseCase;
  setupShopUseCase: SetupShopUseCase;

  orderService: OrderService;
  orderAddressService: OrderAddressService;
  orderItemService: OrderItemService;
  orderEventRecordService: OrderEventRecordService;

  orderRepository: OrderRepository;
  orderAddressRepository: OrderAddressRepository;
  orderItemRepository: OrderItemRepository;
  orderEventRecordRepository: OrderEventRecordRepository;
  orderCarrierRepository: OrderCarrierRepository;
  afterPaymentSuccessUseCase: AfterPaymentSuccessUseCase;
  afterPaymentFailUseCase: AfterPaymentFailUseCase;
  createOrderUseCase: CreateOrderUseCase;
  updateProcessStatusUseCase: UpdateProcessStatusUseCase;
  cartService: CartService;
  cartRepository: CartRepository;
  cartItemService: CartItemService;
  cartItemRepository: CartItemRepository;
  checkItemsAvailability: CheckItemsAvailability;
};
export async function testTestingMoudleHelper(): Promise<{
  module: TestingModule;
  services: ServicesType;
}> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      CacheModule.register({ isGlobal: true }),
      DatabaseModule,
      UserModule,
      StripeModule,

      EventEmitterModule.forRoot(),
      SubscriptionModule,
      ProductModule,
    ],
    providers: [
      SellerService,
      SellerRepository,
      SellerUseCase,
      StripeService,
      ShopService,
      ShopRepository,
      SellerStripeAccountMappingRepository,
      SellerStripeAccountMappingService,
      BuyerUseCase,
      BuyerService,
      BuyerRepository,
      SellerSubscriptionService,
      SellerSubscriptionMappingService,
      SubscriptionModule,
      SellerSubscriptionMappingRepository,
      ProductService,
      ProductRepository,
      SellerShippingService,
      SellerShippingProfileService,
      SellerShippingRepository,
      SellerShippingProfileRepository,
      CreateProductUseCase,
      SetProductOnShelfUseCase,
      UpdateProductUseCase,
      ViewProductListUseCase,
      DeleteProductUseCase,
      ResetProductOnShelfUseCase,
      EventEmitter2,
      SetupShopUseCase,
      SellerViewProductUseCase,
      OrderService,
      OrderAddressService,
      OrderItemService,
      OrderEventRecordService,
      OrderRepository,
      OrderAddressRepository,
      OrderItemRepository,
      OrderEventRecordRepository,
      OrderCarrierRepository,

      AfterPaymentSuccessUseCase,
      AfterPaymentFailUseCase,
      CreateOrderUseCase,
      UpdateProcessStatusUseCase,

      CartService,
      CartRepository,
      CartItemService,
      CartItemRepository,
      CheckItemsAvailability,
    ],
  }).compile();

  return {
    module,
    services: {
      productService: module.get<ProductService>(ProductService),
      userService: module.get<UserService>(UserService),
      sellerService: module.get<SellerService>(SellerService),
      sellerUseCase: module.get<SellerUseCase>(SellerUseCase),
      sellerStripeAccountMappingService:
        module.get<SellerStripeAccountMappingService>(
          SellerStripeAccountMappingService,
        ),
      buyerUseCase: module.get<BuyerUseCase>(BuyerUseCase),
      stripeService: module.get<StripeService>(StripeService),
      sellerSubscriptionService: module.get<SellerSubscriptionService>(
        SellerSubscriptionService,
      ),
      sellerShippingService: module.get<SellerShippingService>(
        SellerShippingService,
      ),
      sellerShippingProfileService: module.get<SellerShippingProfileService>(
        SellerShippingProfileService,
      ),
      shopService: module.get<ShopService>(ShopService),
      createProductUseCase:
        module.get<CreateProductUseCase>(CreateProductUseCase),
      setProductOnShelfUseCase: module.get<SetProductOnShelfUseCase>(
        SetProductOnShelfUseCase,
      ),
      updateProductUseCase:
        module.get<UpdateProductUseCase>(UpdateProductUseCase),
      viewProductListUseCase: module.get<ViewProductListUseCase>(
        ViewProductListUseCase,
      ),
      deleteProductUseCase:
        module.get<DeleteProductUseCase>(DeleteProductUseCase),

      resetProductOnShelfUseCase: module.get<ResetProductOnShelfUseCase>(
        ResetProductOnShelfUseCase,
      ),

      setupShopUseCase: module.get<SetupShopUseCase>(SetupShopUseCase),
      sellerViewProductUseCase: module.get<SellerViewProductUseCase>(
        SellerViewProductUseCase,
      ),
      orderService: module.get<OrderService>(OrderService),

      orderAddressService: module.get<OrderAddressService>(OrderAddressService),

      orderItemService: module.get<OrderItemService>(OrderItemService),

      orderEventRecordService: module.get<OrderEventRecordService>(
        OrderEventRecordService,
      ),

      orderRepository: module.get<OrderRepository>(OrderRepository),

      orderAddressRepository: module.get<OrderAddressRepository>(
        OrderAddressRepository,
      ),

      orderItemRepository: module.get<OrderItemRepository>(OrderItemRepository),

      orderEventRecordRepository: module.get<OrderEventRecordRepository>(
        OrderEventRecordRepository,
      ),

      orderCarrierRepository: module.get<OrderCarrierRepository>(
        OrderCarrierRepository,
      ),

      afterPaymentSuccessUseCase: module.get<AfterPaymentSuccessUseCase>(
        AfterPaymentSuccessUseCase,
      ),

      afterPaymentFailUseCase: module.get<AfterPaymentFailUseCase>(
        AfterPaymentFailUseCase,
      ),

      createOrderUseCase: module.get<CreateOrderUseCase>(CreateOrderUseCase),

      updateProcessStatusUseCase: module.get<UpdateProcessStatusUseCase>(
        UpdateProcessStatusUseCase,
      ),

      cartService: module.get<CartService>(CartService),

      cartRepository: module.get<CartRepository>(CartRepository),

      cartItemService: module.get<CartItemService>(CartItemService),

      cartItemRepository: module.get<CartItemRepository>(CartItemRepository),

      checkItemsAvailability: module.get<CheckItemsAvailability>(
        CheckItemsAvailability,
      ),
    },
  };
}
