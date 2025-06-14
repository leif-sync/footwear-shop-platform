import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Currency, CurrencyOptions } from "../domain/currency.js";
import { InvalidOrderError } from "../domain/errors/invalidOrderError.js";
import { PaymentAssociatedDataProvider } from "../domain/PaymentAssociatedDataProvider.js";
import {
  PaymentProcessor,
  PaymentProcessorOptions,
} from "../domain/paymentProcessor.js";
import { PaymentTransaction } from "../domain/paymentTransaction.js";
import { PaymentTransactionRepository } from "../domain/paymentTransactionRepository.js";
import {
  PaymentTransactionStatus,
  PaymentTransactionStatusOptions,
} from "../domain/paymentTransactionStatus.js";
import {
  TransactionType,
  TransactionTypeOptions,
} from "../domain/transactionType.js";

export class CreatePaymentTransaction {
  private readonly paymentTransactionRepository: PaymentTransactionRepository;
  private readonly paymentAssociatedDataProvider: PaymentAssociatedDataProvider;

  constructor(params: {
    paymentTransactionRepository: PaymentTransactionRepository;
    paymentAssociatedDataProvider: PaymentAssociatedDataProvider;
  }) {
    this.paymentTransactionRepository = params.paymentTransactionRepository;
    this.paymentAssociatedDataProvider = params.paymentAssociatedDataProvider;
  }

  async run(params: {
    orderId: string;
    transactionType: TransactionTypeOptions;
    transactionStatus: PaymentTransactionStatusOptions;
    amount: number;
    paymentProcessor: PaymentProcessorOptions;
    rawResponse: string;
    currency: CurrencyOptions;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const transactionId = UUID.generateRandomUUID();
    const orderId = new UUID(params.orderId);
    const transactionType = new TransactionType(params.transactionType);
    const transactionStatus = new PaymentTransactionStatus(
      params.transactionStatus
    );
    const amount = new PositiveInteger(params.amount);
    const paymentProcessor = new PaymentProcessor(params.paymentProcessor);
    const rawResponse = params.rawResponse;
    const currency = new Currency(params.currency);
    const createdAt = new Date(params.createdAt);
    const updatedAt = new Date(params.updatedAt);

    const orderExists =
      await this.paymentAssociatedDataProvider.checkIfOrderExists({
        orderId,
      });

    if (!orderExists) throw new InvalidOrderError({ orderId });

    const paymentTransaction = new PaymentTransaction({
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
    });

    await this.paymentTransactionRepository.create({ paymentTransaction });
    return {
      transactionId: transactionId.getValue(),
    };
  }
}
