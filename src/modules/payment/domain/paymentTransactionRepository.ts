import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { PaymentTransaction } from "./paymentTransaction.js";
import { PaymentTransactionStatus } from "./paymentTransactionStatus.js";

type PaymentSearchCriteria = {
  limit: PositiveInteger;
  offset: NonNegativeInteger;
  status?: PaymentTransactionStatus;
};

export abstract class PaymentTransactionRepository {
  abstract list(params: PaymentSearchCriteria): Promise<PaymentTransaction[]>;

  abstract count(
    params: Pick<PaymentSearchCriteria, "status">
  ): Promise<NonNegativeInteger>;

  abstract create(params: {
    paymentTransaction: PaymentTransaction;
  }): Promise<void>;

  abstract find(params: {
    transactionId: UUID;
  }): Promise<PaymentTransaction | null>;

  abstract find(params: {
    gatewaySessionId: string;
  }): Promise<PaymentTransaction | null>;

  abstract exists(params: { transactionId: UUID }): Promise<boolean>;
  abstract exists(params: { gatewaySessionId: string }): Promise<boolean>;
}
