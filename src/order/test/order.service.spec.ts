/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

/**
 *  To run this test solely:
 *
 *  npm run test -- order/test/order.service.spec.ts
 */
import { User } from '../../user/entities/user.entity';

import {
  createTestUser_1,
  createTestUser_2,
  createTestUser_3,
  removeTestingUser,
} from '../../../test/helper/user-helper';

import { setupMarketplaceTestEnvironment } from '../../../test/helper/marketplace-environment-setup';

import { testBuyerSetup } from '../../../test/helper/buyer-helper';
import { testSellerSetup } from '../../../test/helper/seller-helper';
import { SellerSubscription } from '../../seller-subscription/entities/seller-subscription.entity';
import { IProduct } from '../../seller-subscription/entities/vo/product.vo';

import {
  ServicesType,
  testTestingMoudleHelper,
} from '../../../test/helper/testing-module/testing-module-helper';
import { Seller } from '../../seller/entities/seller.entity';
import { CreateProductDto } from '../../product/dto/create-product.dto';
import { Shop } from '../../shop/entities/shop.entity';
import { createTestShop1 } from '../../../test/helper/shop-helper';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { testEnrollSubscription } from '../../../test/helper/subscription-helper';
import { ViewProductsDto } from '../../product/dto/view-products.dto';
import { CreateSellerShippingDto } from '../../seller-shipping/dto/create-seller-shipping.dto';
import { UpdateSellerShippingDto } from '../../seller-shipping/dto/update-seller-shipping.dto';
import { CreateSellerShippingProfileDto } from '../../seller-shipping/dto/create-seller-shipping-profile.dto';
import { UpdateProductDto } from '../../product/dto/update-product.dto';
import { Product } from '../../product/entities/product.entity';
import { SellerShipping } from '../../seller-shipping/entities/seller-shipping.entity';

describe('OrderService', () => {
  let services: ServicesType;

  // Users who are sellers
  let testSellerUser_1: User;
  let testSellerUser_2: User;

  let seller_1: Omit<Seller, 'userId'>;
  let seller_2: Omit<Seller, 'userId'>;

  let seller_1_buyer_id: string;
  let seller_2_buyer_id: string;

  let seller_1_shop: Shop;
  let seller_2_shop: Shop;

  let seller_1_shipping: SellerShipping;
  let seller_2_shipping: SellerShipping;

  let seller_1_products: Omit<Product, 'sellerId'>[];
  let seller_2_products: Omit<Product, 'sellerId'>[];

  let seller_1_StripeAccountId: string;
  let seller_2_StripeAccountId: string;

  let seller_1_StripeCustomerId: string;
  let seller_2_StripeCustomerId: string;

  let seller_1_Subscription: SellerSubscription;
  let seller_2_Subscription: SellerSubscription;

  // Users who is only buyer
  let testBuyerUser: User;
  let buyerStripeCustomerId: string | null;

  beforeAll(async () => {
    const modelHelper = await testTestingMoudleHelper();
    services = modelHelper.services;

    // Create dummy users
    // ----- Setup market place evnironment ----- //

    const { seller1, seller2, buyer } =
      await setupMarketplaceTestEnvironment(services);

    testSellerUser_1 = seller1.user;
    seller_1_StripeCustomerId = seller1.buyerStripeCustomerId;
    seller_1_buyer_id = seller1.buyer.id;
    seller_1 = seller1.seller;
    seller_1_StripeAccountId = seller1.sellerStripeAccountId;
    seller_1_shop = seller1.shop;
    seller_1_shipping = seller1.shipping;

    testSellerUser_2 = seller2.user;
    seller_2_StripeCustomerId = seller2.buyerStripeCustomerId;
    seller_2_buyer_id = seller2.buyer.id;
    seller_2 = seller2.seller;
    seller_2_StripeAccountId = seller2.sellerStripeAccountId;
    seller_2_shop = seller2.shop;
    seller_2_shipping = seller2.shipping;

    // ----- Setup buyer ----- //
    testBuyerUser = buyer.user;
    buyerStripeCustomerId = buyer.buyerStripeCustomerId;
  }, 50000);

  afterAll(async () => {
    // -- Remove user account in our database -- //
    if (testSellerUser_1 && testSellerUser_1.id) {
      await removeTestingUser(services.userService, testSellerUser_1.id);
    }
    if (testSellerUser_2 && testSellerUser_2.id) {
      await removeTestingUser(services.userService, testSellerUser_2.id);
    }
    if (testBuyerUser && testBuyerUser.id) {
      await removeTestingUser(services.userService, testBuyerUser.id);
    }
    // -- Remove sell stripe account in Stripe -- //
    if (seller_1_StripeAccountId) {
      await services.stripeService.removeAccount(seller_1_StripeAccountId);
      console.log(
        `Seller account ${seller_1_StripeAccountId} removed from stripe`,
      );
    }
    if (seller_2_StripeAccountId) {
      await services.stripeService.removeAccount(seller_2_StripeAccountId);
      console.log(
        `Seller account ${seller_2_StripeAccountId} removed from stripe`,
      );
    }

    // -- Remove stripe customer account in Stripe -- //
    if (seller_1_StripeCustomerId) {
      await services.stripeService.removeStripeCustomer(
        seller_1_StripeCustomerId,
      );
      console.log(
        `Buyer customer account ${seller_1_StripeCustomerId} removed from stripe`,
      );
    }
    if (seller_2_StripeCustomerId) {
      await services.stripeService.removeStripeCustomer(
        seller_2_StripeCustomerId,
      );
      console.log(
        `Buyer customer account ${seller_2_StripeCustomerId} removed from stripe`,
      );
    }
    if (buyerStripeCustomerId) {
      await services.stripeService.removeStripeCustomer(buyerStripeCustomerId);
      console.log(
        `Buyer customer account ${buyerStripeCustomerId} removed from stripe`,
      );
    }
  }, 50000);

  it('test 1 - should all roles be defined', () => {
    expect(seller_1).toBeDefined();
    expect(seller_2).toBeDefined();
    expect(testBuyerUser).toBeDefined();
  });

   describe.skip('Buyer Checkout', () => {
     it('test 2 - should able to make address record', async () => {});
     it('test 3 - should able to create order item', async () => {});
     it('test 4 - should able to make order record, event record and get the payment link', async () => {});
   });


  describe.skip('After Payment Success', () => {
    it('test 5 - should update the order status and event record', async () => {});
    it('test 6 - should update the cart checkout done', async () => {});
    it('test 7 - should get a new cart', async () => {});
  });  
  
  describe.skip('After Payment Fail', () => {
    it('test 8 - should update the order status and event record', async () => {});
    it('test 9 - should remain the cart checkout undone', async () => {});
    it('test 10 - should keep the old cart', async () => {});
  });

  describe.skip('Seller View Order', () => {
    it('test 11 - should view the order', async () => {});
    it('test 12 - should order cannot be viewed by order sellers ',async () => {});
  });
});
