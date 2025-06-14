import { z } from "zod";
import { adminConstraints } from "../../domain/adminConstraints.js";
import { Phone } from "../../../shared/domain/phone.js";

export const updatePartialAdminSchema = z
  .object({
    firstName: z
      .string()
      .min(adminConstraints.firstName.minLength)
      .max(adminConstraints.firstName.maxLength),
    lastName: z
      .string()
      .min(adminConstraints.lastName.minLength)
      .max(adminConstraints.lastName.maxLength),
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
