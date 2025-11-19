/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { IRequest } from '../middlewares/auth.middleware';
import { UserService } from '../../user/user.service';
import { IJwtPayload } from './auth.service';
import { SellerStripeAccountMappingService } from '../../stripe/services/seller-account-mapping.service';
import { User } from '../../user/entities/user.entity';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { BuyerStripeCustomerAccountMapping } from '../../stripe/entities/buyer-customer-account-mapping.entity';
import { SellerStripeAccountMapping } from '../../stripe/entities/seller-account-mapping.entity';
import { Buyer } from '../../buyer/entities/buyer.entity';
import { BuyerUseCase } from '../../buyer/use-cases/buyer.usecase';

@Injectable()
export class AuthUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly buyerUseCase: BuyerUseCase,
    private readonly userService: UserService,
    private readonly sellAccountMappingService: SellerStripeAccountMappingService,
  ) {}

  async marketplaceAccessSetup(
    mainId: string,
    email: string,
  ): Promise<IJwtPayload> {
    /********************
     *    User Setup    *
     * *****************/
    // Step 1 - Check if marketplace user created
    // console.log('Check if marketplace user created');
    let user: User | null = null;
    try {
      user = await this.userService.findOneByMainId(mainId);
      // console.log('User already created');
    } catch (error) {
      console.log(error, '<< error');
      if (error instanceof NotFoundException) {
        // console.log('User not created');
        user = null;
      } else {
        throw new InternalServerErrorException('Error when fetching user', {
          cause: error,
        });
      }
    }
    // Step 2 - if not created, create one and get the userId
    if (user == null) {
      user = await this.userService.create(
        Object.assign(new CreateUserDto(), {
          mainId,
          email,
        }),
      );
      // console.log('Create new user');
    }
    /*************************************
     *      Buyer Account Setup    *
     * ***********************************/

    let buyerAccountSetUpData: {
      buyer: Buyer;
      buyerStripeCustomerAccountMapping: BuyerStripeCustomerAccountMapping;
    } | null = null;
    try {
      buyerAccountSetUpData = await this.buyerUseCase.setUpBuyerAccount(
        user.id,
        email,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Error when fetching buyer account',
        {
          cause: error,
        },
      );
    }

    /*************************************
     *     Stripe Seller Account Setup    *
     * ***********************************/
    // Step 5 - Check if seller.
    let sellerStripeAccountMapping: SellerStripeAccountMapping | null = null;
    try {
      sellerStripeAccountMapping =
        await this.sellAccountMappingService.findOneByUserId(user.id);
      // console.log('has sellerStripeAccountMapping');
    } catch (error) {
      if (error instanceof NotFoundException) {
        sellerStripeAccountMapping = null;
        // console.log('no sellerStripeAccountMapping');
      } else {
        throw new InternalServerErrorException(
          'Error when fetching seller mapping',
          {
            cause: error,
          },
        );
      }
    }

    /** Rturn a JWT playload for token generation */
    return {
      email,
      userId: user.id,
      buyer: {
        id: buyerAccountSetUpData.buyer.id,
        stripeCustomerId:
          buyerAccountSetUpData.buyerStripeCustomerAccountMapping
            .stripeCustomerId,
      },
      seller: sellerStripeAccountMapping
        ? {
            id: sellerStripeAccountMapping.sellerId,
            stripeAccountId: sellerStripeAccountMapping.stripeAccountId,
          }
        : null,
    };
  }

  verifyAccessToken(token: string): {
    email: string;
    familyName: string;
    givenName: string;
    userId: string;
  } {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  createMarketPlaceAccessToken(jwtPayload: IJwtPayload): string {
    return this.jwtService.sign(jwtPayload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: `${process.env.ACCESS_TOKEN_EXPIRY_DAY}d`,
    });
  }

  // verifyRefreshToken(token: string): any {
  //   return this.jwtService.verify(token, {
  //     secret: process.env.JWT_REFRESH_TOKEN_SECRET,
  //   });
  // }

  // accessTokenCookieOptions(): CookieOptions {
  //   return {
  //     httpOnly: process.env.COOKIE_HTTP_ONLY === 'TRUE',
  //     secure: process.env.COOKIE_SECURE === 'TRUE',
  //     maxAge: Number(process.env.ACCESS_TOKEN_EXPIRY_DAY) * 24 * 60 * 60 * 1000,
  //     sameSite: process.env.COOKIE_SAME_SITE as CookieOptions['sameSite'],
  //     domain: process.env.COOKIE_DOMAIN,
  //   };
  // }

  // refreshTokenConfigInCookie(): CookieOptions {
  //   return {
  //     httpOnly: process.env.COOKIE_HTTP_ONLY === 'TRUE',
  //     secure: process.env.COOKIE_SECURE === 'TRUE',
  //     maxAge:
  //       Number(process.env.REFRESH_TOKEN_EXPIRY_DAY) * 24 * 60 * 60 * 1000,
  //     sameSite: process.env.COOKIE_SAME_SITE as CookieOptions['sameSite'],
  //     domain: process.env.COOKIE_DOMAIN,
  //   };
  // }

  generateCsrfToken(userId: string): string {
    // return crypto.randomBytes(64).toString('hex');
    const hashUserId = crypto.createHash('sha256').update(userId).digest('hex');
    const randomValue = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now();
    const signature = crypto
      .createHmac('sha256', process.env.CSRF_TOKEN_SECRET as string)
      .update(`${hashUserId}.${randomValue}.${timestamp}`)
      .digest('hex');
    return `${hashUserId}.${randomValue}.${timestamp}.${signature}`;
  }

  validateCsrfToken(token: string, userId: string): boolean {
    const parts = token.split('.');
    const hashedUserId = parts[0];
    const randomValue = parts[1];
    const timestamp = parts[2];
    const signature = parts[3];

    const expectedhashedUserId = crypto
      .createHash('sha256')
      .update(userId)
      .digest('hex');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.CSRF_TOKEN_SECRET as string)
      .update(`${hashedUserId}.${randomValue}.${timestamp}`)
      .digest('hex');

    if (
      expectedSignature !== signature ||
      expectedhashedUserId !== hashedUserId
    ) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    if (
      Date.now() - parseInt(timestamp, 10) >
      Number(process.env.CSRF_TOKEN_EXPIRATION_MS)
    ) {
      throw new ForbiddenException('CSRF token expired');
    }
    return true;
  }

  /**
   * @description `getToken()` is to exteract token from cookies (web applicatrion)csrfToken
   * or api header(mobile application)
   */
  getToken(tokenType: 'REFRESH' | 'ACCESS', req: IRequest): string | undefined {
    /**
     * If it is a web application: we get the token from cookies
     * If it is a mobile application: we get the token from header
     */

    if (tokenType == 'ACCESS') {
      return (
        req.cookies['BVT_SID'] ||
        // in GET request, the token is in header
        (typeof req.headers['authorization'] === 'string'
          ? req.headers['authorization'].split(' ')[1] // split the `Bearer` from the token string
          : undefined) ||
        // in POST request, the token is in body.header
        (req.body &&
        req.body.headers &&
        req.body.headers['authorization'] &&
        typeof req.body.headers['authorization'] === 'string'
          ? req.body.headers['authorization'].split(' ')[1] // split the `Bearer` from the token string
          : undefined)
      );
    }

    return undefined;
  }

  // return (
  //   req.cookies['BVT_REFRESH'] ||
  //   // GET request
  //   (typeof req.headers['x-refresh-token'] === 'string'
  //     ? req.headers['x-refresh-token']
  //     : undefined) ||
  //   // POST request
  //   (req.body &&
  //   req.body.headers &&
  //   req.body.headers['x-refresh-token'] &&
  //   typeof req.body.headers['x-refresh-token'] === 'string'
  //     ? req.body.headers['x-refresh-token']
  //     : undefined)
  // );

  /**
   *  This function is a mock of the `verifyGoogleToke()`.
   *  This is for testing use only.
   *
   *  Please use idToken = `4242-4242-4242-4242`
   *  to pass this mock authentication.
   */
  // async loginWithGoogleMock(
  //   idToken: string,
  //   userAgent: string,
  //   // currentRefrestToken?: string,
  // ): Promise<{
  //   accessToken: string;
  //   refreshToken: string;
  //   id: string;
  //   givenName: string;
  //   familyName: string;
  //   email: string;
  //   isNewUser: boolean;
  //   picture: string;
  //   csrfToken: string;
  // }> {
  //   try {
  //     /**
  //      *  1.Get the payload
  //      */
  //     // const payload = ticket.getPayload();
  //     if (idToken !== '4242-4242-4242-4242') {
  //       throw new Error('Wrong number of segments in token: wrong-token-id');
  //     }

  //     const payload = {
  //       email: 'testingUser@bevetu.com',
  //       given_name: 'Herman',
  //       family_name: 'Lam',
  //       picture: 'www.mypic.com',
  //       sub: 'https://example.com/avatar.jpg',
  //     };

  //     let isNewUser = false;

  //     /**
  //      *  2.Get the User data (if current user) or Create new user
  //      */
  //     let user: User;
  //     try {
  //       user = await this.userService.findOneByEmail(payload.email);
  //     } catch (error) {
  //       if (error.status == 404) {
  //         isNewUser = true;
  //         const createUserDt = new CreateUserDto();
  //         createUserDt.email = payload.email;
  //         createUserDt.givenName = payload.given_name;
  //         createUserDt.familyName = payload.family_name;
  //         createUserDt.picture = payload.picture || undefined;
  //         user = await this.userService.create(createUserDt);
  //       } else {
  //         throw new InternalServerErrorException('Error in finding user');
  //       }
  //     }

  //     /**
  //      *  3. Create access and refresh token
  //      */
  //     const jwtPayload: IJwtPayload = {
  //       email: user.email,
  //       familyName: user.familyName,
  //       givenName: user.givenName,
  //       userId: user.id,
  //     };

  //     const accessToken = this.createAccessToken(jwtPayload);
  //     const refreshToken = this.createRefreshToken(jwtPayload);

  //     /**
  //      *  4. Revoke the old session if it has in the header
  //      */
  //     // if (currentRefrestToken) {
  //     //   await this.sessionService.revokeSession(currentRefrestToken);
  //     // }
  //     await this.sessionService.revokeAllSessionByUserId(user.id);
  //     /**
  //      *  5. Create session record in database
  //      */
  //     const createSessionDto = new CreateSessionDto();
  //     createSessionDto.userId = user.id;
  //     createSessionDto.provider = 'Local';
  //     createSessionDto.providerId = payload.sub || '';
  //     createSessionDto.refreshToken = refreshToken;
  //     createSessionDto.userAgent = userAgent;

  //     await this.sessionService.createSession(createSessionDto);

  //     return {
  //       accessToken,
  //       refreshToken,
  //       id: user.id,
  //       givenName: user.givenName,
  //       familyName: user.familyName,
  //       email: user.email,
  //       isNewUser,
  //       picture: payload.picture,
  //       csrfToken: this.generateCsrfToken(user.id),
  //     };
  //   } catch (error) {
  //     console.log(error, '<< error');
  //     throw new UnauthorizedException(`${error}`);
  //   }
  // }

  // /**
  //  *  This function is used in mobile application for access token regeneration
  //  */
  // async regenerateAccessTokenByRefreshToken(refreshToken): Promise<string> {
  //   /**
  //    *  Step 1 . Check if the refresh token is revoked
  //    *  Here we assume sessionService is the service that manages refresh tokens and their statuses
  //    */
  //   const isRevoked = await this.sessionService.isTokenRevoked(refreshToken);
  //   if (isRevoked) {
  //     throw new UnauthorizedException('Refresh token has been revoked');
  //   }

  //   try {
  //     /**
  //      *  Step 2 .Verify the refresh token
  //      */
  //     const { email, familyName, givenName, userId } =
  //       this.verifyRefreshToken(refreshToken);

  //     /**
  //      *  Step 3 .Generate a new access token and write into client's cookies
  //      */
  //     return this.createAccessToken({
  //       email,
  //       familyName,
  //       givenName,
  //       userId,
  //     });
  //   } catch {
  //     await this.sessionService.revokeSession(refreshToken);
  //     throw new UnauthorizedException('Invalid or expired refresh token');
  //   }
  // }
  // }
}
