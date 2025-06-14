import { z } from "zod";

import { variantConstraint } from "../../domain/variantConstraints.js";

export const variantDetailSchema = z.object({
  title: z
    .string()
    .min(variantConstraint.detail.title.minTitleLength)
    .max(variantConstraint.detail.title.maxTitleLength),
  content: z
    .string()
    .min(variantConstraint.detail.content.minContentLength)
    .max(variantConstraint.detail.content.maxContentLength),
});
