/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

/**
 *  To run this test solely:
 *
 *  npm run test -- order/test/order.service.spec.ts
 */
import { User } from '../../user/entities/user.entity';
import { removeTestingUser } from '../../../test/helper/user-helper';
import { setupMarketplaceTestEnvironment,addProductToCart } from '../../../test/helper/marketplace-environment-setup';
import { SellerSubscription } from '../../seller-subscription/entities/seller-subscription.entity';

import puppeteer from 'puppeteer';
import {
  ServicesType,
  testTestingMoudleHelper,
} from '../../../test/helper/testing-module/testing-module-helper';
import { Seller } from '../../seller/entities/seller.entity';
import { Shop } from '../../shop/entities/shop.entity';
import { Product } from '../../product/entities/product.entity'
import { SellerShipping } from '../../seller-shipping/entities/seller-shipping.entity';
import { Buyer } from '../../buyer/entities/buyer.entity';
import { Cart } from '../../../src/cart/entities/cart.entity';
import { SellerShippingProfile } from '../../seller-shipping/entities/seller-shipping-profile.entity';
import { Order } from '../entities/order.entity';
import { Address } from 'src/buyer/entities/address.vo';
import { OrderAddress } from '../entities/order-address';
import { CreateOrderAddressDto } from '../dto/create-order-address.dto';

