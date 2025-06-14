import { Email } from "../../shared/domain/email.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { OrderPaymentStatus } from "./orderPaymentStatus.js";
import { OrderStatus } from "./orderStatus.js";

export class OrderOverview {
  private readonly orderId: UUID;
  private readonly orderStatus: OrderStatus;
  private readonly customerEmail: Email;
  private readonly totalAmount: PositiveInteger;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;
  private readonly paymentStatus: OrderPaymentStatus;

  constructor(params: {
    orderId: UUID;
    orderStatus: OrderStatus;
    customerEmail: Email;
    totalAmount: PositiveInteger;
    createdAt: Date;
    updatedAt: Date;
    paymentStatus: OrderPaymentStatus;
  }) {
    this.orderId = params.orderId;
    this.orderStatus = params.orderStatus;
    this.customerEmail = params.customerEmail;
    this.totalAmount = params.totalAmount;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.paymentStatus = params.paymentStatus;
  }

  static clone(orderOverview: OrderOverview): OrderOverview {
    return new OrderOverview({
      orderId: UUID.clone(orderOverview.orderId),
      orderStatus: OrderStatus.clone(orderOverview.orderStatus),
      customerEmail: Email.clone(orderOverview.customerEmail),
      totalAmount: PositiveInteger.clone(orderOverview.totalAmount),
      createdAt: orderOverview.createdAt,
      updatedAt: orderOverview.updatedAt,
      paymentStatus: OrderPaymentStatus.clone(orderOverview.paymentStatus),
    });
  }

  getOrderId() {
    return this.orderId.getValue();
  }

  getOrderStatus() {
    return this.orderStatus.getValue();
  }

  getCustomerEmail() {
    return this.customerEmail.getValue();
  }

  getTotalAmount() {
    return this.totalAmount.getValue();
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }

  toPrimitives() {
    return {
      orderId: this.orderId.getValue(),
      orderStatus: this.orderStatus.getValue(),
      customerEmail: this.customerEmail.getValue(),
      totalAmount: this.totalAmount.getValue(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      paymentStatus: this.paymentStatus.getValue(),
    };
  }
}
