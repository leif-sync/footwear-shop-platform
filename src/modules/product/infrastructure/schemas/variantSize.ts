import { z } from "zod";

export const variantSizeSchema = z.object({
  sizeValue: z.number().positive().int(),
  stock: z.number().positive().int(),
});
