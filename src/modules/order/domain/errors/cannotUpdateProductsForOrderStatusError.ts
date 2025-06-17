import { OrderStatus, OrderStatusOptions } from "../orderStatus.js";

export class CannotUpdateProductsForOrderStatusError extends Error {
  constructor(params: { orderStatus: OrderStatus | OrderStatusOptions }) {
    const orderStatus =
      params.orderStatus instanceof OrderStatus
        ? params.orderStatus.getValue()
        : params.orderStatus;

    super(`Cannot update products for order status "${orderStatus}".`);
  }
}
