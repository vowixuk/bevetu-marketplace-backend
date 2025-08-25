/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/**
 *  To run this test solely:
 *
 *  npm run test -- product/test/product.service.spec.ts
 */
import { User } from '../../user/entities/user.entity';

import {
  createTestUser_1,
  createTestUser_2,
  createTestUser_3,
  removeTestingUser,
} from '../../../test/helper/user-helper';

import { testBuyerSetup } from '../../../test/helper/buyer-helper';
import { testSellerSetup } from '../../../test/helper/seller-helper';
import { SellerSubscription } from '../../seller-subscription/entities/seller-subscription.entity';
import { IProduct } from '../../seller-subscription/entities/vo/product.vo';

import {
  ServicesType,
  testTestingMoudleHelper,
} from '../../../test/helper/testing-module/testing-module-helper';
import { Seller } from '../../seller/entities/seller.entity';


describe('ProductService', () => {
  let serviecs: ServicesType;

  // Users who are sellers
  let testSellerUser_1: User;
  let testSellerUser_2: User;

  let seller_1: Omit<Seller, 'userId'>;
  let seller_2: Omit<Seller, 'userId'>;

  let seller_1_StripeAccountId: string;
  let seller_2_StripeAccountId: string;

  let seller_1_StripeCustomerId: string;
  let seller_2_StripeCustomerId: string;

  let seller_1_Subscription: SellerSubscription;
  let seller_2_Subscription: SellerSubscription;

  // Users who is only user
  let testBuyerUser: User;
  let buyerStripeCustomerId: string | null;

  beforeAll(async () => {
    const modelHelper = await testTestingMoudleHelper();
    serviecs = modelHelper.services;

    // Create dummy users

    // ----- Setup testSellerUser_1 ----- //

    testSellerUser_1 = await createTestUser_1(serviecs.userService);
    const seller_1_buyerAccountSetup = await testBuyerSetup(
      testSellerUser_1.id,
      testSellerUser_1.email,
      serviecs.buyerUseCase,
    );
    seller_1_StripeCustomerId =
      seller_1_buyerAccountSetup.buyerStripeCustomerId;

    const seller_1_sellerAccountSetup = await testSellerSetup(
      testSellerUser_1.id,
      serviecs.sellerUseCase,
      serviecs.sellerStripeAccountMappingService,
      serviecs.sellerService,
    );

    seller_1 = seller_1_sellerAccountSetup.seller;
    seller_1_StripeAccountId =
      seller_1_sellerAccountSetup.sellerStripeAccountId;

    // ----- Setup testSellerUser_2 ----- //
    testSellerUser_2 = await createTestUser_2(serviecs.userService);
    const seller_2_buyerAccountSetup = await testBuyerSetup(
      testSellerUser_2.id,
      testSellerUser_2.email,
      serviecs.buyerUseCase,
    );
    seller_2_StripeCustomerId =
      seller_2_buyerAccountSetup.buyerStripeCustomerId;

    const seller_2_sellerAccountSetup = await testSellerSetup(
      testSellerUser_2.id,
      serviecs.sellerUseCase,
      serviecs.sellerStripeAccountMappingService,
      serviecs.sellerService,
    );

    seller_2 = seller_2_sellerAccountSetup.seller;
    seller_2_StripeAccountId =
      seller_2_sellerAccountSetup.sellerStripeAccountId;

    // ----- Setup buyer ----- //

    testBuyerUser = await createTestUser_3(serviecs.userService);
    const buyer_buyerAccountSetup = await testBuyerSetup(
      testBuyerUser.id,
      testBuyerUser.email,
      serviecs.buyerUseCase,
    );
    buyerStripeCustomerId = buyer_buyerAccountSetup.buyerStripeCustomerId;
    // const _subscription = await testEnrollSubscription(
    //   testUser.id,
    //   testUser.email,
    //   _seller.seller.id,
    //   _buyer.buyer.id,
    //   'BRONZE_MONTHLY_GBP',
    //   _buyer.buyerStripeCustomerId,
    //   sellerSubscriptionService,
    //   stripeService,
    // );

    // sellerSubscription = _subscription.subscription;
    // currentListingProduct = _subscription.currentProduct;
  }, 50000);

  afterAll(async () => {
    // -- Remove user account in our database -- //
    if (testSellerUser_1 && testSellerUser_1.id) {
      await removeTestingUser(serviecs.userService, testSellerUser_1.id);
    }
    if (testSellerUser_2 && testSellerUser_2.id) {
      await removeTestingUser(serviecs.userService, testSellerUser_2.id);
    }
    if (testBuyerUser && testBuyerUser.id) {
      await removeTestingUser(serviecs.userService, testBuyerUser.id);
    }
    // -- Remove sell stripe account in Stripe -- //
    if (seller_1_StripeAccountId) {
      await serviecs.stripeService.removeAccount(seller_1_StripeAccountId);
      console.log(
        `Seller account ${seller_1_StripeAccountId} removed from stripe`,
      );
    }
    if (seller_2_StripeCustomerId) {
      await serviecs.stripeService.removeAccount(seller_2_StripeCustomerId);
      console.log(
        `Seller account ${seller_2_StripeCustomerId} removed from stripe`,
      );
    }

    // -- Remove stripe customer account in Stripe -- //
    if (seller_1_StripeCustomerId) {
      await serviecs.stripeService.removeStripeCustomer(
        seller_1_StripeCustomerId,
      );
      console.log(
        `Buyer customer account ${seller_1_StripeCustomerId} removed from stripe`,
      );
    }
    if (seller_2_StripeCustomerId) {
      await serviecs.stripeService.removeStripeCustomer(
        seller_2_StripeCustomerId,
      );
      console.log(
        `Buyer customer account ${seller_2_StripeCustomerId} removed from stripe`,
      );
    }
    if (buyerStripeCustomerId) {
      await serviecs.stripeService.removeStripeCustomer(buyerStripeCustomerId);
      console.log(
        `Buyer customer account ${buyerStripeCustomerId} removed from stripe`,
      );
    }
  });

  it('test 1 - should all roles be defined', () => {
    expect(seller_1).toBeDefined();
    expect(seller_2).toBeDefined();
    expect(testBuyerUser).toBeDefined();
  });

  describe('Sellers',() => {
    // it('test 2 - should not be able to add product without any active subscription.', async () => {});
    // it('test 3 - should not be able to list the product without choosing shipping profile.', async () => {});
    // it('test 4 - should be able to create a shipping profile and add to product.', async () => {});
    // it('test 5 - should be able to list that product after attaching the shipping profile', async () => {});
    // it('test 6 - should be able to change the product details.', async () => {});
    // it('test 7 - should be able to set free shipping option.', async () => {});
    // it('test 8 - should not be able to list item if the listing number exist the allow amount in subscription.', async () => {});
    // it('test 9 - should be able to list item again if the subscription is upgraded', async () => {});
    // it('test 10 - should deactivate all the listed items if downgrade plan', async () => {});
    // it('test 11 - should be able to delete product', async () => {});
    // it('test 12 - should not be able to delete shipping profile if it is used in any products', async () => {});
    // it('test 13 - should not be able to delete shipping profile if it is not in use', async () => {});
    // it('test 14 - should not be able to view aother sellers product', async () => {});
  
  })

  describe('Buyers',() => {
    // it('test 15 - should be be able to view all shop on shelf products', async () => {});
    // it('test 16 - should be be able to view  a shop's on shelf products', async () => {});
  })
  
});
