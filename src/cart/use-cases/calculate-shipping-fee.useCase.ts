import { ProductService } from 'src/product/product.services';
import { CartItemService } from '../services/cart-item.service';
import { CartService } from '../services/cart.service';
import { Injectable } from '@nestjs/common';
import { Product } from 'src/product/entities/product.entity';
import { Cart } from '../entities/cart.entity';
import { SellerShippingProfileService } from '../../seller-shipping/services/seller-shipping-profile.service';

import { SellerShippingProfile } from '../../seller-shipping/entities/seller-shipping-profile.entity';
import { SellerShippingService } from '../../seller-shipping/services/seller-shipping.service';
import { SellerShipping } from '../../seller-shipping/entities/seller-shipping.entity';

export type ShippingCalculationReturn = {
  cartTotalShippingFee: number;
  shopShippingFee: Record<
    string,
    {
      shipping: SellerShipping;
      products: {
        product: { id: string; name: string };
        qty: number;
        shippingFee: number;
      }[];
      totalShippingFee: number;
      freeShippingAmount: number | undefined;
    }
  >;
};

@Injectable()
export class CalculateShippingFeeUseCase {
  constructor(
    private productService: ProductService,
    private cartItemService: CartItemService,
    private cartService: CartService,
    private sellerShippingProfileService: SellerShippingProfileService,
    private sellerShippingService: SellerShippingService,
  ) {}

  async execute(cart: Cart): Promise<ShippingCalculationReturn> {
    /*
     * Step 1 – Find all Products in cart
     */
    const products = await this.productService.findByIds(
      cart.items.map((item) => item.productId),
    );

    const productIdToQtyMapping = Object.fromEntries(
      cart.items.map((item) => [item.productId, item.quantity]),
    );

    /*
     * Step 2 – Find Shipping Profile of  product
     */
    const shippingProfilles = await this.sellerShippingProfileService.findByIds(
      products.map((product) => product.shippingProfileId) as string[],
    );

    /**
     * Step 3 – Merge the shipping profile into the product item
     */

    /*
     * Step 4a – profile Id to profit object mapping
     * {'profileId': <Profile Object>}
     * So that can get the object by its id directly
     */
    const IdProfitMapping = Object.fromEntries(
      shippingProfilles.map((profille) => [profille.id, profille]),
    );
    const productWithShippingProfileArray = products.map((product) => {
      return {
        ...product,
        shippingProfile: IdProfitMapping[product.shippingProfileId as string],
      };
    });

    /**
     *  Step 4 – Find the shipping policy of the shop
     */
    const shippings = await this.sellerShippingService.findByShopIds(
      cart.items.map((item) => item.shopId),
    );
    const shopIdShippingMapping = Object.fromEntries(
      shippings.map((shipping) => [shipping.shopId, shipping]),
    );

    /**
     * Step 5 – Re-Group the products by shop id :
     * {
     *   'shop-Id-1':{
     *      shipping: <SellerShipping>
     *      products: [
     *          {
     *              product:  <Product & { shippingProfile: <SellerShippingProfile>} >,
     *              qty: number,
     *              shippingFee : number,
     *
     *          },
     *          {
     *              product:  <Product & { shippingProfile: <SellerShippingProfile>} >,
     *              qty: number,
     *              shippingFee : number
     *          }
     *      ],
     *      totalShippingFee: number
     *   },
     *  'shop-Id-2':{
     *      shipping: <SellerShipping>
     *      products: [
     *        {
     *          product:  <Product> & { shippingProfile: <SellerShippingProfile>
     *          qty: number,
     *          shippingFee : number
     *        }
     *      ],
     *      totalShippingFee: number
     *   };
     * }
     */
    const shopShippingFee = productWithShippingProfileArray.reduce(
      (acc, product) => {
        const shopId = product.shopId;

        const qty = productIdToQtyMapping[product.id];
        const shippingFee = this.calculateShippingFee({
          profile: product.shippingProfile,
          qty,
          dimensions: product.dimensions!,
        });

        const shipping = shopIdShippingMapping[shopId];

        // if this shop not yet exists in accumulator, create it
        if (!acc[shopId]) {
          acc[shopId] = {
            shipping,
            products: [],
            totalShippingFee: 0,
            freeShippingAmount: shipping.freeShippingOption
              ? shipping.freeShippingOption.freeShippingThresholdAmount
              : undefined,
          };
        }

        acc[shopId].products.push({
          product: { id: product.id, name: product.name },
          qty,
          shippingFee,
        });
        acc[shopId].totalShippingFee += shippingFee;

        // Apply free shipping threshold (if total exceeds threshold)
        const threshold = acc[shopId].freeShippingAmount;
        if (threshold && acc[shopId].totalShippingFee >= threshold) {
          acc[shopId].totalShippingFee = 0;
        }

        return acc;
      },
      {} as Record<
        string,
        {
          shipping: SellerShipping;
          products: {
            product: { id: string; name: string };
            qty: number;
            shippingFee: number;
          }[];
          totalShippingFee: number;
          freeShippingAmount: number | undefined;
        }
      >,
    );

    /*
     * Step 7 – Calculate Total Shipping Fee for the Cart
     */
    const cartTotalShippingFee = Object.values(shopShippingFee).reduce(
      (sum, shopData) => sum + shopData.totalShippingFee,
      0,
    );

    return { cartTotalShippingFee, shopShippingFee };
  }

  calculateShippingFee({
    profile,
    qty,
    dimensions,
  }: {
    profile: SellerShippingProfile;
    qty: number;
    dimensions: Product['dimensions'];
  }): number {
    if (!profile) return 0;
    switch (profile.feeType) {
      case 'flat':
        return qty > 0 ? profile.feeAmount : 0;

      case 'per_item':
        return profile.feeAmount * qty;

      case 'by_weight':
        return dimensions!.weight! * qty * (profile.feeAmount ?? 0);

      case 'free':
        return 0;

      default:
        return 0;
    }
  }
}
