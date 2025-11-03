import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import type { IRequest } from '../../auth/middlewares/auth.middleware';

@Injectable()
export class SellerOriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: IRequest = context.switchToHttp().getRequest();

    if (request.middleware?.origin === 'SELLER_URL') {
      return true;
    }

    throw new ForbiddenException(
      'Access denied: invalid origin, only SELLER_URL allowed',
    );
  }
}
