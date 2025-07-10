import { Request, Response } from "express";
import { ServiceContainer } from "../../../shared/infrastructure/setupDependencies.js";
import { z, ZodError } from "zod";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { OrderNotFoundError } from "../../domain/errors/orderNotFoundError.js";
import { UUID } from "../../../shared/domain/UUID.js";

const idSchema = z.string().uuid();

export async function getOrderById(
  req: Request<{
    orderId: string;
  }>,
  res: Response
) {
  try {
    const orderId = new UUID(idSchema.parse(req.params.orderId));

    const order = await ServiceContainer.order.getOrder.run({
      orderId,
    });

    res.status(HTTP_STATUS.OK).json({ order });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid request",
        errors: error.issues,
      });
      return;
    }

    if (error instanceof OrderNotFoundError) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Order not found",
        errors: [error.message],
      });
      return;
    }

    throw error;
  }
}
