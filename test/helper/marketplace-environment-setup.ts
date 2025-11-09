import {
  createTestUser_1,
  createTestUser_2,
  createTestUser_5,
} from '../../test/helper/user-helper';

import { createTestShop1, createTestShop2 } from './shop-helper';
import { testBuyerSetup } from '../../test/helper/buyer-helper';
import { testSellerSetup } from '../../test/helper/seller-helper';

import { ServicesType } from '../../test/helper/testing-module/testing-module-helper';
import { testEnrollSubscription } from './subscription-helper';

import {
  AddItemToCartUseCase,
  BuyerUseCase,
  CreateProductUseCase,
  SellerShippingProfileService,
  UserService,
} from './testing-module';
import {
  testCreateShippingProfile,
  testSetFreeShippingAmount,
} from './seller-shipping-profile-helper';
import { createTestProductsForSeller } from './product-helper';
import { SellerShippingProfile } from '../../src/seller-shipping/entities/seller-shipping-profile.entity';
import { Cart } from '../../src/cart/entities/cart.entity';
import { AddItemToCartDto } from '../../src/cart/dto/add-item-to-cart.dto';
import { Product } from '../../src/product/entities/product.entity';
import { Buyer } from '../../src/buyer/entities/buyer.entity';

/**
 * Sets up  test seller1
 */
export async function setupTestSeller(
  createTestUser: typeof createTestUser_1,
  createTestShop: typeof createTestShop1,
  userService,
  buyerUseCase,
  sellerUseCase,
  sellerStripeAccountMappingService,
  sellerService,
  setupShopUseCase,
  stripeService,
  sellerSubscriptionService,
  sellerShippingProfileService,
  shippingFeeAmountVersion,
  sellerShippingService,
  freeShippingThresholdAmount,
  createProductUseCase,
  productListVersion,
) {
  /**
   * 🧩 Test Seller 1 Setup
   */
  const user = await createTestUser(userService);
  const buyerAccount = await testBuyerSetup(user.id, user.email, buyerUseCase);

  const sellerAccount = await testSellerSetup(
    user.id,
    sellerUseCase,
    sellerStripeAccountMappingService,
    sellerService,
  );

  const shopData = await createTestShop(
    sellerAccount.seller.id,
    setupShopUseCase,
  );

  await testSetFreeShippingAmount(
    sellerShippingService,
    shopData.shipping.id,
    sellerAccount.seller.id,
    shopData.shop.id,
    freeShippingThresholdAmount,
  );
  const subscription = await testEnrollSubscription(
    user.id,
    user.email,
    sellerAccount.seller.id,
    buyerAccount.buyer.id,
    'DIAMOND_MONTHLY_GBP',
    buyerAccount.buyerStripeCustomerId,
    sellerSubscriptionService,
    stripeService,
  );

  const shippingProfiles = await testCreateShippingProfile({
    sellerId: sellerAccount.seller.id,
    shopId: shopData.shop.id,
    sellerShippingId: shopData.shipping.id,
    sellerShippingProfileService:
      sellerShippingProfileService as SellerShippingProfileService,
    feeAmountVersion: shippingFeeAmountVersion as number,
  });

  const products = await createTestProductsForSeller({
    sellerId: sellerAccount.seller.id,
    shopId: shopData.shop.id,
    createProductUseCase: createProductUseCase as CreateProductUseCase,
    products: getProductArray(productListVersion, shippingProfiles),
  });
  /**
   * ✅ Return both sellers' setup info
   */
  return {
    user: user,
    buyer: buyerAccount.buyer,
    buyerStripeCustomerId: buyerAccount.buyerStripeCustomerId,
    seller: sellerAccount.seller,
    sellerStripeAccountId: sellerAccount.sellerStripeAccountId,
    shop: shopData.shop,
    shipping: shopData.shipping,
    subscription,
    shippingProfiles,
    products,
  };
}

/**
 * Setup test buyer
 */
export async function setupTestBuyer(
  userService: UserService,
  buyerUseCase: BuyerUseCase,
  createTestUser: typeof createTestUser_1,
) {
  const user = await createTestUser(userService);

  const buyerAccount = await testBuyerSetup(user.id, user.email, buyerUseCase);

  return {
    user,
    buyer: buyerAccount.buyer,
    buyerStripeCustomerId: buyerAccount.buyerStripeCustomerId,
  };
}

