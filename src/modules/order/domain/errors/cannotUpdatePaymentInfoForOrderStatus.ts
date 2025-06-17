import { OrderStatus, OrderStatusOptions } from "../orderStatus.js";

export class CannotUpdatePaymentInfoForOrderStatusError extends Error {
  constructor(params: { orderStatus: OrderStatus | OrderStatusOptions }) {
    const orderStatus =
      params.orderStatus instanceof OrderStatus
        ? params.orderStatus.getValue()
        : params.orderStatus;

    super(
      `Cannot update payment information for order status "${orderStatus}".`
    );
  }
}
