import { Injectable } from '@nestjs/common';
import { CreateSellerConnectAccountDto } from './dto/create-seller-connected-account.dto';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class SellerService {
  constructor(private readonly stripeService: StripeService) {}

  async createSellerConnectedAccount(
    userId: string,
    createSellerConnectAccountDto: CreateSellerConnectAccountDto,
  ) {
    const connectedAccount = await this.stripeService.createAccount(
      createSellerConnectAccountDto.country,
    );

    // create a seller account ans save the stripe connected ID
    return connectedAccount;
  }

  // findAll() {
  //   return `This action returns all seller`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} seller`;
  // }

  // update(id: number, updateSellerDto: UpdateSellerDto) {
  //   return `This action updates a #${id} seller`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} seller`;
  // }
}
