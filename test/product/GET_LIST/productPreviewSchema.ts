import { z } from "zod";
import { productPriceSchema } from "../../../src/modules/product/infrastructure/schemas/productPrice";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility";
import { visibilitySchema } from "../../../src/modules/product/infrastructure/schemas/visibility";

export const publicVariantPreviewSchema = z.object({
  variantId: z.string().uuid(),
  hexColor: z.string().regex(/^#[A-F0-9]{6}$/),
  image: z.object({
    imageUrl: z.string().url(),
    imageAlt: z.string(),
  }),
  visibility: z.literal(visibilityOptions.VISIBLE),
});

export const publicProductPreviewSchema = z.object({
  productId: z.string().uuid(),
  name: z.string(),
  price: productPriceSchema,
  visibility: z.literal(visibilityOptions.VISIBLE),
  variants: z.array(publicVariantPreviewSchema),
});

export const variantPreviewSchemaForAdmin = publicVariantPreviewSchema
  .omit({
    visibility: true,
  })
  .extend({
    visibility: visibilitySchema,
  });

export const productPreviewSchemaForAdmin = publicProductPreviewSchema
  .omit({
    visibility: true,
    variants: true,
  })
  .extend({
    visibility: visibilitySchema,
    variants: z.array(variantPreviewSchemaForAdmin),
  });
