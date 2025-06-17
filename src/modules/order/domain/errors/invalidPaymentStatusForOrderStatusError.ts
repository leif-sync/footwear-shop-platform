import {
  OrderPaymentStatus,
  OrderPaymentStatusOptions,
} from "../orderPaymentStatus.js";
import { OrderStatus, OrderStatusOptions } from "../orderStatus.js";

export class InvalidPaymentStatusForOrderStatusError extends Error {
  constructor(params: {
    orderStatus: OrderStatus | OrderStatusOptions;
    paymentStatus: OrderPaymentStatus | OrderPaymentStatusOptions;
  }) {
    const orderStatus =
      params.orderStatus instanceof OrderStatus
        ? params.orderStatus.getValue()
        : params.orderStatus;

    const paymentStatus =
      params.paymentStatus instanceof OrderPaymentStatus
        ? params.paymentStatus.getValue()
        : params.paymentStatus;

    super(
      `Invalid payment status "${paymentStatus}" for order status "${orderStatus}"`
    );
  }
}
