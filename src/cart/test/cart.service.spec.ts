/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

/**
 *  To run this test solely:
 *
 *  npm run test -- cart/test/cart.service.spec.ts
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
import { Product } from '../../product/entities/product.entity'
import { SellerShipping } from '../../seller-shipping/entities/seller-shipping.entity';
import { Buyer } from '../../buyer/entities/buyer.entity';
import { Cart } from '../entities/cart.entity';
import { SellerShippingProfile } from '../../seller-shipping/entities/seller-shipping-profile.entity';
import { CreateCartItemDto } from '../dto/create-cart-item.dto';
import { AddItemToCartDto } from '../dto/add-item-to-cart.dto';
import { UpdateItemQtyInCartDto } from '../dto/update-item-qty-in-cart.dto';

describe('CartService', () => {
  let services: ServicesType;

let testSellerUser_1: User;
let testSellerUser_2: User;
let testSellerUser_3: User;
let testSellerUser_4: User;

let seller_1: Omit<Seller, 'userId'>;
let seller_2: Omit<Seller, 'userId'>;
let seller_3: Omit<Seller, 'userId'>;
let seller_4: Omit<Seller, 'userId'>;

let seller_1_buyer_id: string;
let seller_2_buyer_id: string;
let seller_3_buyer_id: string;
let seller_4_buyer_id: string;

let seller_1_shop: Shop;
let seller_2_shop: Shop;
let seller_3_shop: Shop;
let seller_4_shop: Shop;

let seller_1_shipping: SellerShipping;
let seller_2_shipping: SellerShipping;
let seller_3_shipping: SellerShipping;
let seller_4_shipping: SellerShipping;

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
let seller_3_products: Omit<Product, 'sellerId'>[];
let seller_4_products: Omit<Product, 'sellerId'>[];

let seller_1_StripeAccountId: string;
let seller_2_StripeAccountId: string;


let seller_1_StripeCustomerId: string;
let seller_2_StripeCustomerId: string;


let seller_1_Subscription: SellerSubscription;
let seller_2_Subscription: SellerSubscription;
let seller_3_Subscription: SellerSubscription;
let seller_4_Subscription: SellerSubscription;

  // Users who is only buyer
  let testBuyerUser: User;
  let testBuyer : Buyer;
  let buyerStripeCustomerId: string | null;


  //Cart 
  let cart: Cart

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
      // testSellerUser_3,
      // testSellerUser_4,
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
      // seller_3_StripeAccountId,
      // seller_4_StripeAccountId,
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
      // seller_3_StripeCustomerId,
      // seller_4_StripeCustomerId,
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


  it('test 1 - should all roles be defined', () => {
    expect(seller_1).toBeDefined();
    expect(seller_2).toBeDefined();
    expect(testBuyerUser).toBeDefined();
  });

  describe.skip('Cart Creation', () => {

    it('test 2 - should create a cart if no checkedout cart before and  get the same uncheckedout cart', async () => {
      // use the same `findOrCreateUncheckoutCart()`.
      const createdCart = await services.cartService.findOrCreateUncheckoutCart(
        testBuyer.id,
      );

      const findCart = await services.cartService.findOrCreateUncheckoutCart(
        testBuyer.id,
      );
      expect(createdCart).toEqual(findCart);
      expect(findCart.isCheckout).toBeFalsy();

      cart = findCart;
    });
 
    it('test 3 - should create another cart if the cart is checkedout', async () => {
      // if using findOrCreateUncheckoutCart() should fetch the same one not create new one
      const findCart1 = await services.cartService.findOrCreateUncheckoutCart(
        testBuyer.id,
      );
      expect(findCart1).toEqual(cart);

      // set the current cart to be checkouted
      await services.cartService.setCheckoutDone(testBuyer.id, cart.id);

      // when find it again it should be checkout = true
      const findCart1Again = await services.cartService.findOneIfOwned(
        testBuyer.id,
        findCart1.id,
      );

      // if using findOrCreateUncheckoutCart() should create and return new cart
      const findCart2 = await services.cartService.findOrCreateUncheckoutCart(
        testBuyer.id,
      );

      expect(findCart2.id).not.toBe(findCart1.id);
      expect(findCart1Again?.isCheckout).toBeTruthy();

      cart = findCart2;
    });
  });

  describe.skip('Cart Function', () => {
    /*
     * Products in each shop
     * -------------------------------------------------------------------------------------------------
     *  Seller 1 (shippingProfiles version 1)           Seller 2 (shippingProfiles version 2)
     *  ------------------------------------------------------------------------------------------------
     *  p0 : $30  × (4)  (free,  weight: 50g/item)       p0 : $100 × (5) (free,  weight: 120g/item)
     *  p1 : $10  × (2)  (flat,  weight: 80g/item)       p1 : $120 × (8) (flat,  weight: 150g/item)
     *  p2 : $22  × (1)  (per_item, weight: 30g/item)    p2 : $97  × (1) (per_item, weight: 60g/item)
     *  p3 : $100 × (5)  (by_weight, weight: 20g/item)   p3 : $26  × (4) (by_weight, weight: 200g/item)
     *  p4 : $3   × (10) (free,  weight: 10g/item)       p4 : ——— (none)
     */

    it('test 4 - should not be able to add items in the cart if the qty is excess then stock', async () => {
      try{
        await services.addItemToCartUseCase.execute(testBuyer.id, {
          cartId: cart.id,
          productId: seller_1_products[0].id,
          quantity: 10,
        } as AddItemToCartDto);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    it('test 5 - should be able to add item to cart if qty within stock ', async () => {

      await services.addItemToCartUseCase.execute(testBuyer.id, {
        cartId: cart.id,
        productId: seller_2_products[1].id,
        quantity: 8,
      } as AddItemToCartDto);
      const updatedCart = await services.addItemToCartUseCase.execute(
        testBuyer.id,
        {
          cartId: cart.id,
          productId: seller_1_products[0].id,
          quantity: 3,
        } as AddItemToCartDto,
      );

      // Assertions
      expect(updatedCart.items).toHaveLength(2);

      const item1 = updatedCart.items.find(
        (item) => item.productId === seller_2_products[1].id,
      );
      const item2 = updatedCart.items.find(
        (item) => item.productId === seller_1_products[0].id,
      );

      expect(item1).toBeDefined();
      expect(item1?.quantity).toBe(8);
      expect(item1?.price).toBe(seller_2_products[1].price);

      expect(item2).toBeDefined();
      expect(item2?.quantity).toBe(3);
      expect(item2?.price).toBe(seller_1_products[0].price);
    });

    it('test 6 - should not be able to update if items qty excess the stock ', async () => {

      try{
        const cartItem1 = cart.items.find(
          (c) => c.productId == seller_2_products[1].id,
        );
        await services.updateItemQtyInCartUseCase.execute(testBuyer.id, {
          cartId: cart.id,
          cartItemId: cartItem1?.id,
          productId: seller_2_products[1].id,
          quantity: 100000
        } as UpdateItemQtyInCartDto);
      } catch (e) {
          expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    it('test 7 - should update the items qty in the cart', async () => {
      /*
       *  We have now 2 items in cart:
       * -----------------------------------------------
       *  Shop 1
       *  ----------------------------------------------
       *  p0 : $30  × qty: 3 (free,  weight: 50g/item) 
       *
       *  ----------------------------------------------
       *  Shop 2 
       *  ----------------------------------------------
       *  p1 : $120 × qty: 8  (flat,  weight: 150g/item)
       *
       */

      const cartItem1 = cart.items.find(
        (c) => c.productId == seller_2_products[1].id,
      );
      await services.updateItemQtyInCartUseCase.execute(testBuyer.id, {
        cartId: cart.id,
        cartItemId:cartItem1?.id,
        productId: seller_2_products[1].id,
        quantity: 5
      } as UpdateItemQtyInCartDto);


      const cartItem2 = cart.items.find(
        (c) => c.productId == seller_1_products[0].id,
      );
      const updatedCart = await services.updateItemQtyInCartUseCase.execute(
        testBuyer.id,
        {
          cartId: cart.id,
          cartItemId: cartItem2?.id,
          productId: seller_1_products[0].id,
          quantity: 1,
        } as UpdateItemQtyInCartDto,
      );

      expect(updatedCart.items).toHaveLength(2);

      // Check first cart item (seller 2 product)
      const updatedItem1 = updatedCart.items.find(
        (item) => item.productId === seller_2_products[1].id,
      );
      expect(updatedItem1).toBeDefined();
      expect(updatedItem1?.quantity).toBe(5);
      expect(updatedItem1?.price).toBe(seller_2_products[1].price);

      // Check second cart item (seller 1 product)
      const updatedItem2 = updatedCart.items.find(
        (item) => item.productId === seller_1_products[0].id,
      );
      expect(updatedItem2).toBeDefined();
      expect(updatedItem2?.quantity).toBe(1);
      expect(updatedItem2?.price).toBe(seller_1_products[0].price);

      // Optional: check cart ID and buyer
      expect(updatedCart.id).toBe(cart.id);
      expect(updatedCart.buyerId).toBe(testBuyer.id);
      expect(updatedCart.isCheckout).toBe(false);

      cart = updatedCart;

    });

    it('test 8 - should remove items from the cart', async () => {

      const cartItem1 = cart.items.find(
        (c) => c.productId == seller_2_products[1].id,
      );
      await services.cartItemService.removeIfOwned(
        testBuyer.id,
        cart.id,
        cartItem1!.id,
      );

      const updatedCart = await services.cartService.findOrCreateUncheckoutCart(
        testBuyer.id,
      );

      expect(updatedCart.items).toHaveLength(1);
      // Check second cart item still in cart (seller 1 product)
      const updatedItem2 = updatedCart.items[0];
      expect(updatedItem2).toBeDefined();
      expect(updatedItem2?.quantity).toBe(1);
      expect(updatedItem2?.price).toBe(seller_1_products[0].price);

      // Remove all the item in cart
      await services.cartItemService.removeIfOwned(
        testBuyer.id,
        cart.id,
        updatedItem2.id,
      );

      const updatedCart2 =
        await services.cartService.findOrCreateUncheckoutCart(testBuyer.id);

      expect(updatedCart2.items).toHaveLength(0);
      cart = updatedCart2;

      /* ************************
       *  The cart now is empty
       ****************************/
    });

  })

  describe('Cart Refesh Check', () => {
    /*
     * Products in each shop
     * -------------------------------------------------------------------------------------------------
     *  Seller 1 (shippingProfiles version 1)           Seller 2 (shippingProfiles version 2)
     *  ------------------------------------------------------------------------------------------------
     *  p0 : $30  × (4)  (free,  weight: 50g/item)       p0 : $100 × (5) (free,  weight: 120g/item)
     *  p1 : $10  × (2)  (flat,  weight: 80g/item)       p1 : $120 × (8) (flat,  weight: 150g/item)
     *  p2 : $22  × (1)  (per_item, weight: 30g/item)    p2 : $97  × (1) (per_item, weight: 60g/item)
     *  p3 : $100 × (5)  (by_weight, weight: 20g/item)   p3 : $26  × (4) (by_weight, weight: 200g/item)
     *  p4 : $3   × (10) (free,  weight: 10g/item)       p4 : ——— (none)
     * 
     *  cart is empty !
     */

    it('test 9 - should remove the product from the cart if it is offshelfed', async () => {
     
      cart = await services.cartService.findOrCreateUncheckoutCart(
        testBuyer.id,
      );
      await services.addItemToCartUseCase.execute(testBuyer.id, {
        cartId: cart.id,
        productId: seller_1_products[0].id,
        quantity: 3,
      } as AddItemToCartDto);

      await services.addItemToCartUseCase.execute(testBuyer.id, {
        cartId: cart.id,
        productId: seller_1_products[1].id,
        quantity: 2,
      } as AddItemToCartDto);

      await services.addItemToCartUseCase.execute(testBuyer.id, {
        cartId: cart.id,
        productId: seller_2_products[2].id,
        quantity: 1,
      } as AddItemToCartDto);

      cart = await services.addItemToCartUseCase.execute(testBuyer.id, {
        cartId: cart.id,
        productId: seller_2_products[3].id,
        quantity: 3,
      } as AddItemToCartDto);

      expect(cart.items).toHaveLength(4)

      /*
       *  We have now 4 items in cart:
       * -----------------------------------------------
       *  Shop 1
       *  ----------------------------------------------
       *  p0 : $30  × qty: 3 (free,  weight: 50g/item)
       *  p1 : $10  × qty: 2  (flat,  weight: 80g/item)
       *
       *  ----------------------------------------------
       *  Shop 2
       *  ----------------------------------------------
       *  p2 : $97  × qty: 1 (per_item, weight: 60g/item)
       *  p3 : $26  × qty: 3 (by_weight, weight: 200g/item)
       */

       // Off Sheld the p0 of Shop 1
       await services.productService.update(
         seller_1_products[0].id,
         seller_1_shop.id,
         { onShelf: false } as UpdateProductDto,
       );

       // Refresh the cart
       const updatedCart = await services.checkItemsAvailabilityUseCase.execute(
        testBuyer.id,
        cart.id
       )
       expect(updatedCart.items).toHaveLength(3);

       cart = updatedCart;

    });
    it('test 10 - should remove the product from the cart if it is not approved', async () => {
  
      await services.productService.update(
        seller_1_products[1].id,
        seller_1_shop.id,
        { isApproved: false } as UpdateProductDto,
      );
      const updatedCart = await services.checkItemsAvailabilityUseCase.execute(
        testBuyer.id,
        cart.id,
      );
      expect(updatedCart.items).toHaveLength(2);

      cart = updatedCart;
    });
    it('test 11 - should remove the product from the cart if it is out of stock', async () => {
      await services.productService.update(
        seller_2_products[2].id,
        seller_2_shop.id,
        { stock: 0 } as UpdateProductDto,
      );
      const updatedCart = await services.checkItemsAvailabilityUseCase.execute(
        testBuyer.id,
        cart.id,
      );
      expect(updatedCart.items).toHaveLength(1);

      cart = updatedCart;
    });
    it('test 12 - should update the prodcut price and name after it is updated', async () => {
      const item = cart.items[0];

      expect(item.productName).toBe('p4'); // the name is p4
      expect(item.price).toBe(26);
      expect(item.quantity).toBe(3);

      await services.productService.update(
        seller_2_products[3].id,
        seller_2_shop.id,
        {
          name: 'New Product Name',
          price: 5000,
          stock: 1,
        } as UpdateProductDto,
      );
      const updatedCart = await services.checkItemsAvailabilityUseCase.execute(
        testBuyer.id,
        cart.id,
      );
  
      expect(updatedCart.items).toHaveLength(1);
      const newItem = updatedCart.items[0];
      expect(newItem.productName).toBe('New Product Name');
      expect(newItem.price).toBe(5000);
      expect(newItem.quantity).toBe(1);

      // Remove all the item in cart
      await services.cartItemService.removeIfOwned(
        testBuyer.id,
        cart.id,
        newItem.id,
      );

      const updatedCart2 =
        await services.cartService.findOrCreateUncheckoutCart(testBuyer.id);

      expect(updatedCart2.items).toHaveLength(0);
      cart = updatedCart2;

      /* ************************
       *  The cart now is empty
       ****************************/
    });
  });

  // describe.skip('Total Amount and Shipping Calculation', () => {
  //   /**
  //    *  feeAmount
  //    * -------------------------------------------------
  //    *  Seller 1                 Seller 2 
  //    *  feeAmount = {            feeAmount = {
  //         free: 0,                  free: 0,         
  //         flat: 5,                  flat: 7,
  //         per_item: 12,             per_item: 2,
  //         by_weight: 3,             by_weight: 9,
  //     };


  //    * FreeShippingAmount:
  //    * -------------------------------------------------
  //    *  Seller 1  :  20           Seller 2 : 30000
    

  //    * Products in Cart
  //    * -------------------------------------------------
  //    *  Seller 1                             Seller 2 
  //    *  p1 : $30  x (4)(free)                p1 : $100 x (5)(free) 
  //    *  p2 : $10  x (2)(flat)                p2 : $120 x (8)(flat) 
  //    *  p3 : $22  x (1)(per_item)            p3 : $97 x  (1)(per_item) 
  //    *  p4 : $100 x (5)(by_weight,20g/item)  p4 : $26 x  (4)(by_weight,200g/item) 
  //    *  p5 : $3   x (10)(free)               p5 :    ------
  //    * 
  //    * 
  //    * Seller 1                                  Seller 2 — 
  //    * per-product shipping:                     per-product shipping:
  //    * {p1:0, p2:5, p3:12, p4:3, p5:0} →         {p1:0, p2:7, p3:2, p4:72}
  //    * subtotal 20 →                             final 81
  //    * threshold 20 ⇒ final 0
  //    * 
  //    * Cart total shipping = 81




  //   */
  //   it('test 9 - should get a correct total amount', async () => {});
  //   it('test 10 - should get a correct shipping cost.', async () => {});
  //   it('test 12 - should update the shipping cost after shipping profile updated', async () => {});
  //   it('test 13 - should set the shipping cost zero after hit the free shipping amount', async () => {});
  // });

});
