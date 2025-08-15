import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService, IJwtPayload } from '../services/auth.service';
import { AuthUseCase } from '../services/auth.useCase';

/**
 *  @description Change the request structure.
 *  #### Reason:
 *  Amend the request structure can make it carries 'userId','name' and 'email',etc and pass to the controller for use.
 *  So the controller needs not to decode the JWT again
 */
export interface IRequest extends Request {
  csrfToken(): string;
  middleware: {
    mainId: string;
    userId: string;
    familyName: string;
    givenName: string;
    email: string;
    accessToken: string;
    origin: 'SELLER_URL' | 'BUYER_URL' | 'ADMIN_URL';
    stripeCustomerId: string;
    seller: {
      id: string;
      stripeAccountId: string;
    } | null;
  };
}

/**
 *  -------------------
 *    Exclusive List
 *  -------------------
 *  @description Paths in this list will be exclused to pass throught 'AuthMiddleware' Normaly, pages inside this list does not need to use the jwt (i.e. jwt = BVT_SID = access Token)
 */
export const authMiddlewareExclusionList = [
  // { path: '', method: RequestMethod.GET },
  // { path: 'v1/auth/google', method: RequestMethod.POST },
  // { path: 'v1/auth/google-mock', method: RequestMethod.POST },
  // { path: 'v1/auth/logout', method: RequestMethod.POST },
  // { path: 'v1/stripe-webhook', method: RequestMethod.POST },
  // { path: 'v1/stripe-webhook', method: RequestMethod.GET },
  // { path: '/metrics', method: RequestMethod.GET },
  // {
  //   path: 'v1/documents/pets/:petId/ai-diagnosis-records/:recordId/public-access',
  //   method: RequestMethod.POST,
  // },
  // {
  //   path: '/v1/document-viewers/document/:documentId/view-count',
  //   method: RequestMethod.GET,
  // },
];

/**
 * `AuthMiddleware` is set globally in main.ts. All the api requests will need to go throught the cookies checking before landing to the api
 * Except the endpoins in the above `authMiddlewareExclusionList`
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly authUseCase: AuthUseCase,
  ) {}

  async use(req: IRequest, res: Response, next: NextFunction) {
    /**
     *  Step 1. Get the token from cookies(web) or header(mobile)
     */
    console.log(' Step 1. Get the token from cookies(web) or header(mobile)');
    const accessToken = this.authService.getToken('ACCESS', req);
    if (!accessToken) {
      res.clearCookie('BVT_MKT', {
        ...this.authService.marketplaceTokenCookieOptions(),
        maxAge: 0,
      });
      throw new UnauthorizedException('No access token found');
    }

    /**
     *  Step 2. Verfiy the token and get user basic detail
     */
    console.log('Step 2. Verfiy the token and get user basic detail');
    let email: string, familyName: string, givenName: string, userId: string;
    try {
      const payload = this.authService.verifyAccessToken(accessToken);
      email = payload.email;
      familyName = payload.familyName;
      givenName = payload.givenName;
      userId = payload.userId;
    } catch {
      res.clearCookie('BVT_MKT', {
        ...this.authService.marketplaceTokenCookieOptions(),
        maxAge: 0,
      });
      throw new UnauthorizedException('Invalid or expired access token');
    }
    /**
     * Step 3. get the origin where the api is sent
     * */
    console.log('Step 3. get the origin where the api is sent');
    let origin: IRequest['middleware']['origin'];
    if (req.headers.origin === process.env.BUYER_URL) {
      origin = 'BUYER_URL';
    } else if (req.headers.origin === process.env.SELLER_URL) {
      origin = 'SELLER_URL';
    } else {
      throw new UnauthorizedException('Invalid Origin');
    }

    /**
     *  Step 4. Get the marketplace token from cookies(web) or header(mobile)
     */
    console.log(
      'Step 4. Get the marketplace token from cookies(web) or header(mobile)',
    );
    const marketplaceToken = this.authService.getMarketplaceToken(req);
    let marketplaceSetupData: IJwtPayload | null = null;

    /**
     * Step 5a: If a marketplace token exists, verify it.
     * It’s okay if the token is missing or invalid.
     * The system will create a new token and set it in the cookies.
     */
    try {
      console.log('Step 5. Verify marketplace token');
      if (marketplaceToken && typeof marketplaceToken == 'string') {
        marketplaceSetupData =
          this.authService.verifyMarketplaceToken(marketplaceToken);
        console.log('Step 5. Verify marketplace token successfully');
      } else {
        /**
         *  Step 5b . If no marketplace token or verification fail, throw error
         */
        console.log('Step 5b. No marketplace token');
        throw new Error();
      }
    } catch {
      /**
       *  Step 5c. If error, re-setup the marketplace data and set cookies
       */
      console.log('Step 5c. re-setup the marketplace data and set cookies');
      marketplaceSetupData = await this.authUseCase.marketplaceAccessSetup(
        userId,
        email,
      );
      this.authService.marketplaceTokenCookieOptions();
      console.log(
        this.authService.marketplaceTokenCookieOptions(),
        '<this.authService.marketplaceTokenCookieOptions();< cookieoption',
      );
      res.cookie(
        'BVT_MKT',
        this.authService.generateMarketPlaceToken(marketplaceSetupData),
        this.authService.marketplaceTokenCookieOptions(),
      );
    }

    /**
     *  Step 7. set cookies in middleware
     */
    console.log('Step 7. set cookies in middleware');
    req.middleware = {
      // This is the id that used across all platforms
      mainId: userId,

      // This is the id that used in this platforms only
      userId: marketplaceSetupData.userId,
      familyName,
      givenName,
      email,
      accessToken,
      origin,
      stripeCustomerId: marketplaceSetupData.stripeCustomerId,
      seller: marketplaceSetupData.seller,
    };

    console.log(req.middleware);

    next();
  }
}
