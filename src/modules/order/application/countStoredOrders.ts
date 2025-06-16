import { Email } from "../../shared/domain/email.js";
import {
  OrderPaymentStatus,
  orderPaymentStatusOptions,
} from "../domain/orderPaymentStatus.js";
import { OrderRepository } from "../domain/orderRepository.js";
import { OrderStatus, orderStatusOptions } from "../domain/orderStatus.js";

export class CountStoredOrders {
  private orderRepository: OrderRepository;

  constructor(params: { orderRepository: OrderRepository }) {
    this.orderRepository = params.orderRepository;
  }


  async run(params: {
    orderStatus?: orderStatusOptions | orderStatusOptions[];
    paymentStatus?: orderPaymentStatusOptions | orderPaymentStatusOptions[];
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
