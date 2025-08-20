/**
 *  To run this test solely:
 *
 *  npm run test -- seller/test/seller.useCase.spec.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SellerService } from '../services/seller.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { SellerRepository } from '../seller.repository';
import { UserModule } from '../../user/user.module';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entities/user.entity';

import {
  createTestUser_1,
  createTestUser_2,
  removeTestingUser,
} from '../../../test/helper/user-helper';
import { SellerUseCase } from '../services/seller.useCase';
import { StripeModule } from '../../stripe/stripe.module';
import { SubscriptionModule } from '../../seller-subscription/sellerSubscription.module';
import { SellerStripeAccountMappingService } from '../../stripe/services/seller-account-mapping.service';
import { StripeService } from '../../stripe/services/stripe.service';
import { ShopService } from '../../shop/shop.service';
import { SellerStripeAccountMappingRepository } from '../../stripe/repositories/seller-account-mapping.repository';
import { ShopRepository } from '../../shop/shop.repository';
import { CreateSellerConnectAccountDto } from '../dto/create-seller-connected-account.dto';
import { Seller } from '../entities/seller.entity';

describe('SellerUseCaseService', () => {
  let sellerService: SellerService;
  let sellerUseCase: SellerUseCase;
  let userService: UserService;
  let testUser: User;
  let anotherUser: User;
  let sellerAccount: Omit<Seller, 'userId'>;
  let stripeSellerAccountId: string;
  let stripeService: StripeService;
  let sellerStripeAccountMappingService: SellerStripeAccountMappingService;

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
      ],
    }).compile();

    sellerService = module.get<SellerService>(SellerService);
    sellerUseCase = module.get<SellerUseCase>(SellerUseCase);
    sellerStripeAccountMappingService =
      module.get<SellerStripeAccountMappingService>(
        SellerStripeAccountMappingService,
      );
    userService = module.get<UserService>(UserService);
    stripeService = module.get<StripeService>(StripeService);

    testUser = await createTestUser_1(userService);
    anotherUser = await createTestUser_2(userService);
  });

  afterAll(async () => {
    await removeTestingUser(userService, testUser.id);
    await removeTestingUser(userService, anotherUser.id);
    if (stripeSellerAccountId) {
      await stripeService.removeAccount(stripeSellerAccountId);
      console.log('Seller account removed from stripe');
    }
  });

  it('test 1 - should be defined', () => {
    expect(sellerService).toBeDefined();
    expect(sellerUseCase).toBeDefined();
    expect(userService).toBeDefined();
  });

  it('test 2 - should be able to create a seller account record in database', async () => {
    stripeSellerAccountId = await sellerUseCase.createSellerConnectedAccount(
      testUser.id,
      Object.assign(new CreateSellerConnectAccountDto(), {
        country: 'GB',
        defaultCurrency: 'GBP',
      }),
    );

    expect(stripeSellerAccountId).toBeDefined();
  });

  it('test 3 - should be able to create a seller account record and mapping record', async () => {
    const sellerStripeAccountMapping =
      await sellerStripeAccountMappingService.findOneByUserId(testUser.id);

    expect(sellerStripeAccountMapping.stripeAccountId).toBe(
      stripeSellerAccountId,
    );
    expect(sellerStripeAccountMapping.sellerId).toBeDefined();

    const sellerAccountId = sellerStripeAccountMapping.sellerId;
    sellerAccount = await sellerService.findOne(testUser.id, sellerAccountId);
    expect(sellerAccount.status).toBe('ACTIVE');
  });
});
