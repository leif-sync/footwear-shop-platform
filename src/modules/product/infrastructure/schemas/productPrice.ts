import { z } from "zod";
import { DiscountOptions } from "../../domain/discountType.js";

const priceConstraints = {
  // minDiscountStartDate: new Date("2025-01-01"),
  discountTypeValues: Object.values(DiscountOptions) as [
    keyof typeof DiscountOptions,
  ],
} as const;

type productPrice =
  | {
      baseValue: number;
      discountType: keyof typeof DiscountOptions;
      discountValue: number;
      discountStartAt: Date;
      discountEndAt: Date;
    }
  | {
      baseValue: number;
      discountType: keyof typeof DiscountOptions;
      discountValue: 0;
      discountStartAt: null;
      discountEndAt: null;
    };

function validateProductPrice(
  productPrice: productPrice,
  ctx: z.RefinementCtx
) {
  const {
    baseValue,
    discountType,
    discountValue,
    discountStartAt,
    discountEndAt,
  } = productPrice;

  if (!discountStartAt && !discountEndAt) return;

  if (discountEndAt < discountStartAt) {
    ctx.addIssue({
      path: ["discountEndDate"],
      message: "The discount end date cannot be earlier than the start date",
      code: "invalid_date",
    });
  }
  // if (discountStartAt < priceConstraints.minDiscountStartDate) {
  //   ctx.addIssue({
  //     path: ["discountStartDate"],
  //     message: `The discount start date cannot be before ${priceConstraints.minDiscountStartDate.toLocaleDateString()}`,
  //     code: "invalid_date",
  //   });
  // }
  if (discountType === DiscountOptions.FIXED && discountValue > baseValue) {
    ctx.addIssue({
      path: ["discountValue"],
      message: "The discount value cannot be greater than the product value",
      code: "too_big",
      maximum: baseValue,
      inclusive: true,
      type: "number",
    });
  }
  if (discountType === DiscountOptions.PERCENT && discountValue > 100) {
    ctx.addIssue({
      path: ["discountValue"],
      message: "The discount value cannot be greater than 100%",
      code: "too_big",
      maximum: 100,
      inclusive: true,
      type: "number",
    });
  }
}

export const productPriceSchema = z
  .object({
    baseValue: z.number().positive().int(),
    discountType: z.enum(priceConstraints.discountTypeValues),
    discountValue: z.number().positive().int(),
    discountStartAt: z.preprocess((value, ctx) => {
      if (value !== null) return value;
      ctx.addIssue({ code: "invalid_date", path: ["discountStartAt"] });
    }, z.coerce.date()),
    discountEndAt: z.preprocess((value, ctx) => {
      if (value !== null) return value;
      ctx.addIssue({ code: "invalid_date", path: ["discountEndAt"] });
    }, z.coerce.date()),
  })
  .or(
    z.object({
      baseValue: z.number().positive().int(),
      discountType: z.literal(DiscountOptions.NONE),
      discountValue: z.literal(0),
      discountStartAt: z.null(),
      discountEndAt: z.null(),
    })
  )
  .superRefine(validateProductPrice);
