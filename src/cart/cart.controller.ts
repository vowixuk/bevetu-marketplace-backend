import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CartService } from './services/cart.service';
import { ApiTags } from '@nestjs/swagger';
import type { IRequest } from '../auth/middlewares/auth.middleware';

import { UpdateItemQtyInCartUseCase } from './use-cases/update-item-qty-in-cart.useCase';
import { CheckItemsAvailabilityUseCase } from './use-cases/check-items-availability.useCase';
import { AddItemToCartUseCase } from './use-cases/add-item-to-cart.useCase';
import { CalculateShippingFeeUseCase } from './use-cases/calculate-shipping-fee.useCase';
import { CartItemService } from './services/cart-item.service';

import {
  UpdateItemQtyInCartDto,
  RemoveItemFromCartDto,
  AddItemToCartDto,
  CheckItemsAvailabilityUseCaseDto,
} from './dto';

import {
  AddItemToCartReturnType,
  BuyerGetShippingCostReturnType,
  BuyerViewCurrentCartReturnType,
  RemoveItemFromCartReturnType,
  UpdateCartItemQtyReturnType,
} from './cart.type';
import {
  ApiAddItemToCart,
  ApiBuyerGetShippingCost,
  ApiBuyerViewCurrentCart,
  ApiRefreshCart,
  ApiRemoveItemFromCart,
  ApiUpdateCartItemQty,
} from './cart.swagger';
import { BuyerGetShippingCostDto } from './dto/buyer-get-shipping-cost-use-case.dto';

@ApiTags('Cart')
@Controller({ path: 'cart', version: '1' })
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly cartItemService: CartItemService,
    private readonly addItemToCartUseCase: AddItemToCartUseCase,
    private readonly updateItemQtyInCartUseCase: UpdateItemQtyInCartUseCase,
    private readonly checkItemsAvailabilityUseCase: CheckItemsAvailabilityUseCase,
    private readonly calculateShippingFeeUseCase: CalculateShippingFeeUseCase,
  ) {}

  @Get('current')
  @ApiBuyerViewCurrentCart()
  async buyerViewCurrentCart(
    @Req() req: IRequest,
  ): Promise<BuyerViewCurrentCartReturnType> {
    const cart = await this.cartService.findOrCreateUncheckoutCart(
      req.middleware.buyer.id,
    );
    cart.buyerId = '';
    return cart;
  }

  @Post('add-item')
  @ApiAddItemToCart()
  async addItemToCart(
    @Req() req: IRequest,
    @Body() dto: AddItemToCartDto,
  ): Promise<AddItemToCartReturnType> {
    const cart = await this.addItemToCartUseCase.execute(
      req.middleware.buyer.id,
      dto,
    );
    cart.buyerId = '';
    return cart;
  }

  @Patch('update-quantity')
  @ApiUpdateCartItemQty()
  async updateCartItemQty(
    @Req() req: IRequest,
    @Body() dto: UpdateItemQtyInCartDto,
  ): Promise<UpdateCartItemQtyReturnType> {
    const cart = await this.updateItemQtyInCartUseCase.execute(
      req.middleware.buyer.id,
      dto,
    );
    cart.buyerId = '';
    return cart;
  }

  @Delete(':cartId/:cartItemId')
  @ApiRemoveItemFromCart()
  async removeItemFromCart(
    @Req() req: IRequest,
    @Param() dto: RemoveItemFromCartDto,
  ): Promise<RemoveItemFromCartReturnType> {
    await this.cartItemService.removeIfOwned(
      req.middleware.buyer.id,
      dto.cartId,
      dto.cartItemId,
    );
    const cart = await this.cartService.findOrCreateUncheckoutCart(
      req.middleware.buyer.id,
    );
    cart.buyerId = '';
    return cart;
  }

  @Post('refersh')
  @ApiRefreshCart()
  async refreshCart(
    @Req() req: IRequest,
    @Body() dto: CheckItemsAvailabilityUseCaseDto,
  ) {
    const cart = await this.checkItemsAvailabilityUseCase.execute(
      req.middleware.buyer.id,
      dto.cartId,
    );
    cart.buyerId = '';
    return cart;
  }

  @Get('calculation-shipping-cost/:cartId')
  @ApiBuyerGetShippingCost()
  async buyerGetShippingCost(
    @Req() req: IRequest,
    @Param() dto: BuyerGetShippingCostDto,
  ): Promise<BuyerGetShippingCostReturnType> {
    const shippingCost = await this.calculateShippingFeeUseCase.execute(
      null,
      req.middleware.buyer.id,
      dto.cartId,
    );

    const shopShippingFeeArray: BuyerGetShippingCostReturnType['shopShippingFee'] =
      Object.entries(shippingCost.shopShippingFee).map(([shopId, value]) => ({
        shopId,
        products: value.products,
        totalShippingFee: value.totalShippingFee,
        freeShippingAmount: value.freeShippingAmount,
      }));

    return {
      cartTotalShippingFee: shippingCost.cartTotalShippingFee,
      shopShippingFee: shopShippingFeeArray,
    };
  }
}
