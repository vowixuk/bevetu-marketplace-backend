import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Buyer } from '../entities/buyer.entity';
import { UpdateBuyerDto } from '../dto/update-buyer.dto';
import { StripeService } from '../../stripe/services/stripe.service';
import { BuyerStripeCustomerAccountMapping } from '../../stripe/entities/buyer-customer-account-mapping.entity';
import { BuyerService } from './buyer.service';
import { CreateBuyerStripeCustomerAccountMappingDto } from '../../stripe/dto/create-buyer-account-mapping.dto';
import { BuyerStripeCustomerAccountMappingService } from '../../stripe/services/buyer-account-mapping.service';

@Injectable()
export class BuyerUseCase {
  constructor(
    private readonly stripeService: StripeService,
    private readonly buyerService: BuyerService,
    private readonly buyerAccountMappingService: BuyerStripeCustomerAccountMappingService,
  ) {}

  async setUpBuyerAccount(
    userId: string,
    email: string,
  ): Promise<{
    buyer: Buyer;
    buyerStripeCustomerAccountMapping: BuyerStripeCustomerAccountMapping;
  }> {
    /**
     * Check if buyer account is setup
     */
    // Step 1 - use the user id - check if buyer  account created
    let buyer: Buyer | null = null;
    try {
      buyer = await this.buyerService.findByUserId(userId);
      console.log('has buyer account');
    } catch (error) {
      if (error instanceof NotFoundException) {
        console.log('No Buyer account');
        buyer = null;
      } else {
        throw new InternalServerErrorException(
          'Error when fetching buyer account',
          {
            cause: error,
          },
        );
      }
    }
    // Step 2 - if buyer account not created - create one.
    if (buyer == null) {
      try {
        buyer = await this.buyerService.create(userId);
        console.log('Created new buyerAccount');
      } catch (error) {
        console.log('Error new create buyer account');
        throw new InternalServerErrorException(
          'Error when fetching buyer account',
          {
            cause: error,
          },
        );
      }
    }

    /**
     * Up to this point, buyer account must exsit.
     * Now check if stripe customer account.
     * One user acount has only one stripe customer account
     * A Stripe customer account is created for each user
     * when the first time they access the system, to facilitate purchases.
     */
    // Step 5 - use the user id - check if buyer stripe account created
    let buyerStripeCustomerAccountMapping: BuyerStripeCustomerAccountMapping | null =
      null;
    try {
      buyerStripeCustomerAccountMapping =
        await this.buyerAccountMappingService.findOneByBuyerId(buyer.id);
      console.log('has BuyerStripeCustomerAccountMapping');
    } catch (error) {
      if (error instanceof NotFoundException) {
        console.log('No BuyerStripeCustomerAccountMapping');
        buyerStripeCustomerAccountMapping = null;
      } else {
        throw new InternalServerErrorException(
          'Error when fetching buyer mapping',
          {
            cause: error,
          },
        );
      }
    }
    // Step 4 - if not created - create one from stripe.
    if (buyerStripeCustomerAccountMapping == null) {
      // create in stripe account
      const stripeCustomer = await this.stripeService.createStripeCustomer(
        userId,
        email,
        process.env.PLATFORM || 'NA',
      );
      console.log('Created new stripeCustomer');

      // create in stripe - db mapping
      buyerStripeCustomerAccountMapping =
        await this.buyerAccountMappingService.create(
          buyer.id,
          Object.assign(new CreateBuyerStripeCustomerAccountMappingDto(), {
            stripeCustomerId: stripeCustomer.id,
            identifyId: stripeCustomer.id,
          }),
        );
      console.log('Created new BuyerStripeCustomerAccountMapping');

      // update buyer account

      await this.buyerService.update(
        buyer.id,
        userId,
        Object.assign(new UpdateBuyerDto(), {
          paymentMethod: {
            stripe: {
              stripeCustomerId: stripeCustomer.id,
            },
          },
        }),
      );
      console.log('Updated mapping to buy account');
    }

    return {
      buyer,
      buyerStripeCustomerAccountMapping,
    };
  }
}
