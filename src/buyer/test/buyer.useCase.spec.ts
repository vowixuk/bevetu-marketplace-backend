/**
 *  To run this test solely:
 *
 *  npm run test -- buyer/test/buyer.useCase.spec.ts
 */

import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';

import { DatabaseModule } from '../../database/database.module';
import { StripeModule } from '../../stripe/stripe.module';
import { SubscriptionModule } from '../../seller-subscription/sellerSubscription.module';
import { UserModule } from '../../user/user.module';

import { SellerRepository } from '../../seller/seller.repository';
import { ShopRepository } from '../../shop/shop.repository';
import { SellerStripeAccountMappingRepository } from '../../stripe/repositories/seller-account-mapping.repository';

import { SellerService } from '../../seller/services/seller.service';
import { SellerUseCase } from '../../seller/use-cases/seller.useCase';
import { StripeService } from '../../stripe/services/stripe.service';
import { SellerStripeAccountMappingService } from '../../stripe/services/seller-account-mapping.service';
import { ShopService } from '../../shop/shop.service';
import { UserService } from '../../user/user.service';

import { User } from '../../user/entities/user.entity';


import {
  createTestUser_1,
  removeTestingUser,
} from '../../../test/helper/user-helper';
import { Buyer } from '../entities/buyer.entity';
import { BuyerStripeCustomerAccountMappingService } from '../../stripe/services/buyer-account-mapping.service';
import { BuyerUseCase } from '../use-cases/buyer.usecase';
import { BuyerModule } from '../buyer.module';
import { BuyerService } from '../services/buyer.service';
import { BuyerRepository } from '../buyer.repository';

describe('BuyerUseCase', () => {
  // Service instances
  let userService: UserService;
  let buyerService: BuyerService;
  let buyerUseCase: BuyerUseCase;
  let buyerStripeAccountMappingService: BuyerStripeCustomerAccountMappingService;
  let stripeService: StripeService;

  // Global variable used in the test
  let testUser: User;
  let buyerStripeCustomerId: string | null;
  let buyer: Buyer | null;

  beforeAll(async () => {
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
        BuyerModule,
      ],
      providers: [
        SellerService,
        SellerRepository,
        SellerUseCase,
        StripeService,
        SellerStripeAccountMappingService,
        ShopService,
        ShopRepository,
        SellerStripeAccountMappingRepository,
        BuyerUseCase,
        BuyerService,
        BuyerRepository,
      ],
    }).compile();

    buyerService = module.get<BuyerService>(BuyerService);
    buyerUseCase = module.get<BuyerUseCase>(BuyerUseCase);
    stripeService = module.get<StripeService>(StripeService);
    userService = module.get<UserService>(UserService);
    buyerStripeAccountMappingService =
      module.get<BuyerStripeCustomerAccountMappingService>(
        BuyerStripeCustomerAccountMappingService,
      );

    // Create a dummy user
    testUser = await createTestUser_1(userService);
    buyerStripeCustomerId = null;
    buyer = null;
  });

  afterAll(async () => {
    if (testUser && testUser.id) {
      await removeTestingUser(userService, testUser.id);
    }

    if (buyerStripeCustomerId) {
      await stripeService.removeStripeCustomer(buyerStripeCustomerId);
      console.log(
        `customer account ${buyerStripeCustomerId} removed from stripe`,
      );
    }
  });

  it('test 1 - should be defined the testUser', () => {
    expect(testUser.email).toBeDefined();
    expect(testUser.id).toBeDefined();
  });

  it('test 2 - should be able to go through the buy account set up process', async () => {
    const { buyer: _b, buyerStripeCustomerAccountMapping: _bscam } =
      await buyerUseCase.setUpBuyerAccount(testUser.id, testUser.email);

    expect(_b).toBeDefined();
    expect(_bscam).toBeDefined();
    expect(typeof _bscam.stripeCustomerId).toBe('string');

    buyerStripeCustomerId = _bscam.stripeCustomerId;
    buyer = _b;
  });

  // it('test 2 - should be able to create a seller account record in database', async () => {});
  // it('test 3 - should be able to create a seller account mapping record', async () => {});
  // it('test 4 - should be able to create a seller account in stripe', async () => {});
  // it('test 5 - should be able to create a shop record in database', async () => {});
});
