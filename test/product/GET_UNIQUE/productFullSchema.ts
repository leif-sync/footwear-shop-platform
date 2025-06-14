import { z } from "zod";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility";
import { productPriceSchema } from "../../../src/modules/product/infrastructure/schemas/productPrice";
import { visibilitySchema } from "../../../src/modules/product/infrastructure/schemas/visibility";
const publicVariantFullSchema = z.object({
  variantId: z.string().uuid(),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  images: z.array(
    z.object({
      imageUrl: z.string().url(),
      imageAlt: z.string(),
    })
  ),
  details: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    })
  ),
  sizes: z.array(
    z.object({
      sizeValue: z.number().int().nonnegative(),
      stock: z.number().positive().int(),
    })
  ),
  tags: z.array(z.string()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  visibility: z.literal(visibilityOptions.VISIBLE),
});

export const publicProductFullSchema = z.object({
  productId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: productPriceSchema,
  categories: z.array(z.string()),
  visibility: z.literal(visibilityOptions.VISIBLE),
  variants: z.array(publicVariantFullSchema),
});

export const adminVariantFullSchema = publicVariantFullSchema
  .omit({ visibility: true })
  .extend({
    visibility: visibilitySchema,
  });

export const adminProductFullSchema = publicProductFullSchema
  .omit({ visibility: true, variants: true })
  .extend({
    visibility: visibilitySchema,
    variants: z.array(adminVariantFullSchema),
  });
