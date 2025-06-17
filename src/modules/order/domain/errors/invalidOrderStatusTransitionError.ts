import { OrderStatus, OrderStatusOptions } from "../orderStatus.js";

export class InvalidOrderStatusTransitionError extends Error {
  constructor(params: {
    fromStatus: OrderStatus | OrderStatusOptions;
    toStatus: OrderStatus | OrderStatusOptions;
  }) {
    const fromStatus =
      params.fromStatus instanceof OrderStatus
        ? params.fromStatus.getValue()
        : params.fromStatus;

    const toStatus =
      params.toStatus instanceof OrderStatus
        ? params.toStatus.getValue()
        : params.toStatus;

    super(
      `Invalid order status transition from "${fromStatus}" to "${toStatus}"`
    );
  }
}
