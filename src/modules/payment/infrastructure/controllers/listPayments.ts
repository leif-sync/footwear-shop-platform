import { Request, Response } from "express";
import { listPaymentsQuerySchema } from "../schemas/listPaymentsQuery.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { ServiceContainer } from "../../../shared/infrastructure/setupDependencies.js";
import { ZodError } from "zod";
import { PrimitivePaymentTransaction } from "../../domain/paymentTransaction.js";
import { PositiveInteger } from "../../../shared/domain/positiveInteger.js";
import { NonNegativeInteger } from "../../../shared/domain/nonNegativeInteger.js";
import { PaymentTransactionStatus } from "../../domain/paymentTransactionStatus.js";

interface SuccessApiResponse {
  payments: PrimitivePaymentTransaction[];
  meta: {
    limit: number;
    offset: number;
    currentTransactionsCount: number;
    storedTransactionsCount: number;
  };
}

interface ErrorApiResponse {
  error: {
    message: string;
    errors?: ZodError["issues"];
  };
}

export async function listPayments(
  req: Request,
  res: Response<SuccessApiResponse | ErrorApiResponse>
) {
  try {
    const result = listPaymentsQuerySchema.parse(req.query);

    const limit = new PositiveInteger(result.limit);
    const offset = new NonNegativeInteger(result.offset);
    const status = result.status
      ? new PaymentTransactionStatus(result.status)
      : undefined;

    const payments = await ServiceContainer.payment.listPaymentTransactions.run(
      {
        limit,
        offset,
        status,
      }
    );

    const storedTransactionsCount =
      await ServiceContainer.payment.countPaymentTransactions.run({ status });

    res.status(HTTP_STATUS.OK).json({
      meta: {
        limit: limit.getValue(),
        offset: offset.getValue(),
        currentTransactionsCount: payments.length,
        storedTransactionsCount: storedTransactionsCount.getValue(),
      },
      payments,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: {
          message: "Invalid request",
          errors: error.issues,
        },
      });
      return;
    }

    throw error;
  }
}
