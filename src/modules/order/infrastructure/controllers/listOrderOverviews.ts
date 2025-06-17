import { Request, Response } from "express";
import { requestOptionsSchema } from "../schemas/requestOptions.js";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { ZodError } from "zod";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { OrderPaymentStatusOptions } from "../../domain/orderPaymentStatus.js";

export async function listOrderOverviews(
  req: Request<
    any,
    any,
    any,
    {
      limit?: number;
      offset?: number;
    }
  >,
  res: Response
) {
  try {
    const MAX_LIMIT = 100;
    const {
      limit,
      offset,
      orderStatus,
      paymentStatus: paymentCondition,
      customerEmail,
      showOrdersInPaymentProcess,
    } = requestOptionsSchema.parse(req.query);
    const validLimit = Math.min(limit, MAX_LIMIT);

    const paymentConditionValue =
      paymentCondition ?? Object.values(OrderPaymentStatusOptions);

    const theClientRequiresOrdersInPaymentProcess = paymentCondition?.some(
      (status) => status === OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY
    );

    const paymentStatus =
      showOrdersInPaymentProcess || theClientRequiresOrdersInPaymentProcess
        ? paymentConditionValue
        : paymentConditionValue.filter(
            (status) => status !== OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY
          );

    const orders = await ServiceContainer.order.listOrderOverviews.run({
      limit: validLimit,
      offset,
      orderStatus,
      paymentStatus,
      customerEmail,
    });

    const storedOrdersCount =
      await ServiceContainer.order.countStoredOrders.run({
        orderStatus,
        paymentStatus,
        customerEmail,
      });

    res.json({
      orders,
      meta: {
        limit: validLimit,
        offset,
        currentOrdersCount: orders.length,
        storedOrdersCount,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid request",
        errors: error.issues,
      });
      return;
    }

    throw error;
  }
}
