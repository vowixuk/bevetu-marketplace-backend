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
} from './index';

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
      SubscriptionModule,
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
    ],
  }).compile();

  const productService = module.get<ProductService>(ProductService);
  const sellerService = module.get<SellerService>(SellerService);
  const sellerUseCase = module.get<SellerUseCase>(SellerUseCase);
  const buyerUseCase = module.get<BuyerUseCase>(BuyerUseCase);
  const stripeService = module.get<StripeService>(StripeService);
  const userService = module.get<UserService>(UserService);
  const sellerStripeAccountMappingService =
    module.get<SellerStripeAccountMappingService>(
      SellerStripeAccountMappingService,
    );
  const sellerSubscriptionService = module.get<SellerSubscriptionService>(
    SellerSubscriptionService,
  );

  const sellerShippingService = module.get<SellerShippingService>(
    SellerShippingService,
  );

  const sellerShippingProfileService = module.get<SellerShippingProfileService>(
    SellerShippingProfileService,
  );

  const shopService = module.get<ShopService>(ShopService);

  return {
    module,
    services: {
      productService,
      userService,
      sellerService,
      sellerUseCase,
      sellerStripeAccountMappingService,
      buyerUseCase,
      stripeService,
      sellerSubscriptionService,
      sellerShippingService,
      sellerShippingProfileService,
      shopService,
    },
  };
}
