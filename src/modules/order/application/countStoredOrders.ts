import { Email } from "../../shared/domain/email.js";
import {
  OrderPaymentStatus,
  OrderPaymentStatusOptions,
} from "../domain/orderPaymentStatus.js";
import { OrderRepository } from "../domain/orderRepository.js";
import { OrderStatus, OrderStatusOptions } from "../domain/orderStatus.js";

export class CountStoredOrders {
  private orderRepository: OrderRepository;

  constructor(params: { orderRepository: OrderRepository }) {
    this.orderRepository = params.orderRepository;
  }

  /**
   * Counts the number of stored orders based on the provided filters.
   * @param params - The parameters for counting stored orders.
   * @param params.orderStatus - The status of the orders to count. Can be a single status or an array of statuses.
   * @param params.paymentStatus - The payment status of the orders to count. Can be a single status or an array of statuses.
   * @param params.customerEmail - The email of the customer whose orders to count. Can be a single email or an array of emails.
   * @returns The count of stored orders that match the provided filters.
   */
  async run(params: {
    orderStatus?: OrderStatusOptions | OrderStatusOptions[];
    paymentStatus?: OrderPaymentStatusOptions | OrderPaymentStatusOptions[];
    customerEmail?: string | string[];
  }) {
    const orderStatus = params.orderStatus
      ? Array.isArray(params.orderStatus)
        ? params.orderStatus.map((status) => new OrderStatus(status))
        : new OrderStatus(params.orderStatus)
      : undefined;

    const paymentStatus = params.paymentStatus
      ? Array.isArray(params.paymentStatus)
        ? params.paymentStatus.map((status) => new OrderPaymentStatus(status))
        : new OrderPaymentStatus(params.paymentStatus)
      : undefined;

    const customerEmail = params.customerEmail
      ? Array.isArray(params.customerEmail)
        ? params.customerEmail.map((email) => new Email(email))
        : new Email(params.customerEmail)
      : undefined;

    const storedOrdersCount = await this.orderRepository.countStoredOrders({
      orderStatus,
      paymentStatus,
      customerEmail,
    });

    return storedOrdersCount.getValue();
  }
}
