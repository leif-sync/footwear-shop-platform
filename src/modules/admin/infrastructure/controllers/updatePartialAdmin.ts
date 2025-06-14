import { Request, Response } from "express";
import { updatePartialAdminSchema } from "../schemas/admin.js";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { z, ZodError } from "zod";
import { AdminNotFoundError } from "../../domain/errors/adminNotFoundError.js";

const uuidSchema = z.string().uuid();

export async function updatePartialAdmin(
  req: Request<{ adminId: string }>,
  res: Response
) {
  try {
    const adminId = uuidSchema.parse(req.params.adminId);

    const { firstName, lastName, phoneNumber } = updatePartialAdminSchema.parse(
      req.body
    );

    ServiceContainer.admin.updatePartialAdmin.run({
      adminId,
      firstName,
      lastName,
      phoneNumber,
    });

    res.status(HTTP_STATUS.OK).json({ message: "Admin updated successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Validation error",
        errors: error.issues,
      });
      return;
    }

    if (error instanceof AdminNotFoundError) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Admin not found",
        errors: [{ message: error.message }],
      });
      return;
    }

    throw error;
  }
}
