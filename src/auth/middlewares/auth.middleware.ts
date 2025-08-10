import {
  Injectable,
  NestMiddleware,
  RequestMethod,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

/**
 *  @description Change the request structure.
 *  #### Reason:
 *  Amend the request structure can make it carries 'userId','name' and 'email',etc and pass to the controller for use.
 *  So the controller needs not to decode the JWT again
 */
export interface IRequest extends Request {
  csrfToken(): string;
  middleware: {
    bvtUserId: string;
    userId: string;
    familyName: string;
    givenName: string;
    email: string;
    accessToken: string;
    origin: 'VENDOR_URL' | 'BUYER_URL' | 'ADMIN_URL';
  };
}

/**
 *  -------------------
 *    Exclusive List
 *  -------------------
 *  @description Paths in this list will be exclused to pass throught 'AuthMiddleware' Normaly, pages inside this list does not need to use the jwt (i.e. jwt = BVT_SID = access Token)
 */
export const authMiddlewareExclusionList = [
  { path: '', method: RequestMethod.GET },
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
  constructor(private readonly authService: AuthService) {}

  use(req: IRequest, res: Response, next: NextFunction) {
    /**
     *  Step 1 . Get the token from cookies(web) or header(mobile)
     */
    const accessToken = this.authService.getToken('ACCESS', req);

    if (!accessToken) {
      throw new UnauthorizedException('No access token found');
    }

    try {
      // Step 1 : get the user data from access token
      const { email, familyName, givenName, userId } =
        this.authService.verifyAccessToken(accessToken);

      // Step 2 : get the origin where the api is sent
      let origin: IRequest['middleware']['origin'];
      if (req.headers.origin === process.env.BUYER_URL) {
        origin = 'BUYER_URL';
      } else if (req.headers.origin === process.env.VENDOR_URL) {
        origin = 'VENDOR_URL';
      } else {
        throw new UnauthorizedException('Invalid Origin');
      }

      // Step 3 : get the origin where the api is sent
      req.middleware = {
        bvtUserId: userId,
        userId: '',
        familyName,
        givenName,
        email,
        accessToken,
        origin,
      };

      next();
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
