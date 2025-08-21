/**
 *  To run this test solely:
 *
 *  npm run test -- subscription/test/subscription.service.spec.ts
 */

import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import puppeteer from 'puppeteer';
import { DatabaseModule } from '../../database/database.module';
import { StripeModule } from '../../stripe/stripe.module';
import { SubscriptionModule } from '../../seller-subscription/sellerSubscription.module';
import { UserModule } from '../../user/user.module';

import { SellerRepository } from '../../seller/seller.repository';
import { ShopRepository } from '../../shop/shop.repository';
import { SellerStripeAccountMappingRepository } from '../../stripe/repositories/seller-account-mapping.repository';

import { SellerService } from '../../seller/services/seller.service';
import { SellerUseCase } from '../../seller/services/seller.useCase';
import { StripeService } from '../../stripe/services/stripe.service';
import { SellerStripeAccountMappingService } from '../../stripe/services/seller-account-mapping.service';
import { ShopService } from '../../shop/shop.service';
import { UserService } from '../../user/user.service';

import { Seller } from '../../seller/entities/seller.entity';
import { User } from '../../user/entities/user.entity';

import { CreateSellerConnectAccountDto } from '../../seller/dto/create-seller-connected-account.dto';

import {
  createTestUser_1,
  removeTestingUser,
} from '../../../test/helper/user-helper';
import { BuyerRepository } from '../../buyer/buyer.repository';
import { BuyerService } from '../../buyer/services/buyer.service';
import { BuyerUseCase } from '../../buyer/services/buyer.usecase';
import { BuyerStripeCustomerAccountMappingService } from '../../stripe/services/buyer-account-mapping.service';
import { Buyer } from '../../buyer/entities/buyer.entity';
import { SellerSubscriptionService } from '../services/seller-subscription.service';
import { SellerSubscriptionMappingService } from '../../stripe/services/seller-subscription-mapping.service';
import { CompleteSellerListingSubscriptionEnrollmentDto } from '../dto/complete-seller-listing-subscription-enrollment.dto';
import { IProductCode } from '../entities/vo/product.vo';
import { SellerSubscriptionMappingRepository } from '../../stripe/repositories/seller-subscription-mapping.repository';
import { ForbiddenException } from '@nestjs/common';

