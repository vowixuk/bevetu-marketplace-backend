import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  NotFoundException,
} from '@nestjs/common';

import type { Response } from 'express';
import type { IRequest } from './middlewares/auth.middleware';

import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { ApiLogout } from './auth.swagger';
// import {
//   ApiCheckSession,
//   ApiGoogleLogin,
//   ApiGoogleLoginMock,
//   ApiLogout,
//   ApiRegenerateAccessToken,
// } from './auth.swagger';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  authUseCase: any;
  constructor(private readonly authService: AuthService) {}

  /**
   * This is for mobile device which not using cookies to get the marketPlaceToken
   */
  // @Get('marketPlaceToken')
  // getMarketPlaceToken(@Req() req: IRequest, @Res() res: Response) {
  //   const marketplaceSetupData = await this.authUseCase.marketplaceAccessSetup(
  //     requserId,
  //     email,
  //   );
  //   const marketplaceToken =  this.authService.generateMarketPlaceToken(marketplaceSetupData);
  // }

  @Post('logout')
  @ApiLogout()
  logout(@Res() res: Response) {
    res.clearCookie('BVT_MKT', {
      ...this.authService.marketplaceTokenCookieOptions(),
      maxAge: 0,
    });

    res.status(200).send({
      message: 'Logout successful',
    });
  }
}
