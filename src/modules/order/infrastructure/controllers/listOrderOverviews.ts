import { Request, Response } from "express";
import { requestOptionsSchema } from "../schemas/requestOptions.js";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { ZodError } from "zod";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import {
  OrderPaymentStatus,
  OrderPaymentStatusOptions,
} from "../../domain/orderPaymentStatus.js";
import { PositiveInteger } from "../../../shared/domain/positiveInteger.js";
import { NonNegativeInteger } from "../../../shared/domain/nonNegativeInteger.js";
import { OrderStatus } from "../../domain/orderStatus.js";
import { Email } from "../../../shared/domain/email.js";
import { PrimitiveOrderOverview } from "../../domain/orderOverview.js";

type SuccessApiResponse = {
  orders: PrimitiveOrderOverview[];
  meta: {
    limit: number;
    offset: number;
    currentOrdersCount: number;
    storedOrdersCount: number;
  };
};

type ErrorApiResponse = {
  error: {
    message: string;
    errors?: ZodError["issues"];
  };
};

export async function listOrderOverviews(
  req: Request,
  res: Response<SuccessApiResponse | ErrorApiResponse>
) {
  try {
    const MAX_LIMIT = 100;
    const result = requestOptionsSchema.parse(req.query);
    const { paymentStatus: paymentCondition, showOrdersInPaymentProcess } =
      result;

    const validLimit = Math.min(result.limit, MAX_LIMIT);

    const paymentConditionValue =
      paymentCondition ?? Object.values(OrderPaymentStatusOptions);

    const theClientRequiresOrdersInPaymentProcess = paymentCondition?.some(
      (status) => status === OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY
    );

    const paymentStatusToSearch =
      showOrdersInPaymentProcess || theClientRequiresOrdersInPaymentProcess
        ? paymentConditionValue
        : paymentConditionValue.filter(
            (status) => status !== OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY
          );

    const limit = new PositiveInteger(validLimit);
    const offset = new NonNegativeInteger(result.offset);
    const orderStatus = result.orderStatus
      ? result.orderStatus.map((status) => new OrderStatus(status))
      : undefined;

    const paymentStatus = paymentStatusToSearch.map(
      (status) => new OrderPaymentStatus(status)
    );

    const customerEmail = result.customerEmail
      ? result.customerEmail.map((email) => new Email(email))
      : undefined;

    const orders = await ServiceContainer.order.listOrderOverviews.run({
      limit,
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
        offset: offset.getValue(),
        currentOrdersCount: orders.length,
        storedOrdersCount: storedOrdersCount.getValue(),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: {
          message: "Invalid request",
          errors: error.issues,
        },
      });
      return;
    }

    throw error;
  }
}