describe('OrderService', () => {
  
    let services: ServicesType;

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

    let seller_1_shippingProfiles: {
      free: SellerShippingProfile;
      flat: SellerShippingProfile;
      per_item: SellerShippingProfile;
      by_weight: SellerShippingProfile;
    }; 
    let seller_2_shippingProfiles: {
      free: SellerShippingProfile;
      flat: SellerShippingProfile;
      per_item: SellerShippingProfile;
      by_weight: SellerShippingProfile;
    }; 

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
    let testBuyer : Buyer;
    let buyerStripeCustomerId: string | null;
  
  
    //Cart 
    let cart: Cart

    let address :OrderAddress;
    let order: Order

    let paymentUrl: string;
  
    beforeAll(async () => {
      const modelHelper = await testTestingMoudleHelper();
      services = modelHelper.services;
  
      // Create dummy users
      // ----- Setup market place evnironment ----- //
  
      const { seller1, seller2,  buyer } =
        await setupMarketplaceTestEnvironment(services);
  
  
      testSellerUser_1 = seller1.user
      seller_1 = seller1.seller;
      seller_1_StripeCustomerId = seller1.buyerStripeCustomerId;
      seller_1_buyer_id = seller1.buyer.id
      seller_1_StripeAccountId = seller1.sellerStripeAccountId;
      seller_1_shop = seller1.shop;
      seller_1_shipping = seller1.shipping
      seller_1_Subscription = seller1.subscription.subscription
      seller_1_shippingProfiles = seller1.shippingProfiles
      seller_1_products = seller1.products
  
  
      testSellerUser_2 = seller2.user;
      seller_2 = seller2.seller;
      seller_2_StripeCustomerId = seller2.buyerStripeCustomerId;
      seller_2_buyer_id = seller2.buyer.id;
      seller_2_StripeAccountId = seller2.sellerStripeAccountId;
      seller_2_shop = seller2.shop;
      seller_2_shipping = seller2.shipping;
      seller_2_Subscription = seller2.subscription.subscription;
      seller_2_shippingProfiles = seller2.shippingProfiles;
      seller_2_products = seller2.products;
  
  
      // ----- Setup buyer ----- //
      testBuyerUser = buyer.user
      testBuyer = buyer.buyer
      buyerStripeCustomerId = buyer.buyerStripeCustomerId;

    }, 100000);
  
    afterAll(async () => {
      // -- Remove user account in our database -- //
      const testUsers = [
        testSellerUser_1,
        testSellerUser_2,
        testBuyerUser,
      ];
  
      for (const user of testUsers) {
        if (user?.id) {
          await removeTestingUser(services.userService, user.id);
        }
      }
  
      // -- Remove seller stripe accounts in Stripe -- //
      for (const accountId of [
        seller_1_StripeAccountId,
        seller_2_StripeAccountId,
      ]) {
        if (accountId) {
          await services.stripeService.removeAccount(accountId);
          console.log(`Seller account ${accountId} removed from Stripe`);
        }
      }
  
      // -- Remove stripe customer accounts in Stripe -- //
      for (const customerId of [
        seller_1_StripeCustomerId,
        seller_2_StripeCustomerId,
      ]) {
        if (customerId) {
          await services.stripeService.removeStripeCustomer(customerId);
          console.log(`Buyer customer account ${customerId} removed from Stripe`);
        }
      }
  
      if (buyerStripeCustomerId) {
        await services.stripeService.removeStripeCustomer(buyerStripeCustomerId);
        console.log(
          `Buyer customer account ${buyerStripeCustomerId} removed from Stripe`,
        );
      }
    }, 50000);

  it('test 1 - should all roles be defined and product added to cart', async () => {
    expect(seller_1).toBeDefined();
    expect(seller_2).toBeDefined();
    expect(testBuyerUser).toBeDefined();

    // Add products to cart
    cart = await services.cartService.findOrCreateUncheckoutCart(testBuyer.id);

    cart = await addProductToCart(
      cart,
      testBuyer,
      seller_1_products,
      seller_2_products,
      services.addItemToCartUseCase,
    );

    expect(cart.items).toHaveLength(9)
  });

   describe('Buyer Checkout', () => {
     it('test 2 - should able to generte a payment link', async () => {
      
      paymentUrl = await services.createOrderUseCase.execute(
        testBuyer.id,
        cart.id,
        {
          orderId: '',
          buyerId: testBuyer.id,
          fullName: 'John Doe',
          phoneNumber: '+44 7712 345678',
          line1: '221B Baker Street',
          line2: 'Flat 2A',
          city: 'London',
          postalCode: 'NW1 6XE',
          country: 'United Kingdom',
        } as CreateOrderAddressDto,
      );

      console.log(paymentUrl, '<< paymentLink');
      expect(paymentUrl).toBeDefined();


     });

     it('test 6 - should be able to pay via that payment url', async () => {
       const browser = await puppeteer.launch({ headless: false });
       const page = await browser.newPage();
       try {
         await page.goto(paymentUrl);
         await page.waitForSelector('#cardNumber');
         await page.type('#email', testBuyerUser.email);
         await page.type('#cardNumber', '4242424242424242');
         await page.type('#cardExpiry', '12/34');
         await page.type('#cardCvc', '123');
         await page.type('#billingName', 'testUser');
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

     it('test 3 - should able to create order item', async () => {

      const orders = await services.orderService.fineByBuyerId(testBuyer.id);
      order = orders[0]
      expect(order.items).toHaveLength(9);
      expect(order.paymentStatus).toBe('PENDING');
      expect(order.eventRecords).toHaveLength(1);
      expect(order.attributes?.stripeSessionId).toBeDefined();
      expect(order.eventRecords[0]).toMatchObject({
        orderId: order.id,
        type: 'CREATE',
        metadata: {
          currency: 'GBP',
          itemCount: 40,
          totalAmount: 2386.5,
          paymentMethod: 'Stripe',
        },
      });

     });
   });


  describe.skip('After Payment Success', () => {
    it('test 5 - should update the order status and event record', async () => {
      
      await services.afterPaymentSuccessUseCase.execute(order.id,"GBP",order.totalAmount,0)
      
      const checkOrder = await services.orderService.fineOne(order.id)
      expect(checkOrder.paymentStatus).toBe('SUCCESS');
      expect(checkOrder.eventRecords).toHaveLength(2)
      expect(checkOrder.eventRecords).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'PAYMENT_SUCCESS' }),
        ]),
      );
    });
    it('test 6 - should update the cart checkout done', async () => {
      const checkCart = await services.cartService.findOneIfOwned(testBuyer.id,cart.id)
      expect(checkCart?.isCheckout).toBeTruthy()
    });
    it('test 7 - should get a new cart', async () => {
      const newCart = await services.cartService.findOrCreateUncheckoutCart(
        testBuyer.id,
      );

      expect(newCart.items).toHaveLength(0)
      expect(newCart.isCheckout).toBeFalsy()
        
    });
  });  
  
  describe('After Payment Fail', () => {
    it('test 8 - should update the order status and event record', async () => {
      await services.afterPaymentFailUseCase.execute(
        order.id,
        'the payment fail',
      );
      const checkOrder = await services.orderService.fineOne(order.id);
      expect(checkOrder.paymentStatus).toBe('FAILED');
      expect(checkOrder.eventRecords).toHaveLength(2);
      expect(checkOrder.eventRecords).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'PAYMENT_FAIL' }),
        ]),
      );


    });
    it('test 9 - should remain the cart checkout undone', async () => {
        const checkCart = await services.cartService.findOneIfOwned(
          testBuyer.id,
          cart.id,
        );
        expect(checkCart?.isCheckout).toBeFalsy();
    });

     it('test 10 - should remain the same cart', async () => {
       const newCart = await services.cartService.findOrCreateUncheckoutCart(
         testBuyer.id,
       );

       expect(newCart.id).toBe(cart.id);

     });

  });

  /**
   *   TODO
   */
  // describe.skip('Seller View Order', () => {
  //   it('test 11 - should view the order', async () => {});
  //   it('test 12 - should order cannot be viewed by order sellers ',async () => {});
  // });

  
})