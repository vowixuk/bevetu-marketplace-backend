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
    },
  };
}
