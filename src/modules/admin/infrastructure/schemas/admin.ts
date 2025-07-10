import { z } from "zod";
import { Phone } from "../../../shared/domain/phone.js";
import { AdminFirstName } from "../../domain/adminFirstName.js";
import { AdminLastName } from "../../domain/adminLastName.js";

export const updatePartialAdminSchema = z
  .object({
    firstName: z
      .string()
      .min(AdminFirstName.minLength)
      .max(AdminFirstName.maxLength),
    lastName: z
      .string()
      .min(AdminLastName.minLength)
      .max(AdminLastName.maxLength),
    phoneNumber: z.string().superRefine((value, ctx) => {
      try {
        new Phone(value);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid phone number",
        });
      }
    }),
  })
  .partial();
