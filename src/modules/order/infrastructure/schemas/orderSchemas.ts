import { z, ZodIssueCode } from "zod";
import { regions, CountryData } from "../../domain/countryData.js";
import { Phone } from "../../../shared/domain/phone.js";
import { orderStatusOptions } from "../../domain/orderStatus.js";
import { orderPaymentStatusOptions } from "../../domain/orderPaymentStatus.js";

//TODO: unificar con las constraints de la entidad de dominio
const customerConstraints = {
  firstName: {
    maxLength: 255,
    minLength: 3,
  },
  lastName: {
    maxLength: 255,
    minLength: 3,
  },
};

const customerSchema = z.object({
  firstName: z
    .string()
    .min(customerConstraints.firstName.minLength)
    .max(customerConstraints.firstName.maxLength),
  lastName: z
    .string()
    .min(customerConstraints.lastName.minLength)
    .max(customerConstraints.lastName.maxLength),
  email: z.string().email(),
  phone: z.string().superRefine((value, ctx) => {
    try {
      new Phone(value);
    } catch {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: "Invalid phone number",
      });
    }
  }),
});

const shippingAddressSchema = z
  .object({
    region: z.enum(regions),
    commune: z.string(),
    streetName: z.string(),
    streetNumber: z.string(),
    additionalInfo: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const { region, commune } = data;
    const regionFound = CountryData.regions.find((r) => r.name === region);

    if (!regionFound) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Region not found",
      });
      return;
    }

    const isValidCommune = regionFound.communes.some((c) => c === commune);
    if (!isValidCommune) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Commune not found in region",
      });
    }
  });

const orderVariantSizeSchema = z.object({
  quantity: z.number().int().positive(),
  sizeValue: z.number().int().positive(),
});

const orderVariantSchema = z.object({
  variantId: z.string().uuid(),
  variantSizes: z
    .array(orderVariantSizeSchema)
    .nonempty()
    .superRefine((sizesList, ctx) => {
      const variantSizeSet = new Set<number>();

      sizesList.forEach((variantSize) => {
        const isDuplicate = variantSizeSet.has(variantSize.sizeValue);
        if (!isDuplicate) return variantSizeSet.add(variantSize.sizeValue);
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: "Duplicate size value found",
        });
      });
    }),
});

const orderProductSchema = z.object({
  productId: z.string().uuid(),
  productVariants: z
    .array(orderVariantSchema)
    .nonempty()
    .superRefine((variantsList, ctx) => {
      const variantSet = new Set<string>();

      variantsList.forEach((variant) => {
        const isDuplicate = variantSet.has(variant.variantId);
        if (!isDuplicate) return variantSet.add(variant.variantId);
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: "Duplicate variant ID found",
        });
      });
    }),
});

const paymentInfoSchema = z.object({
  paymentDeadline: z.coerce.date(),
  paymentStatus: z.nativeEnum(orderPaymentStatusOptions),
  paymentAt: z.coerce.date().nullable(),
});

const orderStatusSchema = z.nativeEnum(orderStatusOptions);

export const createOrderSchema = z.object({
  customer: customerSchema,
  shippingAddress: shippingAddressSchema,
  orderProducts: z
    .array(orderProductSchema)
    .nonempty()
    .superRefine((productsList, ctx) => {
      const productSet = new Set<string>();

      productsList.forEach((product) => {
        const isDuplicate = productSet.has(product.productId);
        if (!isDuplicate) return productSet.add(product.productId);
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: "Duplicate product ID found",
        });
      });
    }),
});

export type createOrderForUserSchemaType = z.infer<typeof createOrderSchema>;
export type createOrderForAdminSchemaType = z.infer<
  typeof createOrderForAdminSchema
>;

export const createOrderForAdminSchema = createOrderSchema.extend({
  orderStatus: orderStatusSchema,
  paymentInfo: paymentInfoSchema,
});

export const updatePartialOrderSchema = z
  .object({
    customer: customerSchema,
    shippingAddress: shippingAddressSchema,
    paymentInfo: paymentInfoSchema,
    orderStatus: orderStatusSchema,
  })
  .partial();
