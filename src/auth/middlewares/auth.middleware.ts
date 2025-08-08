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
    userId: string;
    familyName: string;
    givenName: string;
    email: string;
    accessToken: string;
    origin: 'SELLER' | 'BUYER';
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
      const { email, familyName, givenName, userId } =
        this.authService.verifyAccessToken(accessToken);

      let origin: IRequest['middleware']['origin'];
      if (req.headers.origin === process.env.BUYER_URL) {
        origin = 'BUYER';
      } else if (req.headers.origin === process.env.SELLER_URL) {
        origin = 'SELLER';
      } else {
        throw new UnauthorizedException('Invalid Origin');
      }

      req.middleware = {
        userId,
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
