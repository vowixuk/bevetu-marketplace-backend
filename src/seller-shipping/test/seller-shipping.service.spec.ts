/* eslint-disable prettier/prettier */
 
/**
 *  To run this test solely:
 *
 *  npm run test -- seller-shipping/test/seller-shipping.service.spec.ts
 */

import { User } from '../../user/entities/user.entity';
import {
  createTestUser_1,
  removeTestingUser,
} from '../../../test/helper/user-helper';
import { testSellerSetup } from '../../../test/helper/seller-helper';
import { ServicesType, testTestingMoudleHelper } from '../../../test/helper/testing-module/testing-module-helper';
import { SellerShipping } from '../entities/seller-shipping.entity';
import { Shop } from '../../shop/entities/shop.entity';
import { createTestShop } from '../../../test/helper/shop-helper';
import { Seller } from '../../seller/entities/seller.entity';
import { CreateSellerShippingDto } from '../dto/create-seller-shipping.dto';
import { UpdateSellerShippingDto } from '../dto/update-seller-shipping.dto';
import { CreateSellerShippingProfileDto } from '../dto/create-seller-shipping-profile.dto';
import { UpdateSellerShippingProfileDto } from '../dto/update-seller-shipping-profile.dto';


describe('ProductService', () => {


  let serviecs:ServicesType;

  let testUser: User;
  let sellerStripeAccountId: string;
  let shipping: SellerShipping;
  let shop: Shop;
  let seller: Omit<Seller, 'userId'>;
  let profileId_1: string;
  let profileId_2: string;
  // let buyerStripeCustomerId: string | null;

  // let sellerSubscription: SellerSubscription;
  // let currentListingProduct: IProduct;

  beforeAll(async () => {
    const modelHelper = await testTestingMoudleHelper();
    serviecs = modelHelper.services;

    // Create a dummy user
    testUser = await createTestUser_1(serviecs.userService);


    // Create a dummy seller
    const _seller = await testSellerSetup(
      testUser.id,
      serviecs.sellerUseCase,
      serviecs.sellerStripeAccountMappingService,
      serviecs.sellerService,
    );
    seller = _seller.seller
    sellerStripeAccountId = _seller.sellerStripeAccountId;

    // Create a dummy Shop
    shop = await createTestShop(_seller.seller.id, serviecs.shopService);
  });

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

    // if (buyerStripeCustomerId) {
    //   await serviecs.stripeService.removeStripeCustomer(buyerStripeCustomerId);
    //   console.log(
    //     `Buyer customer account ${buyerStripeCustomerId} removed from stripe`,
    //   );
    // }
  });

  it('test 1 - should shop be defined', () => {
    expect(shop).toBeDefined();
  });

  it('test 2 - should be able to create shipping object ', async () => { 
    const shippingCreated = await serviecs.sellerShippingService.create(
      seller.id,
      Object.assign(new CreateSellerShippingDto(), {
        shopId: shop.id
      }),
    );

    shipping = await serviecs.sellerShippingService.findOne(
      shippingCreated.id,
      seller.id,
    );

    expect(shipping.id).toBeDefined();
    expect(shipping.freeShippingOption).toBeNull();
  });

  it('test 3 - should be able to set freeShippingOption to 100 GBP and then set it back to null', async () => {
    await serviecs.sellerShippingService.update(
      shipping.id,
      seller.id,
      Object.assign(new UpdateSellerShippingDto(), {
        freeShippingOption: {
          freeShippingThresholdAmount: 100,
          currency: 'GBP',
        },
      }),
    );

    shipping = await serviecs.sellerShippingService.findOne(
      shipping.id,
      seller.id,
    );

    expect(shipping.freeShippingOption?.currency).toBe('GBP')
    expect(shipping.freeShippingOption?.freeShippingThresholdAmount).toBe(100);

    await serviecs.sellerShippingService.update(
      shipping.id,
      seller.id,
      Object.assign(new UpdateSellerShippingDto(), {
        freeShippingOption: undefined,
      }),
    );

    shipping = await serviecs.sellerShippingService.findOne(
      shipping.id,
      seller.id,
    );

    expect(shipping.freeShippingOption).toBeNull()

    
  });
  it('test 4 - should be able to ceate a shipping profile', async () => {
    const createDto = Object.assign(new CreateSellerShippingProfileDto(), {
      shopId: shop.id,
      sellerShippingId: shipping.id,
      name: 'Standard Shipping',
      feeType: 'flat',
      feeAmount: 5.0,
      currency: 'USD',
      originCountry: 'US',
      originZip: '10001',
      buyerPickUp: true,
      buyerPickUpLocation: 'Store #1',
      supportedRegions: ['US', 'CA'],
      estimatedDeliveryMinDays: 3,
      estimatedDeliveryMaxDays: 7,
    });
    await serviecs.sellerShippingProfileService.create(
      seller.id,
      createDto
    );

    const profiles =
      await serviecs.sellerShippingProfileService.findBySellerShippingId(
        shipping.id,
      );


    expect(profiles).toHaveLength(1);
    expect(profiles).toBeDefined();
    expect(profiles[0].sellerId).toBe(seller.id);
    expect(profiles).toBeDefined();
    expect(profiles[0].sellerId).toBe(seller.id);
    expect(profiles[0].shopId).toBe(createDto.shopId);
    expect(profiles[0].name).toBe(createDto.name);
    expect(profiles[0].feeAmount).toBe(createDto.feeAmount);
    expect(profiles[0].currency).toBe(createDto.currency);
    expect(profiles[0].buyerPickUp).toBe(createDto.buyerPickUp);
    expect(profiles[0].buyerPickUpLocation).toBe(createDto.buyerPickUpLocation);
    expect(profiles[0].supportedRegions).toEqual(createDto.supportedRegions);
    expect(profiles[0].estimatedDeliveryMinDays).toBe(
      createDto.estimatedDeliveryMinDays,
    );
    expect(profiles[0].estimatedDeliveryMaxDays).toBe(
      createDto.estimatedDeliveryMaxDays,
    );


  });
  it('test 5 -  should update an existing shipping profile', async () => {
    // 1. First create a profile
    const createDto = Object.assign(new CreateSellerShippingProfileDto(), {
      shopId: shop.id,
      sellerShippingId: shipping.id,
      name: 'Standard Shipping',
      feeType: 'free',
      feeAmount: 10000,
      currency: 'USD',
      originCountry: 'US',
      originZip: '11',
      buyerPickUp: false,
      buyerPickUpLocation: 'Store #1',
      supportedRegions: ['US', 'CA'],
      estimatedDeliveryMinDays: 3,
      estimatedDeliveryMaxDays: 7,
    });

    const createdProfile = await serviecs.sellerShippingProfileService.create(
      seller.id,
      createDto,
    );

    const _profiles =
      await serviecs.sellerShippingProfileService.findBySellerShippingId(
        shipping.id,
      );

    expect(_profiles[1].feeAmount).toBe(0);

    // 2. Prepare update DTO (only change a few fields)
    const updateDto = Object.assign(new UpdateSellerShippingProfileDto(),{
      name: 'Express Shipping',
      feeAmount: 10.0,
      buyerPickUp: false,
      supportedRegions: ['US', 'CA', 'MX'],
    });

    // 3. Call update
    await serviecs.sellerShippingProfileService.update(
      createdProfile.id,
      seller.id,
      updateDto,
    );

    const profiles =
      await serviecs.sellerShippingProfileService.findBySellerShippingId(
        shipping.id,
      );

    expect(profiles).toHaveLength(2);

  

    const updatedProfile = profiles.sort(
      (a, b) => b.createdAt!.getTime() - a.createdAt!.getTime(),
    )[0];

    // 4. Assertions
    expect(updatedProfile).toBeDefined();
    expect(updatedProfile.id).toBe(createdProfile.id);
    expect(updatedProfile.sellerId).toBe(seller.id);
    expect(updatedProfile.name).toBe(updateDto.name);
    expect(updatedProfile.feeAmount).toBe(updateDto.feeAmount);
    expect(updatedProfile.buyerPickUp).toBe(updateDto.buyerPickUp);
    expect(updatedProfile.supportedRegions).toEqual(updateDto.supportedRegions);

    // unchanged fields should remain the same
    expect(updatedProfile.currency).toBe(createDto.currency);
    expect(updatedProfile.originCountry).toBe(createDto.originCountry);
    expect(updatedProfile.originZip).toBe(createDto.originZip);

    profileId_1 = profiles[0].id;

    profileId_2 = profiles[1].id;
  });
  it('test 6 - should remove the profile ', async () => {

    await serviecs.sellerShippingProfileService.remove(profileId_1,seller.id);
    const profiles =
      await serviecs.sellerShippingProfileService.findBySellerShippingId(
        shipping.id,
      );
    expect(profiles).toHaveLength(1);

    await serviecs.sellerShippingProfileService.remove(profileId_2, seller.id);
    const profiles_2 =
      await serviecs.sellerShippingProfileService.findBySellerShippingId(
        shipping.id,
      );
    expect(profiles_2).toHaveLength(0);
  });
 
});
