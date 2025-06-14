import { z } from "zod";
import { variantDetailSchema } from "./variantDetail.js";
import { variantSizeSchema } from "./variantSize.js";
import { variantConstraint } from "../../domain/variantConstraints.js";
import { hexPattern } from "../../../shared/domain/hexColor.js";
import { visibilitySchema } from "./visibility.js";

const imageFieldConstraint = {
  minImageFieldLength: 1,
  maxImageFieldLength: 50,
} as const;

const variantSizesSchema = z
  .array(variantSizeSchema)
  .nonempty()
  .superRefine((sizes, ctx) => {
    const sizeSet = new Set<number>();
    sizes.forEach((size) => {
      if (!sizeSet.has(size.sizeValue)) return sizeSet.add(size.sizeValue);
      ctx.addIssue({
        path: ["sizes"],
        code: "custom",
        message: "There cannot be 2 sizes with the same values",
      });
    });
  });

const variantDetailsSchema = z
  .array(variantDetailSchema)
  .nonempty()
  .superRefine((details, ctx) => {
    const detailSet = new Set<string>();
    details.forEach((detail) => {
      if (!detailSet.has(detail.title)) return detailSet.add(detail.title);
      ctx.addIssue({
        path: ["details"],
        code: "custom",
        message: "There cannot be 2 details with the same titles",
      });
    });
  });

const variantTagsSchema = z
  .array(
    z
      .string()
      .min(variantConstraint.tag.minTagLength)
      .max(variantConstraint.tag.maxTagLength)
  )
  .superRefine((tags, ctx) => {
    const tagsSet = new Set<string>();
    tags.forEach((tag) => {
      if (!tagsSet.has(tag)) return tagsSet.add(tag);
      ctx.addIssue({
        path: ["tags"],
        code: "custom",
        message: "There cannot be 2 tags with the same values",
      });
    });
  });

export const variantSchema = z.object({
  sizes: variantSizesSchema,
  details: variantDetailsSchema,
  tags: variantTagsSchema,
  hexColor: z.string().regex(hexPattern, {
    message: "Color must be a valid hexadecimal value and must start with '#'",
  }),
  imagesField: z
    .string()
    .min(imageFieldConstraint.minImageFieldLength)
    .max(imageFieldConstraint.maxImageFieldLength),
  imagesAlt: z
    .array(
      z
        .string()
        .min(variantConstraint.imageAlt.minImageAltLength)
        .max(variantConstraint.imageAlt.maxImageAltLength)
    )
    .min(variantConstraint.image.minImages)
    .max(variantConstraint.image.maxImages),
  visibility: visibilitySchema,
});

export const updatePartialVariantSchema = variantSchema
  .pick({
    details: true,
    hexColor: true,
    sizes: true,
    tags: true,
    visibility: true,
  })
  .partial();

export type updatePartialVariantSchemaType = z.infer<
  typeof updatePartialVariantSchema
>;

export const createUniqueVariantSchema = variantSchema.omit({
  imagesField: true,
});

export type createUniqueVariantSchemaType = z.infer<
  typeof createUniqueVariantSchema
>;

export const addImageToVariantSchema = z.object({
  imageAlt: z
    .string()
    .min(variantConstraint.imageAlt.minImageAltLength)
    .max(variantConstraint.imageAlt.maxImageAltLength),
});
