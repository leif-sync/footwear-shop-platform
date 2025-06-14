import { ZodError } from "zod";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { InvalidProductError } from "../../domain/errors/invalidProductError.js";
import { InvalidVariantError } from "../../domain/errors/invalidVariantError.js";
import { NotEnoughStockError } from "../../domain/errors/notEnoughStockError.js";
import { SizeNotAvailableForVariantError } from "../../domain/errors/sizeNotAvailableForVariantError.js";
import { Request, Response } from "express";
import {
  createOrderForAdminSchema,
  createOrderSchema,
} from "../schemas/orderSchemas.js";
import { InvalidCreatorError } from "../../domain/errors/invalidCreatorError.js";

function handleError(error: unknown, res: Response) {
  if (error instanceof ZodError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid request",
      errors: error.issues,
    });
    return;
  }

  if (error instanceof InvalidProductError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid product",
      errors: [error.message],
    });
    return;
  }

  if (error instanceof InvalidVariantError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid variant",
      errors: [error.message],
    });
    return;
  }

  if (error instanceof SizeNotAvailableForVariantError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Size not available for variant",
      errors: [error.message],
    });
    return;
  }

  if (error instanceof NotEnoughStockError) {
    res.status(HTTP_STATUS.CONFLICT).json({
      message: "Not enough stock",
      errors: [error.message],
    });
    return;
  }

  if (error instanceof InvalidCreatorError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid creator",
      errors: [error.message],
    });
    return;
  }

  throw error;
}

export async function createOrder(req: Request, res: Response) {
  if (req.admin) {
    await createOrderForAdmin({
      request: req,
      response: res,
      adminId: req.admin.adminId,
    });
    return;
  }

  try {
    // * se utiliza strict para diferenciar entre el esquema de admin y el de cliente
    const order = createOrderSchema
      .strict(
        "Some fields were sent additionally or those fields need authentication"
      )
      .parse(req.body); 
    const { customer, shippingAddress, orderProducts } = order;

    const { orderId } = await ServiceContainer.order.createOrder.run({
      customer,
      shippingAddress,
      orderProducts,
    });

    res.status(HTTP_STATUS.CREATED).json({
      message: "Order created",
      order: {
        orderId,
      },
    });
    return;
  } catch (error) {
    handleError(error, res);
  }
}

async function createOrderForAdmin(params: {
  request: Request;
  response: Response;
  adminId: string;
}) {
  const { request: req, response: res, adminId } = params;
  try {
    const order = createOrderForAdminSchema.parse(req.body);
    const {
      customer,
      shippingAddress,
      orderProducts,
      orderStatus,
      paymentInfo,
    } = order;

    const creatorDetails = {
      creatorId: adminId,
    };

    const { orderId } = await ServiceContainer.order.createOrder.run({
      customer,
      shippingAddress,
      orderProducts,
      creatorDetails,
      orderStatus,
      paymentInfo,
    });

    res.status(HTTP_STATUS.CREATED).json({
      message: "Order created",
      order: {
        orderId,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
}
