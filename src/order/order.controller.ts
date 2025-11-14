import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderUseCase } from './use-cases/create-order.useCase';
import { type IRequest } from '../auth/middlewares/auth.middleware';
import { CreateOrderUseCaseDto } from './dto/create-order-use-case.dto';
import { OrderService } from './services/order.service';
import { BuyerViewAllType, BuyerViewOneType } from './order.type';
import { BuyerViewAllDto } from './dto/buyer-view-all.dto';
import { BuyerViewOneDto } from './dto/buyer-view-one.dto';
import {
  ApiBuyerCheckout,
  ApiBuyerViewAll,
  ApiBuyerViewOne,
} from './order.swagger';

@ApiTags('Order')
@Controller({ path: 'order', version: '1' })
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly orderService: OrderService,
  ) {}
  @Post('/checkout')
  @ApiBuyerCheckout()
  async checkout(
    @Req() req: IRequest,
    @Body() dto: CreateOrderUseCaseDto,
  ): Promise<string> {
    dto.createOrderAddressDto.buyerId = req.middleware.buyer.id;
    return await this.createOrderUseCase.execute(
      req.middleware.buyer.id,
      dto.cartId,
      dto.createOrderAddressDto,
      dto.promotionCode,
    );
  }

  @Get()
  @ApiBuyerViewAll()
  async buyerViewAll(
    @Req() req: IRequest,
    @Body() dto: BuyerViewAllDto,
  ): Promise<BuyerViewAllType> {
    return await this.orderService.buyerFindAllIfOwned(
      req.middleware.buyer.id,
      dto.page,
      dto.limit,
      dto.latest == true ? 'desc' : 'asc',
    );
  }

  @Get(':orderId')
  @ApiBuyerViewOne()
  async buyerViewOne(
    @Req() req: IRequest,
    @Param() param: BuyerViewOneDto,
  ): Promise<BuyerViewOneType> {
    return await this.orderService.buyerFindOneIfOwned(
      param.orderId,
      req.middleware.buyer.id,
    );
  }
}
