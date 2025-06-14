import { createWebpayPlusPaymentGatewayLink } from "./createWebpayPlusPaymentGatewayLink.js";
import { getPaymentTransactionById } from "./getPaymentTransactionById.js";
import { listPayments } from "./listPayments.js";
import { processWebpayPlusPaymentGateway } from "./processWebpayPlusPaymentGateway.js";

export const PaymentController = {
  listPayments,
  createWebpayPlusPaymentGatewayLink,
  processWebpayPlusPaymentGateway,
  getPaymentTransactionById,
};
