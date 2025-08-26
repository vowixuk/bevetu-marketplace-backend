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
import { CreateProductDto } from '../dto/create-product.dto';
import { Shop } from '../../shop/entities/shop.entity';
import { createTestShop1 } from '../../../test/helper/shop-helper';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { testEnrollSubscription } from '../../../test/helper/subscription-helper';
import { ViewProductsDto } from '../dto/view-products.dto';
import { CreateSellerShippingDto } from '../../seller-shipping/dto/create-seller-shipping.dto';
import { UpdateSellerShippingDto } from '../../seller-shipping/dto/update-seller-shipping.dto';
import { CreateSellerShippingProfileDto } from '../../seller-shipping/dto/create-seller-shipping-profile.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import { SellerShipping } from '../../seller-shipping/entities/seller-shipping.entity';


describe('ProductService', () => {
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

  let seller_1_products : Product[]
  let seller_2_products : Product[]

  let seller_1_StripeAccountId: string;
  let seller_2_StripeAccountId: string;

  let seller_1_StripeCustomerId: string;
  let seller_2_StripeCustomerId: string;

  let seller_1_Subscription: SellerSubscription;
  let seller_1_currentProduct: IProduct;
  let seller_2_Subscription: SellerSubscription;
  let seller_2_currentProduct: IProduct;

  // Users who is only user
  let testBuyerUser: User;
  let buyerStripeCustomerId: string | null;

  beforeAll(async () => {
    const modelHelper = await testTestingMoudleHelper();
    services = modelHelper.services;

    // Create dummy users

    // ----- Setup testSellerUser_1 ----- //

    testSellerUser_1 = await createTestUser_1(services.userService);
    const seller_1_buyerAccountSetup = await testBuyerSetup(
      testSellerUser_1.id,
      testSellerUser_1.email,
      services.buyerUseCase,
    );
    seller_1_StripeCustomerId =
      seller_1_buyerAccountSetup.buyerStripeCustomerId;

    seller_1_buyer_id = seller_1_buyerAccountSetup.buyer.id;

    const seller_1_sellerAccountSetup = await testSellerSetup(
      testSellerUser_1.id,
      services.sellerUseCase,
      services.sellerStripeAccountMappingService,
      services.sellerService,
    );

    seller_1 = seller_1_sellerAccountSetup.seller;
    seller_1_StripeAccountId =
      seller_1_sellerAccountSetup.sellerStripeAccountId;


    seller_1_shop = await createTestShop1(seller_1.id, services.shopService)

    // ----- Setup testSellerUser_2 ----- //
    testSellerUser_2 = await createTestUser_2(services.userService);
    const seller_2_buyerAccountSetup = await testBuyerSetup(
      testSellerUser_2.id,
      testSellerUser_2.email,
      services.buyerUseCase,
    );
    seller_2_StripeCustomerId =
      seller_2_buyerAccountSetup.buyerStripeCustomerId;

    seller_2_buyer_id = seller_2_buyerAccountSetup.buyer.id;
    const seller_2_sellerAccountSetup = await testSellerSetup(
      testSellerUser_2.id,
      services.sellerUseCase,
      services.sellerStripeAccountMappingService,
      services.sellerService,
    );

    seller_2 = seller_2_sellerAccountSetup.seller;
    seller_2_StripeAccountId =
      seller_2_sellerAccountSetup.sellerStripeAccountId;

      seller_2_shop = await createTestShop1(seller_2.id, services.shopService)

    // ----- Setup buyer ----- //

    testBuyerUser = await createTestUser_3(services.userService);
    const buyer_buyerAccountSetup = await testBuyerSetup(
      testBuyerUser.id,
      testBuyerUser.email,
      services.buyerUseCase,
    );
    buyerStripeCustomerId = buyer_buyerAccountSetup.buyerStripeCustomerId;
   
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
  },50000);

  it('test 1 - should all roles be defined', () => {
    expect(seller_1).toBeDefined();
    expect(seller_2).toBeDefined();
    expect(testBuyerUser).toBeDefined();
  });

  describe('Sellers',() => {
    it('test 2 - should not be able to add product without any active subscription.', async () => {
      const createDto: CreateProductDto = {
        name: 'Dog Toy',
        description: 'A squeaky dog toy',
        price: 100,
        stock: 10,
        onShelf: true, // user tries to set true
        categories: {
          pet: 'dog',
          product: 'toy',
        },
        variants: [],
        discount: [],
      };

      try {
        await services.createProductUseCase.execute(
          seller_1.id,
          seller_1_shop.id,
          createDto,
        );
        fail('shold throw forbiiden error');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
    it('test 3 - should  be able to create product after enroll in Subscription.', async () => {
      const subscription_1 = await testEnrollSubscription(
        testSellerUser_1.id,
        testSellerUser_1.email,
        seller_1.id,
        seller_1_buyer_id,
        'BRONZE_MONTHLY_GBP',
        seller_1_StripeCustomerId,
        services.sellerSubscriptionService,
        services.stripeService,
      );
      seller_1_Subscription = subscription_1.subscription;
      seller_1_currentProduct = subscription_1.currentProduct;

      expect(seller_1_Subscription.id).toBeDefined();
    }, 100000);

    it('test 4 - should  be able to create product after enroll in Subscription.', async () => {
      const createDto: CreateProductDto = {
        name: 'Dog Toy',
        description: 'A squeaky dog toy',
        price: 100,
        stock: 10,
        onShelf: true, // user tries to set true
        categories: {
          pet: 'dog',
          product: 'toy',
        },
        // variants: [],
        // discount: [],
      };

      await services.createProductUseCase.execute(
        seller_1.id,
        seller_1_shop.id,
        createDto,
      );

      const productList = await services.viewProductListUseCase.execute(
        seller_1.id,
        seller_1_shop.id,
        Object.assign(new ViewProductsDto(), {
          page: 1,
          limit: 10,
        }),
      );

      const { products, totalRecords } = productList;

      expect(products).toHaveLength(1);
      expect(products[0].onShelf).toBe(false);
      expect(totalRecords).toBe(1);
    });
    it('test 5 - should not be able to list the product without choosing shipping profile.', async () => {
      // 1 - Get the product
      const productList = await services.viewProductListUseCase.execute(
        seller_1.id,
        seller_1_shop.id,
        Object.assign(new ViewProductsDto(), {
          page: 1,
          limit: 10,
        }),
      );
      const { products } = productList;

      // 2 - try set the onshelf to be false. it should work
      const _p1 = await services.setProductOnShelfUseCase.execute(
        seller_1.id,
        products[0].id,
        seller_1_shop.id,
        false,
      );

      expect(_p1.onShelf).toBe(false);
      // 2 - try set the onshelf to be true. it should throw error
      try {
        const _p2 = await services.setProductOnShelfUseCase.execute(
          seller_1.id,
          products[0].id,
          seller_1_shop.id,
          true,
        );
        fail('should throw BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
    it('test 6 - should be able to create a shipping profile and add to product.', async () => {
      const shippingCreated = await services.sellerShippingService.create(
        seller_1.id,
        Object.assign(new CreateSellerShippingDto(), {
          shopId: seller_1_shop.id,
        }),
      );

      seller_1_shipping = shippingCreated;

      const createDto = Object.assign(new CreateSellerShippingProfileDto(), {
        shopId: seller_1_shop.id,
        sellerShippingId: shippingCreated.id,
        name: 'Standard Shipping',
        feeType: 'flat',
        feeAmount: 5.0,
        currency: 'GBP',
        originCountry: 'US',
        originZip: '10001',
        buyerPickUp: true,
        buyerPickUpLocation: 'Store #1',
        supportedRegions: ['Uk', 'CA'],
        estimatedDeliveryMinDays: 3,
        estimatedDeliveryMaxDays: 7,
      });
      await services.sellerShippingProfileService.create(
        seller_1.id,
        createDto,
      );

      const profiles =
        await services.sellerShippingProfileService.findBySellerShippingId(
          shippingCreated.id,
        );

      expect(profiles).toHaveLength(1);
      expect(profiles).toBeDefined();
      expect(profiles[0].sellerId).toBe(seller_1.id);
      expect(profiles).toBeDefined();
    });
    it('test 7 - should be able to list and update that product after attaching the shipping profile', async () => {
      // 1 - Get the shipping Id
      const shipping = await services.sellerShippingService.findByShopId(
        seller_1_shop.id,
        seller_1.id,
      );

      // 2 - Get the product
      const productList1 = await services.viewProductListUseCase.execute(
        seller_1.id,
        seller_1_shop.id,
        Object.assign(new ViewProductsDto(), {
          page: 1,
          limit: 10,
        }),
      );
      const { products } = productList1;

      // 3 - Update the product
      const updateDto = Object.assign(new UpdateProductDto(), {
        name: 'hahahahahha',
        description: 'asfasdfasdf',
        shippingProfileId: shipping.shippingProfiles![0].id,
        categories: {
          pet: 'fish',
          product: 'accessory',
        },
        stock: 234567,
      });

      await services.updateProductUseCase.execute(
        products[0].id,
        seller_1.id,
        seller_1_shop.id,
        updateDto,
      );

      // 4 - Get the product again
      const productList2 = await services.viewProductListUseCase.execute(
        seller_1.id,
        seller_1_shop.id,
        Object.assign(new ViewProductsDto(), {
          page: 1,
          limit: 10,
        }),
      );

      const p2 = productList2.products;

      expect(p2[0].name).toBe(updateDto.name);
      expect(p2[0].shippingProfileId).toBe(updateDto.shippingProfileId);
      expect(p2[0].stock).toBe(updateDto.stock);
      expect(p2[0].description).toBe(updateDto.description);

      // 5 - Set on Shelf, should work
      const _p2 = await services.setProductOnShelfUseCase.execute(
        seller_1.id,
        products[0].id,
        seller_1_shop.id,
        true,
      );

      const productList3 = await services.viewProductListUseCase.execute(
        seller_1.id,
        seller_1_shop.id,
        Object.assign(new ViewProductsDto(), {
          page: 1,
          limit: 10,
        }),
      );
      const p3 = productList3.products;
      expect(p3[0].onShelf).toBe(true);
      seller_1_products = p3;
    });
    it('test 8 - should not be able to delete shipping profile if it is used in any products', async () => {
      const shippingProfileIdInUse = seller_1_products[0].shippingProfileId;
      try {
        await services.sellerShippingProfileService.removeWithProductAttachCheck(
          shippingProfileIdInUse!,
          seller_1.id,
        );

        fail('should throw ConflictException');
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });
    it('test 9 - should be able to delete product', async () => {
      await services.deleteProductUseCase.execute(
        seller_1_products[0].id,
        seller_1.id,
        seller_1_shop.id,
      );
      const productList = await services.viewProductListUseCase.execute(
        seller_1.id,
        seller_1_shop.id,
        Object.assign(new ViewProductsDto(), {
          page: 1,
          limit: 10,
        }),
      );
      const { products } = productList;

      expect(products).toHaveLength(0);
    });
    it('test 10 - should be able to delete shipping profile if it is not in use', async () => {
      const shippingProfileIdInUse = seller_1_products[0].shippingProfileId;

      await services.sellerShippingProfileService.removeWithProductAttachCheck(
        shippingProfileIdInUse!,
        seller_1.id,
      );
      const shipping = await services.sellerShippingService.findByShopId(
        seller_1_shop.id,
        seller_1.id,
      );

      expect(shipping.shippingProfiles).toHaveLength(0);
    });
    it('test 11 - should not be able to list item if the listing number exist the allow amount in subscription.', async () => {
      // 1 - Create Shipping Profile
      const createDto = Object.assign(new CreateSellerShippingProfileDto(), {
        shopId: seller_1_shop.id,
        sellerShippingId: seller_1_shipping.id,
        name: 'Standard Shipping',
        feeType: 'flat',
        feeAmount: 5.0,
        currency: 'GBP',
        originCountry: 'US',
        originZip: '10001',
        buyerPickUp: true,
        buyerPickUpLocation: 'Store #1',
        supportedRegions: ['Uk', 'CA'],
        estimatedDeliveryMinDays: 3,
        estimatedDeliveryMaxDays: 7,
      });
      await services.sellerShippingProfileService.create(
        seller_1.id,
        createDto,
      );

      seller_1_shipping = await services.sellerShippingService.findByShopId(
        seller_1_shop.id,
        seller_1.id,
      );

     

      // 2 - Create 10 products and set on shelf
      for (let i = 1; i <= 10; i++) {
        const p = await services.createProductUseCase.execute(
          seller_1.id,
          seller_1_shop.id,
          {
            name: `Product ${i}`,
            description: 'A squeaky dog toy',
            price: 100,
            stock: 10,
            onShelf: true, // user tries to set true
            categories: {
              pet: 'dog',
              product: 'toy',
            },
            shippingProfileId: seller_1_shipping!.shippingProfiles![0].id,
            variants: [],
            discount: [],
          },
        );

        await services.setProductOnShelfUseCase.execute(
          seller_1.id,
          p.id,
          seller_1_shop.id,
          true,
        );
      }

      // 3 - Create 1 more product. It should throw error
      let extraProductId;
      try {
        const p = await services.createProductUseCase.execute(
          seller_1.id,
          seller_1_shop.id,
          {
            name: `Product ${11}`,
            description: 'A squeaky dog toy',
            price: 100,
            stock: 10,
            onShelf: true, // user tries to set true
            categories: {
              pet: 'dog',
              product: 'toy',
            },
            shippingProfileId: seller_1_shipping!.shippingProfiles![0].id,
          },
        );
        extraProductId = p.id;
        await services.setProductOnShelfUseCase.execute(
          seller_1.id,
          p.id,
          seller_1_shop.id,
          true,
        );
        fail('shold throw forbiiden error');
      } catch (error) {

        expect(error).toBeInstanceOf(BadRequestException);
      } finally {
        await services.deleteProductUseCase.execute(
          extraProductId,
          seller_1.id,
          seller_1_shop.id,
        );
        const productList = await services.viewProductListUseCase.execute(
          seller_1.id,
          seller_1_shop.id,
          Object.assign(new ViewProductsDto(), {
            page: 1,
            limit: 10,
          }),
        );
        const { products } = productList;

        expect(products).toHaveLength(10);
      }

      const all_seller_1_products =
        await services.viewProductListUseCase.execute(
          seller_1.id,
          seller_1_shop.id,
          {
            limit: 20,
            page: 1,
          },
        );
   
      seller_1_products = all_seller_1_products.products;
    });
    it('test 12 - should be able to list item again if the subscription is upgraded', async () => {
      // Step 1 - Upgrade Subscription
      await services.sellerSubscriptionService.upgradeListingSubscription(
        seller_1.id,
        seller_1_Subscription.id,
        'SILVER_MONTHLY_GBP',
      );

      // Step 2 - update current subscription data
      seller_1_Subscription = await services.sellerSubscriptionService.findOne(
        seller_1.id,
        seller_1_Subscription.id,
      );

      // Step 3 - Create 5 more product and on shelf it
      for (let i = 1; i <= 5; i++) {
        const p = await services.createProductUseCase.execute(
          seller_1.id,
          seller_1_shop.id,
          {
            name: `Product 2-${i}`,
            description: 'A squeaky dog toy',
            price: 100,
            stock: 10,
            onShelf: true, // user tries to set true
            categories: {
              pet: 'dog',
              product: 'toy',
            },
            shippingProfileId: seller_1_shipping!.shippingProfiles![0].id,
            variants: [],
            discount: [],
          },
        );

        await services.setProductOnShelfUseCase.execute(
          seller_1.id,
          p.id,
          seller_1_shop.id,
          true,
        );
      }

      // Check if total product == 15 now
      const productList = await services.viewProductListUseCase.execute(
        seller_1.id,
        seller_1_shop.id,
        Object.assign(new ViewProductsDto(), {
          page: 1,
          limit: 20,
        }),
      );
      const { products } = productList;

      expect(products).toHaveLength(15);
      seller_1_products = products;
    });

    it('test 13 - should deactivate all the listed items if downgrade plan', async () => {
      const productList = await services.productService.findAllOnShelfByShopId(
        seller_1_shop.id,
      );
      expect(productList.totalRecords).toBe(15);

      // ------------------------------
      // Action: Downgrade subscription
      // ------------------------------
      await services.sellerSubscriptionService.downgradeListingSubscription(
        seller_1.id,
        seller_1_Subscription.id,
        'BRONZE_MONTHLY_GBP',
      );

      // ------------------------------
      // Manually triggering webhook update
      // ------------------------------
      const newStripeSubscriptionItemId = 'Dummy_newStripeSubscriptionItemId';
      const eventTriggered =
        await services.sellerSubscriptionService.completeUpdateListingSubscription(
          seller_1.id,
          seller_1_Subscription.id,
          'BRONZE_MONTHLY_GBP',
          newStripeSubscriptionItemId,
        );
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!eventTriggered) {
        await services.resetProductOnShelfUseCase.execute(seller_1.id);
      }

      // ------------------------------
      // Update current subscription data
      // ------------------------------
      seller_1_Subscription = await services.sellerSubscriptionService.findOne(
        seller_1.id,
        seller_1_Subscription.id,
      );

      const productList2 = await services.productService.findAllOnShelfByShopId(
        seller_1_shop.id,
      );

      expect(productList2.totalRecords).toBe(10);
    
    });

    it('test 14 - should not be able to view another sellers product', async () => {
      const subscription_2 = await testEnrollSubscription(
        testSellerUser_2.id,
        testSellerUser_2.email,
        seller_2.id,
        seller_2_buyer_id,
        'SILVER_MONTHLY_GBP',
        seller_2_StripeCustomerId,
        services.sellerSubscriptionService,
        services.stripeService,
      );

      seller_2_Subscription = subscription_2.subscription;
      seller_2_currentProduct = subscription_2.currentProduct;

      expect(seller_2_Subscription.id).toBeDefined();

      seller_2_shipping = await services.sellerShippingService.create(
        seller_2.id,
        Object.assign(new CreateSellerShippingDto(), {
          shopId: seller_2_shop.id,
        }),
      );

      await services.sellerShippingProfileService.create(
        seller_2.id,
        Object.assign(new CreateSellerShippingProfileDto(), {
          shopId: seller_2_shop.id,
          sellerShippingId: seller_2_shipping.id,
          name: 'Standard Shipping',
          feeType: 'flat',
          feeAmount: 5.0,
          currency: 'GBP',
          originCountry: 'US',
          originZip: '10001',
          buyerPickUp: true,
          buyerPickUpLocation: 'Store #1',
          supportedRegions: ['Uk', 'CA'],
          estimatedDeliveryMinDays: 3,
          estimatedDeliveryMaxDays: 7,
        })
      );


      seller_2_shipping = await services.sellerShippingService.findByShopId(
        seller_2_shop.id,
        seller_2.id,
      );

      // create product for seller 2
        // 2 - Create 10 products and set on shelf
        for (let i = 1; i <= 15; i++) {
        const p = await services.createProductUseCase.execute(
          seller_2.id,
          seller_2_shop.id,
          {
            name: `seller 2 - Product ${i}`,
            description: 'A squeaky dog toy',
            price: 100,
            stock: 10,
            onShelf: true, // user tries to set true
            categories: {
              pet: 'dog',
              product: 'toy',
            },
            shippingProfileId: seller_2_shipping!.shippingProfiles![0].id,
            variants: [],
            discount: [],
          },
        );

        await services.setProductOnShelfUseCase.execute(
          seller_2.id,
          p.id,
          seller_2_shop.id,
          true,
        );
      }

      const all_seller_2_products =
      await services.viewProductListUseCase.execute(
        seller_2.id,
        seller_2_shop.id,
        {
          limit: 20,
          page: 1,
        },
      );

    seller_2_products = all_seller_2_products.products;

    expect(seller_2_products).toHaveLength(15)


    try {

      await services.viewProductListUseCase.execute(
        seller_1.id,
        seller_2_shop.id,
        { limit:10,
        page:10}
      )

    } catch(error) {
      expect(error).toBeInstanceOf(ForbiddenException);
    } 

    },100000)

  })

  describe('Buyers',() => {
    it('test 15 - should be be able to view all shop on shelf products', async () => {
      const productList1 = await services.productService.findAllOnShelfByShopId(
        seller_1_shop.id,
      );

      console.log(productList1.totalRecords, '<<< productList1 total');
   


      const productList2 = await services.productService.findAllOnShelfByShopId(
        seller_2_shop.id,
      );

      const products =
        await services.productService.findAllOnShelfFromMultipleShops(1, 30);


      expect(products.totalRecords).toBe(
        productList2.totalRecords + productList1.totalRecords,
      );
    });
   
  })
  
});
