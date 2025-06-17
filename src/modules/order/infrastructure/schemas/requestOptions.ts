import { RefinementCtx, z } from "zod";
import { OrderStatusOptions } from "../../domain/orderStatus.js";
import { OrderPaymentStatusOptions } from "../../domain/orderPaymentStatus.js";

function validateUniqueArrayItems(data: string[], ctx: RefinementCtx) {
  const duplicateSet = new Set<string>();
  data.forEach((value) => {
    if (!duplicateSet.has(value)) return duplicateSet.add(value);
    ctx.addIssue({
      code: "custom",
      message: "There cannot be two same values",
    });
  });
}

function transformToArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

const orderStatusOptionsValues = z.enum(
  Object.values(OrderStatusOptions) as [OrderStatusOptions]
);

const paymentStatusOptionsValues = z.enum(
  Object.values(OrderPaymentStatusOptions) as [OrderPaymentStatusOptions]
);

export const requestOptionsSchema = z.object({
  limit: z.coerce.number().int().positive(),
  offset: z.coerce.number().int().nonnegative(),
  orderStatus: z
    .array(orderStatusOptionsValues)
    .superRefine(validateUniqueArrayItems)
    .or(orderStatusOptionsValues)
    .transform(transformToArray)
    .optional(),
  paymentStatus: z
    .array(paymentStatusOptionsValues)
    .superRefine(validateUniqueArrayItems)
    .or(paymentStatusOptionsValues)
    .transform(transformToArray)
    .optional(),
  customerEmail: z
    .array(z.string().email())
    .superRefine(validateUniqueArrayItems)
    .or(z.string().email())
    .transform(transformToArray)
    .optional(),
  showOrdersInPaymentProcess: z.coerce.boolean().default(false),
});
