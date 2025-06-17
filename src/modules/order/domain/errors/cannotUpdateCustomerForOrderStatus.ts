import { OrderStatus, OrderStatusOptions } from "../orderStatus.js";

export class CannotUpdateCustomerForOrderStatusError extends Error {
  constructor(params: { orderStatus: OrderStatus | OrderStatusOptions }) {
    const orderStatus =
      params.orderStatus instanceof OrderStatus
        ? params.orderStatus.getValue()
        : params.orderStatus;

    super(`Cannot update customer for order status "${orderStatus}".`);
  }
}