export async function setupMarketplaceTestEnvironment(services: ServicesType) {
  const seller1 = await setupTestSeller(
    createTestUser_1,
    createTestShop1,
    services.userService,
    services.buyerUseCase,
    services.sellerUseCase,
    services.sellerStripeAccountMappingService,
    services.sellerService,
    services.setupShopUseCase,
    services.stripeService,
    services.sellerSubscriptionService,
    services.sellerShippingProfileService,
    1, // use version 1 profile
    services.sellerShippingService,
    undefined, // Freeshipping amount
    services.createProductUseCase,
    1, // use version 1 product list
  );
  const seller2 = await setupTestSeller(
    createTestUser_2,
    createTestShop2,
    services.userService,
    services.buyerUseCase,
    services.sellerUseCase,
    services.sellerStripeAccountMappingService,
    services.sellerService,
    services.setupShopUseCase,
    services.stripeService,
    services.sellerSubscriptionService,
    services.sellerShippingProfileService,
    2,
    services.sellerShippingService,
    undefined, // Freeshipping amount
    services.createProductUseCase,
    2,
  );
  // const seller3 = await setupTestSeller(
  //   createTestUser_3,
  //   createTestShop3,
  //   services.userService,
  //   services.buyerUseCase,
  //   services.sellerUseCase,
  //   services.sellerStripeAccountMappingService,
  //   services.sellerService,
  //   services.setupShopUseCase,
  //   services.stripeService,
  //   services.sellerSubscriptionService,
  //   services.sellerShippingProfileService,
  //   3,
  //   services.sellerShippingService,
  //   15,
  // );

  // const seller4 = await setupTestSeller(
  //   createTestUser_4,
  //   createTestShop4,
  //   services.userService,
  //   services.buyerUseCase,
  //   services.sellerUseCase,
  //   services.sellerStripeAccountMappingService,
  //   services.sellerService,
  //   services.setupShopUseCase,
  //   services.stripeService,
  //   services.sellerSubscriptionService,
  //   services.sellerShippingProfileService,
  //   4,
  //   services.sellerShippingService,
  //   12,
  // );
  const buyer = await setupTestBuyer(
    services.userService,
    services.buyerUseCase,
    createTestUser_5,
  );
  return { seller1, seller2, buyer };
}

export async function addProductToCart(
  cart: Cart,
  testBuyer: Buyer,
  seller_1_products: Omit<Product, 'sellerId'>[],
  seller_2_products: Omit<Product, 'sellerId'>[],
  addItemToCartUseCase: AddItemToCartUseCase,
) {
  const itemsToAdd = [
    ...seller_1_products.map((p, i) => ({
      productId: p.id,
      quantity: [4, 2, 1, 5, 10][i],
    })),
    ...seller_2_products.map((p, i) => ({
      productId: p.id,
      quantity: [5, 8, 1, 4][i],
    })),
  ].filter(Boolean);

  for (const item of itemsToAdd) {
    cart = await addItemToCartUseCase.execute(testBuyer.id, {
      cartId: cart.id,
      ...item,
    } as AddItemToCartDto);
  }

  return cart;
}

function getProductArray(
  version = 1,
  shippingProfiles: {
    free: SellerShippingProfile;
    flat: SellerShippingProfile;
    per_item: SellerShippingProfile;
    by_weight: SellerShippingProfile;
  },
): {
  name: string;
  price: number;
  stock: number;
  shippingProfileId: string;
  feeType: 'flat' | 'per_item' | 'by_weight' | 'free';
  dimensions: {
    weight: number;
    width: number;
    height: number;
    depth: number;
  };
}[] {
  if (version == 1) {
    return [
      {
        name: 'p1',
        price: 30,
        stock: 4,
        shippingProfileId: shippingProfiles.free.id,
        feeType: 'free' as 'flat' | 'per_item' | 'by_weight' | 'free',
        dimensions: { weight: 50, width: 10, height: 8, depth: 6 },
      },
      {
        name: 'p2',
        price: 10,
        stock: 2,
        shippingProfileId: shippingProfiles.flat.id,
        feeType: 'flat',
        dimensions: { weight: 80, width: 12, height: 9, depth: 7 },
      },
      {
        name: 'p3',
        price: 22,
        stock: 1,
        shippingProfileId: shippingProfiles.per_item.id,
        feeType: 'per_item' as 'flat' | 'per_item' | 'by_weight' | 'free',
        dimensions: { weight: 30, width: 9, height: 7, depth: 5 },
      },
      {
        name: 'p4',
        price: 100,
        stock: 5,
        shippingProfileId: shippingProfiles.by_weight.id,
        feeType: 'by_weight' as 'flat' | 'per_item' | 'by_weight' | 'free',
        dimensions: { weight: 0.02, width: 5, height: 5, depth: 5 },
      },
      {
        name: 'p5',
        price: 3,
        stock: 10,
        shippingProfileId: shippingProfiles.free.id,
        feeType: 'free' as 'flat' | 'per_item' | 'by_weight' | 'free',
        dimensions: { weight: 10, width: 6, height: 4, depth: 3 },
      },
    ];
  } else {
    return [
      {
        name: 'p1',
        price: 100,
        stock: 5,
        feeType: 'free' as 'flat' | 'per_item' | 'by_weight' | 'free',
        shippingProfileId: shippingProfiles.free.id,
        dimensions: { weight: 120, width: 14, height: 12, depth: 10 },
      },
      {
        name: 'p2',
        price: 120,
        stock: 8,
        feeType: 'flat' as 'flat' | 'per_item' | 'by_weight' | 'free',
        shippingProfileId: shippingProfiles.flat.id,
        dimensions: { weight: 150, width: 16, height: 13, depth: 11 },
      },
      {
        name: 'p3',
        price: 97,
        stock: 1,
        feeType: 'per_item' as 'flat' | 'per_item' | 'by_weight' | 'free',
        shippingProfileId: shippingProfiles.per_item.id,
        dimensions: { weight: 60, width: 10, height: 8, depth: 7 },
      },
      {
        name: 'p4',
        price: 26,
        stock: 4,
        feeType: 'by_weight' as 'flat' | 'per_item' | 'by_weight' | 'free',
        shippingProfileId: shippingProfiles.by_weight.id,
        dimensions: { weight: 0.2, width: 20, height: 15, depth: 12 },
      },
    ];
  }
}
// example :

