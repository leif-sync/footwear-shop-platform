import { Request, Response } from "express";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { CannotUpdateOrderError } from "../../domain/errors/cannotUpdateOrderError.js";
import { OrderNotFoundError } from "../../domain/errors/orderNotFoundError.js";
import { updatePartialOrderSchema } from "../schemas/orderSchemas.js";
import { z, ZodError } from "zod";

const idSchema = z.string().uuid();

export async function updatePartialOrder(
  req: Request<{ orderId: string }>,
  res: Response
) {
  try {
    const orderId = idSchema.parse(req.params.orderId);
    const { customer, paymentInfo, shippingAddress, orderStatus } =
      updatePartialOrderSchema.parse(req.body);

    await ServiceContainer.order.updatePartialOrder.run({
      orderId,
      customer,
      paymentInfo,
      shippingAddress,
      orderStatus,
    });

    res.status(HTTP_STATUS.NO_CONTENT).end();
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
        errors: error.message,
      });
      return;
    }

    if (error instanceof CannotUpdateOrderError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Cannot update order",
        errors: error.message,
      });
      return;
    }

    throw error;
  }
}
