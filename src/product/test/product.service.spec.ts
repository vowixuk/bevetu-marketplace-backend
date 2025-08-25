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


describe('ProductService', () => {
  let serviecs: ServicesType;

  let testUser: User;
  let buyerStripeCustomerId: string | null;
  let sellerStripeAccountId: string;
  let sellerSubscription: SellerSubscription;
  let currentListingProduct: IProduct;

  beforeAll(async () => {
    const modelHelper = await testTestingMoudleHelper();
    serviecs = modelHelper.services;

    // Create a dummy user
    testUser = await createTestUser_1(serviecs.userService);

    // Create a dummy buyer
    const _buyer = await testBuyerSetup(
      testUser.id,
      testUser.email,
      serviecs.buyerUseCase,
    );
    buyerStripeCustomerId = _buyer.buyerStripeCustomerId;

    // Create a dummy seller
    const _seller = await testSellerSetup(
      testUser.id,
      serviecs.sellerUseCase,
      serviecs.sellerStripeAccountMappingService,
      serviecs.sellerService,
    );
    sellerStripeAccountId = _seller.sellerStripeAccountId;

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
    if (testUser && testUser.id) {
      await removeTestingUser(serviecs.userService, testUser.id);
    }
    if (sellerStripeAccountId) {
      await serviecs.stripeService.removeAccount(sellerStripeAccountId);
      console.log(
        `Seller account ${sellerStripeAccountId} removed from stripe`,
      );
    }

    if (buyerStripeCustomerId) {
      await serviecs.stripeService.removeStripeCustomer(buyerStripeCustomerId);
      console.log(
        `Buyer customer account ${buyerStripeCustomerId} removed from stripe`,
      );
    }
  });

  it('test 1 - should be defined', () => {
    expect(buyerStripeCustomerId).toBeDefined();
    expect(buyerStripeCustomerId).toBeDefined();
  });
  it('test 2 - should not be able to add product without any active subscription.', async () => {});
  it('test 3 - should be able to add product to shop after having active subscription.', async () => {});
  it('test 4 - should not be able to listing the product without choosing shipping profile.', async () => {});
  it('test 5 - should be able to create a shipping profile and add to  product.', async () => {});
  it('test 6 - should be able to and list that product.', async () => {});
  it('test 7 - should be able to change the product details.', async () => {});
  it('test 8 - should be able to set free shipping option.', async () => {});
  it('test 9 - should not be able to list item if the listing number exist the allow amount in subscription.', async () => {});
  it('test 10 - should be able to list item again if the subscription is upgraded', async () => {});
  it('test 11 - should deactivate all the listed items if downgrade plan', async () => {});
  it('test 12 - should be able to delete product', async () => {});
  it('test 13 - should not be able to delete shipping profile if it is used in any products', async () => {});
  it('test 14 - should not be able to delete shipping profile if it is not in use', async () => {});
});
