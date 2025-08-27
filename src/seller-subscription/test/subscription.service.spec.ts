/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { SellerUseCase } from '../../seller/use-cases/seller.useCase';
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
import { BuyerUseCase } from '../../buyer/use-cases/buyer.usecase';
import { BuyerStripeCustomerAccountMappingService } from '../../stripe/services/buyer-account-mapping.service';
import { Buyer } from '../../buyer/entities/buyer.entity';
import { SellerSubscriptionService } from '../services/seller-subscription.service';
import { SellerSubscriptionMappingService } from '../../stripe/services/seller-subscription-mapping.service';
import { CompleteSellerListingSubscriptionEnrollmentDto } from '../dto/complete-seller-listing-subscription-enrollment.dto';
import { IProductCode } from '../entities/vo/product.vo';
import { SellerSubscriptionMappingRepository } from '../../stripe/repositories/seller-subscription-mapping.repository';
import { ForbiddenException } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
        EventEmitterModule.forRoot(),
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
      'DIAMOND_MONTHLY_GBP',
      // bevetuSellerSubscriptionId!,
      null,
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
      'DIAMOND_MONTHLY_GBP',
      // bevetuSellerSubscriptionId!,
      null
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

  it('test 9 - should be able to downgrade change the plan', async () => {
    //from "DIAMOND_MONTHLY_GBP"
    //to "BRONZE_MONTHLY_GBP"

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
    // Action: Downgrade subscription
    // ------------------------------
    await sellerSubscriptionService.downgradeListingSubscription(
      seller!.id,
      'BRONZE_MONTHLY_GBP',
      // bevetuSellerSubscriptionId!,
      null
    );

    // ------------------------------
    // Retrieve updated subscription & mapping
    // ------------------------------
    let subscription = await sellerSubscriptionService.findOne(
      seller!.id,
      bevetuSellerSubscriptionId!,
    );

    const _evetrecord = subscription.eventRecords?.find(
      (e) => e.type == 'PENDING_UPDATE',
    );
    expect(_evetrecord!.metadata!.from).toBe('DIAMOND_MONTHLY_GBP');
    expect(_evetrecord!.metadata!.to).toBe('BRONZE_MONTHLY_GBP');

    let mapping =
      await sellerSubscriptionMappingService.findByBevetuSubscriptionId(
        seller!.id,
        bevetuSellerSubscriptionId!,
      );
    // No change yet as not effective immediately
    expect(mapping).toEqual(oldMapping);

    // ------------------------------
    // Check if stripe updated
    // ------------------------------
    const stripeSubscription =
      await stripeService.getSubscriptionDetailsByCustomerId(
        buyerStripeCustomerId!,
      );

    const metadata = stripeSubscription.metadata;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const pendingUpdate = JSON.parse(metadata.pending_update);
    expect(pendingUpdate).toEqual({
      sellerId: seller!.id,
      bevetuSubscriptionId: bevetuSellerSubscriptionId,
      currentProductCode: 'DIAMOND_MONTHLY_GBP',
      newProductCode: 'BRONZE_MONTHLY_GBP',
    });

    // ------------------------------
    // Manually triggering webhook update
    // ------------------------------
    const newStripeSubscriptionItemId = 'Dummy_newStripeSubscriptionItemId';
    await sellerSubscriptionService.completeUpdateListingSubscription(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      pendingUpdate.sellerId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      pendingUpdate.bevetuSubscriptionId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      pendingUpdate.newProductCode,
      newStripeSubscriptionItemId,
    );

    // ------------------------------
    // Retrieve updated subscription & mapping
    // ------------------------------
    subscription = await sellerSubscriptionService.findOne(
      seller!.id,
      bevetuSellerSubscriptionId!,
    );

    mapping = await sellerSubscriptionMappingService.findByBevetuSubscriptionId(
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
    expect(sortedEvents).toHaveLength(8);

    // 2. Last three events should be UPDATE, REFUND, PAYMENT_SUCCESS
    const lastThreeTypes = sortedEvents.slice(-2).map((e) => e.type);
    expect(lastThreeTypes).toEqual(['PENDING_UPDATE', 'UPDATE']);

    // 3. Check UPDATE event metadata
    const updateEvents = subscription.eventRecords?.filter(
      (e) => e.type == 'UPDATE',
    );

    const mostRecentUpdate = updateEvents!.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];

    expect(updateEvents).toHaveLength(2);
    expect(mostRecentUpdate.metadata!.from).toBe('DIAMOND_MONTHLY_GBP');
    expect(mostRecentUpdate.metadata!.to).toBe('BRONZE_MONTHLY_GBP');
    expect(mostRecentUpdate.metadata!.proration).toBe(false);

    // 6. Check subscription mapping update
    const newItemInMapping = mapping.stripeSubscriptionItems.find(
      (item) => item.category === 'LISTING_SUBSCRIPTION',
    );

    expect(newItemInMapping?.productCode).not.toBe(
      oldItemInMapping?.productCode,
    );
    expect(newItemInMapping?.stripItemId).toBe(newStripeSubscriptionItemId);

    // 7. Check subscription update
    const newItemInSubscription = subscription.items.find(
      (item) => item.category === 'LISTING_SUBSCRIPTION',
    );

    expect(newItemInSubscription?.productCode).not.toBe(
      oldItemInSubscription?.productCode,
    );
    expect(newItemInSubscription?.productCode).toBe('BRONZE_MONTHLY_GBP');

    // 9. Check if the stripe subscription has metadata removed:
    const stripeSubscription2 =
      await stripeService.getSubscriptionDetailsByCustomerId(
        buyerStripeCustomerId!,
      );

    // Stripe metadata is usually an object, not a JSON string, so no need to parse
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const metadata2 = stripeSubscription2.metadata;

    // pending_update should be removed (undefined) or null
    expect(
      metadata2.pending_update === null ||
        metadata2.pending_update === undefined,
    ).toBe(true);

    // bevetuSubscriptionId should still exist
    expect(metadata2.bevetuSubscriptionId).toBe(bevetuSellerSubscriptionId!);
  });

  it('test 10 - should be able to cancel the plan', async () => {
    // ------------------------------
    // 1. Action: Cancel subscription
    // ------------------------------
    const cancelReason = 'I wanna cancel the plan';
    await sellerSubscriptionService.cancellingSubscription(
      seller!.id,
      bevetuSellerSubscriptionId!,
      cancelReason,
    );

    // ------------------------------
    // 2. Retrieve updated subscription & mapping
    // ------------------------------
    const { subscription, currentProduct } =
      await sellerSubscriptionService.findCurrentSubscriptionAndMapping(
        seller!.id,
        bevetuSellerSubscriptionId!,
      );

    expect(subscription.createdAt).toBeDefined();
    expect(subscription.status).toBe('CANCELLING');

    const pendingCancelEvent = subscription.eventRecords?.find(
      (e) => e.type === 'PENDING_CANCEL',
    );


    expect(subscription.eventRecords).toHaveLength(9);
    expect(pendingCancelEvent!.metadata!.productCode).toBe(currentProduct.code);
    expect(pendingCancelEvent!.metadata!.cancelReason).toBe(cancelReason);
    expect(pendingCancelEvent!.metadata!.cancelAt).toBeDefined();

    // ------------------------------
    // 3. Check Stripe subscription update
    // ------------------------------
    const stripeSubscription =
      await stripeService.getSubscriptionDetailsByCustomerId(
        buyerStripeCustomerId!,
      );

    const metadata = stripeSubscription.metadata;
    const pendingCancel = JSON.parse(metadata.pending_cancel);

    

    expect(pendingCancel).toEqual({
      sellerId: seller!.id,
      bevetuSubscriptionId: bevetuSellerSubscriptionId,
    });

    // ------------------------------
    // 4. Manually trigger webhook update (simulate cancellation completion)
    // ------------------------------
    await sellerSubscriptionService.completeCancelListingSubscription(
      pendingCancel!.sellerId,
      pendingCancel!.bevetuSubscriptionId,
    );

    // ------------------------------
    // 5. Retrieve updated subscription after webhook
    // ------------------------------
    const { subscription: subscription2, currentProduct: currentProduct2 } =
      await sellerSubscriptionService.findCurrentSubscriptionAndMapping(
        seller!.id,
        bevetuSellerSubscriptionId!,
      );

    // Sort events by creation time
    const sortedEvents = subscription2.eventRecords!.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    // ------------------------------
    // 6. Assertions after cancellation
    // ------------------------------
    expect(subscription2.status).toBe('CANCELLED');

    // Should now have 10 events
    expect(sortedEvents).toHaveLength(10);

    // Last two events should be PENDING_CANCEL -> CANCELLED
    const lastTwoTypes = sortedEvents.slice(-2).map((e) => e.type);
    expect(lastTwoTypes).toEqual(['PENDING_CANCEL', 'CANCELLED']);

    // Check CANCELLED event metadata
    const cancelledEvents = subscription2.eventRecords?.find(
      (e) => e.type === 'CANCELLED',
    );
    expect(cancelledEvents!.metadata!.productCode).toBe(currentProduct2.code);

    // ------------------------------
    // 7. Check Stripe metadata cleanup
    // ------------------------------
    const stripeSubscription2 =
      await stripeService.getSubscriptionDetailsByCustomerId(
        buyerStripeCustomerId!,
      );

    const metadata2 = stripeSubscription2.metadata;


    // pending_cancel should be removed
    expect(
      metadata2.pending_cancel === null ||
        metadata2.pending_cancel === undefined,
    ).toBe(true);

    // bevetuSubscriptionId + platform should still exist
    expect(metadata2.bevetuSubscriptionId).toBe(bevetuSellerSubscriptionId!);
    expect(metadata2.platform).toBe('MARKETPLACE');
  });

  it('test 11 - should be able to restore the cancelling plan', async () => {
    // ------------------------------
    // 1. Action: Cancel subscription
    // ------------------------------
    await sellerSubscriptionService.restoreSubscription(
      seller!.id,
      bevetuSellerSubscriptionId!,
    );

    // ------------------------------
    // 2. Retrieve updated subscription & mapping
    // ------------------------------
    const { subscription, currentProduct } =
      await sellerSubscriptionService.findCurrentSubscriptionAndMapping(
        seller!.id,
        bevetuSellerSubscriptionId!,
      );

    expect(subscription.cancelAt).toBeUndefined();
    expect(subscription.status).toBe('ACTIVE');

    const pendingCancelEvent = subscription.eventRecords?.find(
      (e) => e.type === 'RESTORE',
    );

    expect(subscription.eventRecords).toHaveLength(11);
    expect(pendingCancelEvent!.metadata!.productCode).toBe(currentProduct.code);

    // ------------------------------
    // 3. Check Stripe subscription update
    // ------------------------------
    const stripeSubscription =
      await stripeService.getSubscriptionDetailsByCustomerId(
        buyerStripeCustomerId!,
      );

    // Stripe metadata is usually an object, not a JSON string, so no need to parse
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const metadata2 = stripeSubscription.metadata;

    // pending_update should be removed (undefined) or null
    expect(
      metadata2.pending_update === null ||
        metadata2.pending_update === undefined,
    ).toBe(true);

    // bevetuSubscriptionId should still exist
    expect(metadata2.bevetuSubscriptionId).toBe(bevetuSellerSubscriptionId!);

    
  });

  it('test 12 - should be able to immediately cancel the plan', async () => {
    // ------------------------------
    // 1. Action: Cancel subscription
    // ------------------------------

    await sellerSubscriptionService.cancelSubscriptionInStripeImmediately(
      seller!.id,
      bevetuSellerSubscriptionId!,
    );

    // ------------------------------
    // 2. Retrieve updated subscription & mapping
    // ------------------------------
    const { subscription, currentProduct } =
      await sellerSubscriptionService.findCurrentSubscriptionAndMapping(
        seller!.id,
        bevetuSellerSubscriptionId!,
      );

    expect(subscription.createdAt).toBeDefined();
    expect(subscription.status).toBe('CANCELLING');

    const pendingCancelEvent = subscription.eventRecords?.filter(
      (e) => e.type === 'PENDING_CANCEL',
    );
    // Sort events by creation time
    const sortedpendingCancelEvents = pendingCancelEvent!.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    expect(subscription.eventRecords).toHaveLength(12);
    expect(sortedpendingCancelEvents[1]!.metadata!.cancelReason).toBe(
      'Request to cancel immediately',
    );

    // ------------------------------
    // 3. Check Stripe subscription update
    // Stripe Subscription is cannceled. no need to test here
    // ------------------------------

    // ------------------------------
    // 4. Manually trigger webhook update (simulate cancellation completion)
    // ------------------------------
    await sellerSubscriptionService.completeCancelListingSubscription(
      seller!.id,
      bevetuSellerSubscriptionId!,
      true
    );
  });

  it('test 13 - should be able to enroll the plan after cancelling subscription', async () => {
    const { subscription } =
      await sellerSubscriptionService.findCurrentSubscriptionAndMapping(
        seller!.id,
        bevetuSellerSubscriptionId!,
      );

    expect(subscription.status).toBe('CANCELLED');


    const paymentUrl =
      await sellerSubscriptionService.getListingSubscriptionPaymentLink(
        testUser.id,
        seller!.id,
        buyerStripeCustomerId!,
        testUser.email,
        'GOLD_MONTHLY_HKD',
        null,
      );

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


      const subscriptionDetails =
        await stripeService.getSubscriptionDetailsByCustomerId(
          buyerStripeCustomerId!,
        );
        stripeSubscriptionId = subscriptionDetails.stripeSubscriptionId;

        bevetuSellerSubscriptionId =
          await sellerSubscriptionService.completeSellerListingSubscriptionEnrollment(
            Object.assign(
              new CompleteSellerListingSubscriptionEnrollmentDto(),
              {
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
              },
            ),
          );


      const subscriptions =
        await sellerSubscriptionService.findAllBySellerId(seller!.id);

      expect(subscriptions).toHaveLength(2)

  }, 30000);


  it('test 14 - should be able update event record after regular payment success', async () => {
   
    const nextPaymentAmount = 300
    const nextPaymentDate =new Date('2023-09-01T12:00:00Z');
    await sellerSubscriptionService.invoicePaymentSuccessded(
      seller!.id,
      bevetuSellerSubscriptionId!,
      {
        paidAmount:  nextPaymentAmount,
        nextPaymentDate,
        nextPaymentAmount:nextPaymentAmount
      }
    )

    const { subscription,subscriptionMapping ,currentProduct} =
      await sellerSubscriptionService.findCurrentSubscriptionAndMapping(
        seller!.id,
        bevetuSellerSubscriptionId!,
      );

    const eventRecords = subscription.eventRecords

  
    // expect(subscription.nextPaymentDate).toBe(nextPaymentDate.);
    expect(subscription.status).toBe('ACTIVE');
    expect(eventRecords).toHaveLength(4);

    const successEvent = eventRecords?.filter((e) => e.type == 'PAYMENT_SUCCESS')[1];

   
   
    expect(successEvent?.metadata!.productCode).toBe(currentProduct.code)
    expect(successEvent?.metadata!.paidAmount).toBe(nextPaymentAmount);
    // expect(successEvent?.metadata!.nextPaymentDate).toBe(nextPaymentDate);
    expect(successEvent?.metadata!.nextPaymentAmount).toBe(nextPaymentAmount);

    
  });

  it('test 15 - should be able update subscription and event record after regular payment faile', async () => {

    const nextPaymentAmount = 300;
    const nextPaymentDate = new Date('2023-09-01T12:00:00Z');
    await sellerSubscriptionService.invoicePaymentFailed(
      seller!.id,
      bevetuSellerSubscriptionId!,
      'insufficient fund'
    );

    const { subscription, currentProduct } =
      await sellerSubscriptionService.findCurrentSubscriptionAndMapping(
        seller!.id,
        bevetuSellerSubscriptionId!,
      );

    const eventRecords = subscription.eventRecords;

    console.log(subscription, '<< subscription');
    console.log(eventRecords, '<< eventRecords');
    // expect(subscription.nextPaymentDate).toBe(nextPaymentDate.);
    expect(subscription.status).toBe('PAYMENT_FAILED');
    expect(eventRecords).toHaveLength(5);

    const successEvent = eventRecords?.find((e) => e.type == 'PAYMENT_FAILED');

    expect(successEvent?.metadata!.productCode).toBe(currentProduct.code);
    expect(successEvent?.metadata!.failReason).toBe('insufficient fund');


  });
});
