/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// csrf.middleware.ts
import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  RequestMethod,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { IRequest } from './auth.middleware';
import { AuthService } from '../services/auth.service';

/**
 *  -------------------
 *    Exclusive List
 *  -------------------
 *  @description Paths in this list will be exclused to pass throught 'AuthMiddleware' Normaly, pages inside this list does not need to use the jwt (i.e. jwt = BVT_SID = access Token)
 */
export const csrfMiddlewareExclusionList = [
  { path: '', method: RequestMethod.GET },
  { path: 'v1/auth/google', method: RequestMethod.POST },
  { path: 'v1/auth/google-mock', method: RequestMethod.POST },
  { path: 'v1/auth/check-session', method: RequestMethod.GET },
  { path: 'v1/auth/logout', method: RequestMethod.POST },
  { path: 'v1/stripe-webhook', method: RequestMethod.POST },
  { path: 'v1/stripe-webhook', method: RequestMethod.GET },
  { path: '/metrics', method: RequestMethod.GET },
  {
    path: 'v1/documents/pets/:petId/ai-diagnosis-records/:recordId/public-access',
    method: RequestMethod.POST,
  },
  {
    path: '/v1/document-viewers/document/:documentId/view-count',
    method: RequestMethod.GET,
  },
];

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  private setCsrfToken(userId: string, res: Response) {
    const newCsrfToken = this.authService.generateCsrfToken(userId);
    // res.cookie(
    //   'BVT_CSRF',
    //   newCsrfToken,
    //   this.authService.csrfTokenConfigInCookie(),
    // );
    res.setHeader('x-csrf-token', newCsrfToken);
    return;
  }

  use(req: IRequest, res: Response, next: NextFunction): void {
    const csrfToken: string | undefined =
      (req.headers['x-csrf-token'] as string) ||
      (req.body.headers && req.body.headers.include('x-csrf-token')
        ? (req.body.headers['x-csrf-token'] as string)
        : undefined);

    if (!csrfToken) {
      throw new ForbiddenException('CSRF token missing');
    }

    const isValid = this.authService.validateCsrfToken(
      csrfToken,
      req.middleware.bvtUserId,
    );

    if (!isValid) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    this.setCsrfToken(req.middleware.bvtUserId, res);

    return next();
  }
}
