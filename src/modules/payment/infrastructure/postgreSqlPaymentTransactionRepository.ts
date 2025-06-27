import {
  PaginatedPaymentFilterCriteria,
  PaymentFilterCriteria,
  PaymentSearchOptions,
  PaymentTransactionRepository,
} from "../domain/paymentTransactionRepository.js";
import { prismaConnection } from "../../shared/infrastructure/prismaClient.js";
import { PaymentTransaction } from "../domain/paymentTransaction.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { Currency } from "../domain/currency.js";
import { UUID } from "../../shared/domain/UUID.js";
import { PaymentProcessor } from "../domain/paymentProcessor.js";
import { PaymentTransactionStatus } from "../domain/paymentTransactionStatus.js";
import { TransactionType } from "../domain/transactionType.js";
import { $Enums } from "../../../../generated/prisma/index.js";
import { JsonValue } from "../../../../generated/prisma/runtime/library.js";

export class PostgreSqlPaymentTransactionRepository
  implements PaymentTransactionRepository
{
  async create(params: {
    paymentTransaction: PaymentTransaction;
  }): Promise<void> {
    const {
      amount,
      createdAt,
      currency,
      orderId,
      paymentProcessor,
      rawResponse,
      transactionId,
      gatewaySessionId,
      transactionStatus,
      transactionType,
      updatedAt,
    } = params.paymentTransaction.toPrimitives();

    await prismaConnection.paymentTransaction.create({
      data: {
        amount,
        createdAt,
        currency,
        orderId,
        paymentProcessor,
        rawResponse: JSON.parse(rawResponse),
        transactionId,
        gatewaySessionId,
        transactionStatus,
        transactionType,
        updatedAt,
      },
    });
  }

  async find(params: PaymentSearchOptions): Promise<PaymentTransaction | null> {
    const isTransactionId = "transactionId" in params;
    if (isTransactionId) {
      const transactionId = params.transactionId.getValue();
      const storedPaymentTransaction =
        await prismaConnection.paymentTransaction.findUnique({
          where: { transactionId },
        });

      if (!storedPaymentTransaction) return null;

      return this.mapStoredTransactionToPaymentTransaction(
        storedPaymentTransaction
      );
    }

    const gatewaySessionId = params.gatewaySessionId;
    const paymentTransaction =
      await prismaConnection.paymentTransaction.findFirst({
        where: { gatewaySessionId },
      });

    if (!paymentTransaction) return null;

    return new PaymentTransaction({
      amount: new NonNegativeInteger(paymentTransaction.amount),
      createdAt: paymentTransaction.createdAt,
      currency: Currency.from(paymentTransaction.currency),
      orderId: new UUID(paymentTransaction.orderId),
      paymentProcessor: PaymentProcessor.from(
        paymentTransaction.paymentProcessor
      ),
      rawResponse: JSON.stringify(paymentTransaction.rawResponse),
      transactionId: new UUID(paymentTransaction.transactionId),
      transactionStatus: PaymentTransactionStatus.from(
        paymentTransaction.transactionStatus
      ),
      transactionType: TransactionType.from(paymentTransaction.transactionType),
      updatedAt: paymentTransaction.updatedAt,
      gatewaySessionId: paymentTransaction.gatewaySessionId
        ? paymentTransaction.gatewaySessionId
        : undefined,
    });
  }

  private mapStoredTransactionToPaymentTransaction(storedPaymentTransaction: {
    amount: number;
    createdAt: Date;
    currency: $Enums.Currency;
    orderId: string;
    paymentProcessor: $Enums.PaymentProcessor;
    rawResponse: JsonValue;
    transactionId: string;
    gatewaySessionId: string | null;
    transactionStatus: $Enums.TransactionStatus;
    transactionType: $Enums.TransactionType;
    updatedAt: Date;
  }): PaymentTransaction {
    return new PaymentTransaction({
      amount: new NonNegativeInteger(storedPaymentTransaction.amount),
      createdAt: storedPaymentTransaction.createdAt,
      currency: Currency.from(storedPaymentTransaction.currency),
      orderId: new UUID(storedPaymentTransaction.orderId),
      paymentProcessor: PaymentProcessor.from(
        storedPaymentTransaction.paymentProcessor
      ),
      rawResponse: JSON.stringify(storedPaymentTransaction.rawResponse),
      transactionId: new UUID(storedPaymentTransaction.transactionId),
      transactionStatus: PaymentTransactionStatus.from(
        storedPaymentTransaction.transactionStatus
      ),
      transactionType: TransactionType.from(
        storedPaymentTransaction.transactionType
      ),
      updatedAt: storedPaymentTransaction.updatedAt,
      gatewaySessionId: storedPaymentTransaction.gatewaySessionId
        ? storedPaymentTransaction.gatewaySessionId
        : undefined,
    });
  }

  async list(
    params: PaginatedPaymentFilterCriteria
  ): Promise<PaymentTransaction[]> {
    const { limit, offset, status } = params;

    const paymentTransactions =
      await prismaConnection.paymentTransaction.findMany({
        take: limit.getValue(),
        skip: offset.getValue(),
        where: {
          ...(status && { transactionStatus: status.getValue() }),
        },
      });

    return paymentTransactions.map((storedPaymentTransaction) =>
      this.mapStoredTransactionToPaymentTransaction(storedPaymentTransaction)
    );
  }

  async count(params: PaymentFilterCriteria): Promise<NonNegativeInteger> {
    const { status } = params;

    const count = await prismaConnection.paymentTransaction.count({
      where: {
        ...(status && { transactionStatus: status.getValue() }),
      },
    });

    return new NonNegativeInteger(count);
  }

  async exists(params: PaymentSearchOptions): Promise<boolean> {
    const isTransactionId = "transactionId" in params;
    if (isTransactionId) {
      const transactionId = params.transactionId.getValue();
      const count = await prismaConnection.paymentTransaction.count({
        where: { transactionId },
      });
      return count > 0;
    }

    const gatewaySessionId = params.gatewaySessionId;
    const count = await prismaConnection.paymentTransaction.count({
      where: { gatewaySessionId },
    });
    return count > 0;
  }
}
