import { z } from "zod";
import { visibilityOptions } from "../../domain/visibility.js";

export const visibilitySchema = z.enum(
  Object.values(visibilityOptions) as [visibilityOptions]
);
