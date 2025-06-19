import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Currency, CurrencyOptions } from "./currency.js";
import {
  PaymentProcessor,
  PaymentProcessorOptions,
} from "./paymentProcessor.js";
import {
  PaymentTransactionStatus,
  PaymentTransactionStatusOptions,
} from "./paymentTransactionStatus.js";
import { TransactionType, TransactionTypeOptions } from "./transactionType.js";

export interface PrimitivePaymentTransaction {
  transactionId: string;
  orderId: string;
  transactionType: TransactionTypeOptions;
  transactionStatus: PaymentTransactionStatusOptions;
  amount: number;
  paymentProcessor: PaymentProcessorOptions;
  rawResponse: string;
  currency: CurrencyOptions;
  createdAt: Date;
  updatedAt: Date;
  gatewaySessionId?: string;
}

export class PaymentTransaction {
  private readonly transactionId: UUID;
  private readonly orderId: UUID;
  private readonly transactionType: TransactionType;
  private readonly transactionStatus: PaymentTransactionStatus;
  private readonly amount: NonNegativeInteger;
  private readonly paymentProcessor: PaymentProcessor;
  private readonly rawResponse: string;
  private readonly currency: Currency;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;
  private readonly gatewaySessionId?: string;

  constructor(params: {
    transactionId: UUID;
    orderId: UUID;
    transactionType: TransactionType;
    transactionStatus: PaymentTransactionStatus;
    amount: NonNegativeInteger;
    paymentProcessor: PaymentProcessor;
    rawResponse: string;
    currency: Currency;
    createdAt: Date;
    updatedAt: Date;
    gatewaySessionId?: string;
  }) {
    const {
      transactionId,
      orderId,
      transactionType,
      transactionStatus,
      amount,
      paymentProcessor,
      rawResponse,
      currency,
      createdAt,
      updatedAt,
    } = params;

    this.transactionId = UUID.clone(transactionId);
    this.orderId = UUID.clone(orderId);
    this.transactionType = TransactionType.clone(transactionType);
    this.transactionStatus = PaymentTransactionStatus.clone(transactionStatus);
    this.amount = NonNegativeInteger.clone(amount);
    this.paymentProcessor = PaymentProcessor.clone(paymentProcessor);
    this.rawResponse = rawResponse;
    this.currency = Currency.clone(currency);
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
    this.gatewaySessionId = params.gatewaySessionId;
  }

  static clone(transaction: PaymentTransaction) {
    return new PaymentTransaction({
      transactionId: transaction.transactionId,
      orderId: transaction.orderId,
      transactionType: transaction.transactionType,
      transactionStatus: transaction.transactionStatus,
      amount: transaction.amount,
      paymentProcessor: transaction.paymentProcessor,
      rawResponse: transaction.rawResponse,
      currency: transaction.currency,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      gatewaySessionId: transaction.gatewaySessionId,
    });
  }

  getOrderId() {
    return this.orderId.getValue();
  }

  getId() {
    return this.transactionId.getValue();
  }

  getMerchantId() {
    return this.orderId.getValue();
  }

  getStatus() {
    return this.transactionStatus.getValue();
  }

  isPayment() {
    return this.transactionType.isPayment();
  }

  isApproved() {
    return this.transactionStatus.isApproved();
  }

  isRefund() {
    return this.transactionType.isRefund();
  }

  getGatewaySessionId() {
    return this.gatewaySessionId;
  }

  isPaymentAndApproved() {
    return this.isPayment() && this.isApproved();
  }

  getAmount(): NonNegativeInteger {
    return NonNegativeInteger.clone(this.amount);
  }

  toPrimitives(): PrimitivePaymentTransaction {
    return {
      transactionId: this.transactionId.getValue(),
      orderId: this.orderId.getValue(),
      transactionType: this.transactionType.getValue(),
      transactionStatus: this.transactionStatus.getValue(),
      amount: this.amount.getValue(),
      paymentProcessor: this.paymentProcessor.getValue(),
      rawResponse: this.rawResponse,
      currency: this.currency.getValue(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      gatewaySessionId: this.gatewaySessionId,
    };
  }
}
