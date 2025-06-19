import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { PaymentTransaction } from "./paymentTransaction.js";
import { PaymentTransactionStatus } from "./paymentTransactionStatus.js";

export interface PaymentFilterCriteria {
  status?: PaymentTransactionStatus;
}

export interface PaginatedPaymentFilterCriteria extends PaymentFilterCriteria {
  limit: PositiveInteger;
  offset: NonNegativeInteger;
}

export type PaymentSearchOptions =
  | {
      transactionId: UUID;
    }
  | {
      gatewaySessionId: string;
    };

export abstract class PaymentTransactionRepository {
  abstract list(
    params: PaginatedPaymentFilterCriteria
  ): Promise<PaymentTransaction[]>;

  abstract count(params: PaymentFilterCriteria): Promise<NonNegativeInteger>;

  abstract create(params: {
    paymentTransaction: PaymentTransaction;
  }): Promise<void>;

  abstract find(
    params: PaymentSearchOptions
  ): Promise<PaymentTransaction | null>;

  abstract exists(params: PaymentSearchOptions): Promise<boolean>;
}
