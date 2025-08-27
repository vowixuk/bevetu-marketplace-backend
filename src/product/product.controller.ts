import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { IRequest } from 'src/auth/middlewares/auth.middleware';

import {
  CreateProductDto,
  ProductIdParamDto,
  SetProductOnShelfDto,
  ShopIdParamDto,
  UpdateProductDto,
  ViewProductsDto,
} from './dto';

import {
  CreateProductUseCase,
  SetProductOnShelfUseCase,
  UpdateProductUseCase,
  ViewProductListUseCase,
  ResetProductOnShelfUseCase,
  SellerViewProductUseCase,
  DeleteProductUseCase,
} from './use-cases/seller';

import {
  CreateProductReturnSchema,
  ResetProductOnShelfReturnSchema,
  SellerViewProductReturnSchema,
  SetProductOnShelfReturnSchema,
  UpdateProductReturnSchema,
  ViewProductListReturnSchema,
} from './product.type';
import {
  ApiCreateProduct,
  ApiDeleteProduct,
  ApiResetProductOnShelf,
  ApiSellerViewProduct,
  ApiSetProductOnShelf,
  ApiUpdateProduct,
  ApiViewProductList,
} from './product.swagger';

@ApiTags('Product')
@Controller({ path: 'product', version: '1' })
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly setProductOnShelfUseCase: SetProductOnShelfUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly viewProductListUseCase: ViewProductListUseCase,
    private readonly resetProductOnShelfUseCase: ResetProductOnShelfUseCase,
    private readonly sellerViewProductUseCase: SellerViewProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post('seller/shop/:shopId/create-product')
  @ApiCreateProduct()
  async createProduct(
    @Req() req: IRequest,
    @Param(':shopId') shopIdParamDto: ShopIdParamDto,
    @Body() createProductDto: CreateProductDto,
  ): Promise<CreateProductReturnSchema> {
    await this.createProductUseCase.execute(
      req.middleware.seller!.id,
      shopIdParamDto.shopId,
      createProductDto,
    );

    return {
      message: 'created',
    };
  }

  @Patch('seller/shop/:shopId/set-product-on-shelf/:productId')
  @ApiSetProductOnShelf()
  async setProductOnShelf(
    @Req() req: IRequest,
    @Body() body: SetProductOnShelfDto,
    @Param(':shopId') shopIdParam: ShopIdParamDto,
    @Param(':productId') productIdParam: ProductIdParamDto,
  ): Promise<SetProductOnShelfReturnSchema> {
    await this.setProductOnShelfUseCase.execute(
      req.middleware.seller!.id,
      shopIdParam.shopId,
      productIdParam.productId,
      body.isOnShelf,
    );
    return {
      message: 'updated',
    };
  }

  @Patch('seller/shop/:shopId/update-product/:productId')
  @ApiUpdateProduct()
  async updateProduct(
    @Req() req: IRequest,
    @Body() dto: UpdateProductDto,
    @Param(':productId') productIdParam: ProductIdParamDto,
    @Param(':shopId') shopIdParam: ShopIdParamDto,
  ): Promise<UpdateProductReturnSchema> {
    await this.updateProductUseCase.execute(
      req.middleware.seller!.id,
      shopIdParam.shopId,
      productIdParam.productId,
      dto,
    );
    return {
      message: 'updated',
    };
  }

  @Get('seller/shop/:shopId/view-product-list')
  @ApiViewProductList()
  async viewProductList(
    @Req() req: IRequest,
    @Param('shopId') shopIdParam: ShopIdParamDto,
    @Query() dto: ViewProductsDto,
  ): Promise<ViewProductListReturnSchema> {
    return await this.viewProductListUseCase.execute(
      req.middleware.seller!.id,
      shopIdParam.shopId,
      dto,
    );
  }

  @Post('seller/shop/:shopId/reset-product-on-shelf')
  @ApiResetProductOnShelf()
  async resetProductOnShelf(
    @Req() req: IRequest,
    @Param(':shopId') shopIdParam: ShopIdParamDto,
  ): Promise<ResetProductOnShelfReturnSchema> {
    await this.resetProductOnShelfUseCase.execute(
      req.middleware.seller!.id,
      shopIdParam.shopId,
    );
    return {
      message: 'reset',
    };
  }

  @Get('seller/shop/:shopId/view-product/')
  @ApiSellerViewProduct()
  async sellerViewProduct(
    @Req() req: IRequest,
    @Param(':productId') productIdParam: ProductIdParamDto,
    @Param(':shopId') shopIdParam: ShopIdParamDto,
  ): Promise<SellerViewProductReturnSchema> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sellerId, ...safeProduct } =
      await this.sellerViewProductUseCase.execute(
        req.middleware.seller!.id,
        shopIdParam.shopId,
        productIdParam.productId,
      );

    return safeProduct;
  }

  @Delete('seller/shop/:shopId/view-product/')
  @ApiDeleteProduct()
  async DeleteProductUseCase(
    @Req() req: IRequest,
    @Param(':productId') productIdParam: ProductIdParamDto,
    @Param(':shopId') shopIdParam: ShopIdParamDto,
  ) {
    await this.deleteProductUseCase.execute(
      req.middleware.seller!.id,
      shopIdParam.shopId,
      productIdParam.productId,
    );
    return {
      message: 'deleted',
    };
  }
}