describe('SubscriptionService', () => {
  // Service instances
  let userService: UserService;

  let sellerService: SellerService;
  let sellerUseCase: SellerUseCase;
  let sellerStripeAccountMappingService: SellerStripeAccountMappingService;

  let buyerService: BuyerService;
  let buyerUseCase: BuyerUseCase;
  let buyerStripeAccountMappingService: BuyerStripeCustomerAccountMappingService;

  let stripeService: StripeService;
  let sellerSubscriptionService: SellerSubscriptionService;
  let sellerSubscriptionMappingService: SellerSubscriptionMappingService;

  // Global variable used in the test
  let testUser: User;
  let buyerStripeCustomerId: string | null;
  let buyer: Buyer | null;
  let sellerStripeAccountId: string;
  let seller: Omit<Seller, 'userId'> | null;

  let paymentUrl: string | undefined | null;
  let stripeSubscriptionId: string | undefined | null;

  let bevetuSellerSubscriptionId: string | undefined | null;

  let productCode: IProductCode;

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
      ],
    }).compile();

    sellerService = module.get<SellerService>(SellerService);
    sellerUseCase = module.get<SellerUseCase>(SellerUseCase);
    buyerService = module.get<BuyerService>(BuyerService);
    buyerUseCase = module.get<BuyerUseCase>(BuyerUseCase);
    buyerStripeAccountMappingService =
      module.get<BuyerStripeCustomerAccountMappingService>(
        BuyerStripeCustomerAccountMappingService,
      );

    stripeService = module.get<StripeService>(StripeService);
    userService = module.get<UserService>(UserService);
    sellerStripeAccountMappingService =
      module.get<SellerStripeAccountMappingService>(
        SellerStripeAccountMappingService,
      );

    sellerSubscriptionService = module.get<SellerSubscriptionService>(
      SellerSubscriptionService,
    );

    sellerSubscriptionMappingService =
      module.get<SellerSubscriptionMappingService>(
        SellerSubscriptionMappingService,
      );

    // Create a dummy user
    testUser = await createTestUser_1(userService);

    // Create a buyer account for the user
    const buyerAccountSetup = await buyerUseCase.setUpBuyerAccount(
      testUser.id,
      testUser.email,
    );

    buyer = buyerAccountSetup.buyer;
    buyerStripeCustomerId =
      buyerAccountSetup.buyerStripeCustomerAccountMapping.stripeCustomerId;

    // Create a seller stripe account for the user
    sellerStripeAccountId = await sellerUseCase.createSellerConnectedAccount(
      testUser.id,
      Object.assign(new CreateSellerConnectAccountDto(), {
        country: 'GB',
        defaultCurrency: 'GBP',
      }),
    );

    const sellerStripeAccountMapping =
      await sellerStripeAccountMappingService.findOneByUserId(testUser.id);
    const sellerId = sellerStripeAccountMapping.sellerId;
    seller = await sellerService.findOne(testUser.id, sellerId);
    productCode = 'SILVER_MONTHLY_GBP';
  });

  afterAll(async () => {
    if (testUser && testUser.id) {
      await removeTestingUser(userService, testUser.id);
    }
    if (sellerStripeAccountId) {
      await stripeService.removeAccount(sellerStripeAccountId);
      console.log(
        `Seller account ${sellerStripeAccountId} removed from stripe`,
      );
    }

    if (buyerStripeCustomerId) {
      await stripeService.removeStripeCustomer(buyerStripeCustomerId);
      console.log(
        `Buyer customer account ${buyerStripeCustomerId} removed from stripe`,
      );
    }
  });

  it('test 1 - should be defined', () => {
    expect(testUser).toBeInstanceOf(User);
    expect(buyer).toBeInstanceOf(Buyer);
    expect(typeof buyerStripeCustomerId === 'string').toBe(true);
    expect(typeof seller).toBe('object');
    expect(typeof sellerStripeAccountId).toBe('string');
  });

  it('test 2 - should be able to get payment link', async () => {
    paymentUrl =
      await sellerSubscriptionService.getListingSubscriptionPaymentLink(
        testUser.id,
        seller!.id,
        buyerStripeCustomerId!,
        testUser.email,
        productCode,
        null,
      );
    expect(typeof paymentUrl).toBe('string');
  });

  it('test 3 - should be able to pay via that payment url', async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
      await page.goto(paymentUrl!);
      await page.waitForSelector('#cardNumber');
      // await page.type('#email', user.email);
      await page.type('#cardNumber', '4242424242424242');
      await page.type('#cardExpiry', '12/34');
      await page.type('#cardCvc', '123');
      await page.type('#billingName', 'testing user in marketplace');
      await page.type('#billingPostalCode', 'M50 2AJ');
      await page.click('.SubmitButton');
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle0',
          timeout: 30000,
        }),
        page.click('.SubmitButton'),
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      await browser.close();
    }
  }, 30000);

  it('test 4 - should be able to create subscription record in database when webhook action trigger the `enrollSubsctiopion`', async () => {
    // Get the subscription data from strip
    const subscriptionDetails =
      await stripeService.getSubscriptionDetailsByCustomerId(
        buyerStripeCustomerId!,
      );

    stripeSubscriptionId = subscriptionDetails.stripeSubscriptionId;
    // Example return of subscriptionDetails:
    // {
    //   stripeCustomerId: 'cus_Su1kNyZ7mj0DWS',
    //   stripeSubscriptionId: 'sub_1RyDhMJW66piU6wAM5ebLzdi',
    //   stripeSubscriptionItemId: 'si_Su1kAwg2Z1h5rq',
    //   productCode: undefined,
    //   amount: 10,
    //   currency: 'gbp',
    //   quantity: 1
    // }

    bevetuSellerSubscriptionId =
      await sellerSubscriptionService.completeSellerListingSubscriptionEnrollment(
        Object.assign(new CompleteSellerListingSubscriptionEnrollmentDto(), {
          stripeCustomerId: subscriptionDetails.stripeCustomerId,
          stripeSubscriptionId: subscriptionDetails.stripeSubscriptionId,
          stripeSubscriptionItemId:
            subscriptionDetails.stripeSubscriptionItemId,
          userId: testUser.id,
          buyerId: buyer?.id,
          sellerId: seller?.id,
          productCode,
          amount: subscriptionDetails.amount,
          currency: subscriptionDetails.currency,
          quantity: subscriptionDetails.quantity,
        }),
      );

    const sellerSubscription = await sellerSubscriptionService.findOne(
      seller!.id,
      bevetuSellerSubscriptionId,
    );

    expect(sellerSubscription.status).toBe('ACTIVE');
    expect(sellerSubscription.items).toEqual([
      {
        category: 'LISTING_SUBSCRIPTION',
        productCode: 'SILVER_MONTHLY_GBP',
        quantity: 1,
      },
    ]);
    expect(sellerSubscription.eventRecords).toHaveLength(3);

    const eventRecords = sellerSubscription.eventRecords;
    expect(eventRecords![0].type).toBe('CREATE');
    expect(eventRecords![1].type).toBe('PAYMENT');
    expect(eventRecords![2].type).toBe('PAYMENT_SUCCESS');
  });

  it('test 5 - should not be able to enroll another listing plan via payment link if currently have active listing plan', async () => {
    try {
      await sellerSubscriptionService.getListingSubscriptionPaymentLink(
        testUser.id,
        seller!.id,
        buyerStripeCustomerId!,
        testUser.email,
        'DIAMOND_MONTHLY_HKD',
        null,
      );
      fail('Should throw error');
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    }
  });

  it('test 6 - should throw error if change to other currency plan', async () => {
    try {
      await sellerSubscriptionService.subscriptionUpdateGuard(
        seller!.id,
        bevetuSellerSubscriptionId!,
        'DIAMOND_MONTHLY_HKD',
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    }
  });

  it('test 7 - should be able to view the propration amount when update plan to higher price plan', async () => {
    const proation = await sellerSubscriptionService.previewProrationAmount(
      seller!.id,
      bevetuSellerSubscriptionId!,
      'DIAMOND_MONTHLY_GBP',
    );

    expect(proation.prorationPeriod?.start).toBeInstanceOf(Date);
    expect(proation.prorationPeriod?.end).toBeInstanceOf(Date);
    expect(proation.nextPaymentPeriod?.end).toBeInstanceOf(Date);
    expect(proation.nextPaymentPeriod?.end).toBeInstanceOf(Date);
    expect(proation.totalRefund).toBe(
      0 - Number(process.env.SILVER_MONTHLY_GBP_PRICE!),
    );
    expect(proation.totalCharge).toBe(
      Number(process.env.DIAMOND_MONTHLY_GBP_PRICE!),
    );
    expect(proation.nextPaymentQty).toBe(1);
    expect(proation.nextPaymentAmount).toBe(
      Number(process.env.DIAMOND_MONTHLY_GBP_PRICE!),
    );
  });

  it('test 8 - should be able to upgrade the plan', async () => {
    // ------------------------------
    // Setup: Get existing subscription & mapping
    // ------------------------------
    const oldMapping =
      await sellerSubscriptionMappingService.findByBevetuSubscriptionId(
        seller!.id,
        bevetuSellerSubscriptionId!,
      );

    const oldItemInMapping = oldMapping.stripeSubscriptionItems.find(
      (item) => item.category === 'LISTING_SUBSCRIPTION',
    );

    const oldSubscription = await sellerSubscriptionService.findOne(
      seller!.id,
      bevetuSellerSubscriptionId!,
    );
    const oldItemInSubscription = oldSubscription.items.find(
      (item) => item.category === 'LISTING_SUBSCRIPTION',
    );

    // ------------------------------
    // Action: Upgrade subscription
    // ------------------------------
    await sellerSubscriptionService.upgradeListingSubscription(
      seller!.id,
      bevetuSellerSubscriptionId!,
      'DIAMOND_MONTHLY_GBP',
    );

    // ------------------------------
    // Retrieve updated subscription & mapping
    // ------------------------------
    const subscription = await sellerSubscriptionService.findOne(
      seller!.id,
      bevetuSellerSubscriptionId!,
    );

    const mapping =
      await sellerSubscriptionMappingService.findByBevetuSubscriptionId(
        seller!.id,
        bevetuSellerSubscriptionId!,
      );

    // ------------------------------
    // Sort events by creation time
    // ------------------------------
    const sortedEvents = subscription.eventRecords!.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    // ------------------------------
    // Assertions
    // ------------------------------

    // 1. Should have 6 events
    expect(sortedEvents).toHaveLength(6);

    // 2. Last three events should be UPDATE, REFUND, PAYMENT_SUCCESS
    const lastThreeTypes = sortedEvents.slice(-3).map((e) => e.type);
    expect(lastThreeTypes).toEqual(['UPDATE', 'REFUND', 'PAYMENT_SUCCESS']);

    // 3. Check UPDATE event metadata
    const updateEvent = sortedEvents.find((e) => e.type === 'UPDATE');
    expect(updateEvent).toBeDefined();
    expect(updateEvent!.metadata).toEqual({
      from: productCode,
      to: 'DIAMOND_MONTHLY_GBP',
      proration: true,
    });

    // 4. Check REFUND event metadata
    const refundEvent = sortedEvents.find((e) => e.type === 'REFUND');
    expect(refundEvent).toBeDefined();
    expect(refundEvent!.metadata!.refundReason).toBe('Proration Refund');

    // 5. Check last PAYMENT_SUCCESS metadata
    const lastPaymentSuccess = [...sortedEvents]
      .reverse()
      .find((e) => e.type === 'PAYMENT_SUCCESS');
    expect(lastPaymentSuccess).toBeDefined();
    expect(lastPaymentSuccess!.metadata!.productCode).toBe(
      'DIAMOND_MONTHLY_GBP',
    );

    // 6. Check subscription mapping update
    const newItemInMapping = mapping.stripeSubscriptionItems.find(
      (item) => item.category === 'LISTING_SUBSCRIPTION',
    );
    expect(newItemInMapping?.productCode).not.toBe(
      oldItemInMapping?.productCode,
    );
    expect(newItemInMapping?.stripItemId).toBe(oldItemInMapping?.stripItemId);

    // 7. Check subscription update
    const newItemInSubscription = subscription.items.find(
      (item) => item.category === 'LISTING_SUBSCRIPTION',
    );
    expect(newItemInSubscription?.productCode).not.toBe(
      oldItemInSubscription?.productCode,
    );
  });

  it('test 9 - should be able to downgrade change the plan', async () => {});

  // it('test 8 - should not be able to change the plan with currency different from the current plan curency', async () => {});

  // it('test 9 - should be able to cancel the plan', async () => {});

  // it('test 10 - should be able to restore the cancelling plan', async () => {});

  // it('test 11 - should be able to immediately cancel the plan', async () => {});

  // it('test 12 - should be able to reactive the cancelled plan', async () => {});
  // it('test 13 - should be able to use coupon', async () => {});
});
