import { createOrder } from "./createOrder.js";
import { getOrderById } from "./getOrderById.js";
import { listOrderOverviews } from "./listOrderOverviews.js";
import { updatePartialOrder } from "./updatePartialOrder.js";

export const OrderController = {
  createOrder,
  listOrderOverviews,
  getOrderById,
  updatePartialOrder
};
