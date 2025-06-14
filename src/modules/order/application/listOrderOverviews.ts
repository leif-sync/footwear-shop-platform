import { Email } from "../../shared/domain/email.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import {
  OrderPaymentStatus,
  orderPaymentStatusOptions,
} from "../domain/orderPaymentStatus.js";
import { OrderRepository } from "../domain/orderRepository.js";
import { OrderStatus, orderStatusOptions } from "../domain/orderStatus.js";

export class ListOrderOverviews {
  private readonly orderRepository: OrderRepository;

  constructor(params: { orderRepository: OrderRepository }) {
    this.orderRepository = params.orderRepository;
  }

  async run(params: {
    limit: number;
    offset: number;
    orderStatus?: orderStatusOptions | orderStatusOptions[];
    paymentStatus?: orderPaymentStatusOptions | orderPaymentStatusOptions[];
    customerEmail?: string | string[];
  }) {

    const limit = new PositiveInteger(params.limit);
    const offset = new NonNegativeInteger(params.offset);

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

    const orders = await this.orderRepository.listOrderOverviews({
      limit,
      offset,
      orderStatus,
      paymentStatus,
      customerEmail,
    });

    return orders.map((order) => order.toPrimitives());
  }
}
