import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { ServiceContainer } from "../../../shared/infrastructure/setupDependencies.js";
import { PaymentTransactionNotFoundError } from "../../domain/errors/paymentTransactionNotFoundError.js";

import { z, ZodError } from "zod";

const idSchema = z.string().uuid();

export async function getPaymentTransactionById(
  req: Request<{
    transactionId: string;
  }>,
  res: Response
) {
  try {
    const transactionId = idSchema.parse(req.params.transactionId);

    const paymentTransaction =
      await ServiceContainer.payment.getPaymentTransaction.run({
        transactionId,
      });

    res.status(HTTP_STATUS.OK).json({ paymentTransaction });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid id",
        errors: error.issues,
      });
      return;
    }

    if (error instanceof PaymentTransactionNotFoundError) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: error.message,
      });
      return;
    }

    throw error;
  }
}
