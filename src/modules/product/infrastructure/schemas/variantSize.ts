import { z } from "zod";

import { variantConstraint } from "../../domain/variantConstraints.js";

export const variantSizeSchema = z.object({
  sizeValue: z.number().positive().int(),
  stock: z.number().positive().int().max(variantConstraint.size.maxStock),
});
