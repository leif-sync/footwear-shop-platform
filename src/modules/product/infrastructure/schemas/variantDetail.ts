import { z } from "zod";
import { VariantDetail } from "../../domain/variantDetail.js";

export const variantDetailSchema = z.object({
  title: z
    .string()
    .min(VariantDetail.minTitleLength)
    .max(VariantDetail.maxTitleLength),
  content: z
    .string()
    .min(VariantDetail.minContentLength)
    .max(VariantDetail.maxContentLength),
});