// describe('CartService', () => {
//   let services: ServicesType;

//   // Users who are sellers
//   let testSellerUser_1: User;
//   let testSellerUser_2: User;

//   let seller_1: Omit<Seller, 'userId'>;
//   let seller_2: Omit<Seller, 'userId'>;

//   let seller_1_buyer_id: string;
//   let seller_2_buyer_id: string;

//   let seller_1_shop: Shop;
//   let seller_2_shop: Shop;

//   let seller_1_shipping: SellerShipping;
//   let seller_2_shipping: SellerShipping;

//   let seller_1_products: Omit<Product, 'sellerId'>[];
//   let seller_2_products: Omit<Product, 'sellerId'>[];

//   let seller_1_StripeAccountId: string;
//   let seller_2_StripeAccountId: string;

//   let seller_1_StripeCustomerId: string;
//   let seller_2_StripeCustomerId: string;

//   let seller_1_Subscription: SellerSubscription;
//   let seller_2_Subscription: SellerSubscription;

//   // Users who is only buyer
//   let testBuyerUser: User;
//   let testBuyer : Buyer;
//   let buyerStripeCustomerId: string | null;

//   beforeAll(async () => {
//     const modelHelper = await testTestingMoudleHelper();
//     services = modelHelper.services;

//     // Create dummy users
//     // ----- Setup market place evnironment ----- //

//     const { seller1, seller2, buyer } =
//       await setupMarketplaceTestEnvironment(services);

//     testSellerUser_1 = seller1.user
//     seller_1_StripeCustomerId = seller1.buyerStripeCustomerId;
//     seller_1_buyer_id = seller1.buyer.id
//     seller_1 = seller1.seller;
//     seller_1_StripeAccountId = seller1.sellerStripeAccountId;
//     seller_1_shop = seller1.shop;
//     seller_1_shipping = seller1.shipping

//     testSellerUser_2 = seller2.user;
//     seller_2_StripeCustomerId = seller2.buyerStripeCustomerId;
//     seller_2_buyer_id = seller2.buyer.id;
//     seller_2 = seller2.seller;
//     seller_2_StripeAccountId = seller2.sellerStripeAccountId;
//     seller_2_shop = seller2.shop;
//     seller_2_shipping = seller2.shipping;

//     // ----- Setup buyer ----- //
//     testBuyerUser = buyer.user
//     testBuyer = buyer.buyer
//     buyerStripeCustomerId = buyer.buyerStripeCustomerId;
//   }, 50000);

//   afterAll(async () => {
//     // -- Remove user account in our database -- //
//     if (testSellerUser_1 && testSellerUser_1.id) {
//       await removeTestingUser(services.userService, testSellerUser_1.id);
//     }
//     if (testSellerUser_2 && testSellerUser_2.id) {
//       await removeTestingUser(services.userService, testSellerUser_2.id);
//     }
//     if (testBuyerUser && testBuyerUser.id) {
//       await removeTestingUser(services.userService, testBuyerUser.id);
//     }
//     // -- Remove sell stripe account in Stripe -- //
//     if (seller_1_StripeAccountId) {
//       await services.stripeService.removeAccount(seller_1_StripeAccountId);
//       console.log(
//         `Seller account ${seller_1_StripeAccountId} removed from stripe`,
//       );
//     }
//     if (seller_2_StripeAccountId) {
//       await services.stripeService.removeAccount(seller_2_StripeAccountId);
//       console.log(
//         `Seller account ${seller_2_StripeAccountId} removed from stripe`,
//       );
//     }

//     // -- Remove stripe customer account in Stripe -- //
//     if (seller_1_StripeCustomerId) {
//       await services.stripeService.removeStripeCustomer(
//         seller_1_StripeCustomerId,
//       );
//       console.log(
//         `Buyer customer account ${seller_1_StripeCustomerId} removed from stripe`,
//       );
//     }
//     if (seller_2_StripeCustomerId) {
//       await services.stripeService.removeStripeCustomer(
//         seller_2_StripeCustomerId,
//       );
//       console.log(
//         `Buyer customer account ${seller_2_StripeCustomerId} removed from stripe`,
//       );
//     }
//     if (buyerStripeCustomerId) {
//       await services.stripeService.removeStripeCustomer(buyerStripeCustomerId);
//       console.log(
//         `Buyer customer account ${buyerStripeCustomerId} removed from stripe`,
//       );
//     }
//   }, 50000);

//   it('test 1 - should all roles be defined', () => {
//     expect(seller_1).toBeDefined();
//     expect(seller_2).toBeDefined();
//     expect(testBuyerUser).toBeDefined();
//     console.log(testBuyerUser, '<< testBuyerUser');
//   });
