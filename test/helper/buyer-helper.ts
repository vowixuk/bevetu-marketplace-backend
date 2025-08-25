import { BuyerUseCase } from '../../src/buyer/services/buyer.usecase';

export async function testBuyerSetup(
  testUserId: string,
  email: string,
  buyerUseCase: BuyerUseCase,
) {
  // Create a buyer account for the user
  const buyerAccountSetup = await buyerUseCase.setUpBuyerAccount(
    testUserId,
    email,
  );

  const buyer = buyerAccountSetup.buyer;
  const buyerStripeCustomerId =
    buyerAccountSetup.buyerStripeCustomerAccountMapping.stripeCustomerId;

  return {
    buyer,
    buyerStripeCustomerId,
  };
}
