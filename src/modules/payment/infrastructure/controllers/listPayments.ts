import { Request, Response } from "express";
import { listPaymentsQuerySchema } from "../schemas/listPaymentsQuery.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { ZodError } from "zod";

export async function listPayments(req: Request, res: Response) {
  try {
    const { limit, offset, status } = listPaymentsQuerySchema.parse(req.query);

    const payments = await ServiceContainer.payment.listPaymentTransactions.run(
      {
        limit,
        offset,
        status,
      }
    );

    const currentPaymentsCount =
      await ServiceContainer.payment.countPaymentTransactions.run({ status });

    res.status(HTTP_STATUS.OK).json({
      meta: {
        limit,
        offset,
        currentTransactionsCount: payments.length,
        storedTransactionsCount: currentPaymentsCount,
      },
      payments,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid request",
        errors: error.issues,
      });
      return;
    }

    throw error;
  }
}
