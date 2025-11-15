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
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { IRequest } from '../../auth/middlewares/auth.middleware';

import {
  CreateProductDto,
  SetProductOnShelfDto,
  ShopIdParamDto,
  UpdateProductDto,
  ViewProductsDto,
} from '../dto';

import {
  CreateProductUseCase,
  SetProductOnShelfUseCase,
  UpdateProductUseCase,
  ViewProductListUseCase,
  ResetProductOnShelfUseCase,
  SellerViewProductUseCase,
  DeleteProductUseCase,
} from '../use-cases/seller';

import {
  CreateProductReturnSchema,
  GetUploadProductPresignUrlReturnSchema,
  ResetProductOnShelfReturnSchema,
  SellerViewProductReturnSchema,
  SetProductOnShelfReturnSchema,
  UpdateProductReturnSchema,
  ViewProductListReturnSchema,
} from '../product.type';

import {
  ApiAddProductImage,
  ApiCreateProduct,
  ApiDeleteProduct,
  ApiGetUploadProductPicturePresignUrl,
  ApiRemoveProductImage,
  ApiResetProductOnShelf,
  ApiSellerViewProduct,
  ApiSetProductOnShelf,
  ApiUpdateProduct,
  ApiViewProductList,
} from '../product.swagger';
import { SellerOriginGuard } from '../../share/guards/seller-site-origin.guard';
import { ProductIdShopIdParamDto } from '../dto/product-id-shop-id-param.dto';
import { GenerateUploadPresignedUrlDto } from '../dto/generate-upload-presigned-url.dto';
import { ProductService } from '../product.services';

@UseGuards(SellerOriginGuard)
@ApiTags('Product - seller')
@Controller({ path: 'product/seller', version: '1' })
export class ProductSellerController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly setProductOnShelfUseCase: SetProductOnShelfUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly viewProductListUseCase: ViewProductListUseCase,
    private readonly resetProductOnShelfUseCase: ResetProductOnShelfUseCase,
    private readonly sellerViewProductUseCase: SellerViewProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly productService: ProductService,
  ) {}

  @Post('shop/:shopId/create-product')
  @ApiCreateProduct()
  async createProduct(
    @Req() req: IRequest,
    @Param() shopIdParamDto: ShopIdParamDto,
    @Body() createProductDto: CreateProductDto,
  ): Promise<CreateProductReturnSchema> {
    // req.middleware.origin = 'BUYER_URL';
    await this.createProductUseCase.execute(
      req.middleware.seller!.id,
      shopIdParamDto.shopId,
      createProductDto,
    );

    return {
      message: 'created',
    };
  }

  @Patch('shop/:shopId/set-product-on-shelf/:productId')
  @ApiSetProductOnShelf()
  async setProductOnShelf(
    @Req() req: IRequest,
    @Body() body: SetProductOnShelfDto,
    @Param() pram: ProductIdShopIdParamDto,
  ): Promise<SetProductOnShelfReturnSchema> {
    await this.setProductOnShelfUseCase.execute(
      req.middleware.seller!.id,
      pram.shopId,
      pram.productId,
      body.isOnShelf,
    );
    return {
      message: 'updated',
    };
  }

  @Patch('shop/:shopId/update-product/:productId')
  @ApiUpdateProduct()
  async updateProduct(
    @Req() req: IRequest,
    @Body() dto: UpdateProductDto,
    @Param() pram: ProductIdShopIdParamDto,
  ): Promise<UpdateProductReturnSchema> {
    await this.updateProductUseCase.execute(
      req.middleware.seller!.id,
      pram.shopId,
      pram.productId,
      dto,
    );
    return {
      message: 'updated',
    };
  }

  @Get('shop/:shopId/view-product-list')
  @ApiViewProductList()
  async viewProductList(
    @Req() req: IRequest,
    @Param() shopIdParam: ShopIdParamDto,
    @Query() dto: ViewProductsDto,
  ): Promise<ViewProductListReturnSchema> {
    return await this.viewProductListUseCase.execute(
      req.middleware.seller!.id,
      shopIdParam.shopId,
      dto,
    );
  }

  @Post('shop/:shopId/reset-product-on-shelf')
  @ApiResetProductOnShelf()
  async resetProductOnShelf(
    @Req() req: IRequest,
    @Param() shopIdParam: ShopIdParamDto,
  ): Promise<ResetProductOnShelfReturnSchema> {
    await this.resetProductOnShelfUseCase.execute(
      req.middleware.seller!.id,
      shopIdParam.shopId,
    );
    return {
      message: 'reset',
    };
  }

  @Get('shop/:shopId/view-product/')
  @ApiSellerViewProduct()
  async sellerViewProduct(
    @Req() req: IRequest,
    @Param() pram: ProductIdShopIdParamDto,
  ): Promise<SellerViewProductReturnSchema> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sellerId, ...safeProduct } =
      await this.sellerViewProductUseCase.execute(
        req.middleware.seller!.id,
        pram.shopId,
        pram.productId,
      );

    return safeProduct;
  }

  @Delete('shop/:shopId/delete-product/:productId')
  @ApiDeleteProduct()
  async DeleteProductUseCase(
    @Req() req: IRequest,
    @Param() pram: ProductIdShopIdParamDto,
  ) {
    await this.deleteProductUseCase.execute(
      req.middleware.seller!.id,
      pram.shopId,
      pram.productId,
    );
    return {
      message: 'deleted',
    };
  }

  @Post('profile-picture-upload-url')
  @ApiGetUploadProductPicturePresignUrl()
  async getUploadProductPicturePresignUrl(
    @Req() req: IRequest,
    @Query() query: GenerateUploadPresignedUrlDto,
  ): Promise<GetUploadProductPresignUrlReturnSchema> {
    const url =
      await this.productService.generateUploadProductPicturePresignedUrl(
        query.fileName,
        req.middleware.seller!.id,
      );
    return { url };
  }

  @Patch('shop/:shopId/update-product/:productId/remove-image')
  @ApiRemoveProductImage()
  @HttpCode(204)
  async removeProductImage(
    @Req() req: IRequest,
    @Param() param: ProductIdShopIdParamDto,
    @Body() body: UpdateProductDto,
  ) {
    await this.productService.removeImageUrl(
      req.middleware.seller!.id,
      param.productId,
      body,
    );
  }

  @Patch('shop/:shopId/update-product/:productId/add-image')
  @ApiAddProductImage()
  @HttpCode(204)
  async addProductImage(
    @Req() req: IRequest,
    @Param() param: ProductIdShopIdParamDto,
    @Body() body: UpdateProductDto,
  ) {
    await this.productService.addImageUrl(
      req.middleware.seller!.id,
      param.productId,
      body,
    );
  }
}
