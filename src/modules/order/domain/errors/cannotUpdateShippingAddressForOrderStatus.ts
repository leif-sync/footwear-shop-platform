import { OrderStatus, OrderStatusOptions } from "../orderStatus.js";

export class CannotUpdateShippingForOrderStatusError extends Error {
  constructor(params: { orderStatus: OrderStatus | OrderStatusOptions }) {
    const orderStatus =
      params.orderStatus instanceof OrderStatus
        ? params.orderStatus.getValue()
        : params.orderStatus;

    super(`Cannot update shipping address for order status "${orderStatus}"`);
  }
}
