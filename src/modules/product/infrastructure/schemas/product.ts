import { z } from "zod";
import { productPriceSchema } from "./productPrice.js";
import { variantSchema } from "./variant.js";
import { productConstraint } from "../../domain/productConstraints.js";
import { visibilitySchema } from "./visibility.js";

const productCategoriesSchema = z
  .array(
    z
      .string()
      .min(productConstraint.category.minCategoryLength)
      .max(productConstraint.category.maxCategoryLength)
  )
  .nonempty()
  .superRefine((categories, ctx) => {
    const categorySet = new Set<string>();
    categories.forEach((category) => {
      if (!categorySet.has(category)) return categorySet.add(category);
      ctx.addIssue({
        path: ["categories"],
        code: "custom",
        message: "There cannot be 2 categories with the same values",
      });
    });
  });

export const productSchema = z.object({
  productName: z
    .string({ message: "The product name is required" })
    .min(productConstraint.name.minProductNameLength)
    .max(productConstraint.name.maxProductNameLength),
  productDescription: z
    .string()
    .min(productConstraint.description.minProductDescriptionLength)
    .max(productConstraint.description.maxProductDescriptionLength),
  productCategories: productCategoriesSchema,
  price: productPriceSchema,
  visibility: visibilitySchema,
  variants: z
    .array(variantSchema)
    .min(productConstraint.variants.minVariants)
    .max(productConstraint.variants.maxVariants),
});

export const updatePartialProductSchema = productSchema
  .pick({
    price: true,
    productCategories: true,
    productDescription: true,
    productName: true,
    visibility: true,
  })
  .partial();
