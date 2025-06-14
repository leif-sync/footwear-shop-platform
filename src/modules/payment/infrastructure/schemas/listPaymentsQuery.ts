import { z } from "zod";
import { PaymentTransactionStatusOptions } from "../../domain/paymentTransactionStatus.js";

const MAX_LIMIT = 100;

export const listPaymentsQuerySchema = z.object({
  limit: z.coerce.number().positive().int().max(MAX_LIMIT),
  offset: z.coerce.number().nonnegative().int().optional().default(0),
  status: z.nativeEnum(PaymentTransactionStatusOptions).optional(),
});
