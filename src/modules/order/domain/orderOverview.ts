import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import {
  OrderPaymentStatus,
  OrderPaymentStatusOptions,
} from "./orderPaymentStatus.js";
import { OrderStatus, OrderStatusOptions } from "./orderStatus.js";

export interface PrimitiveOrderOverview {
  orderId: string;
  orderStatus: OrderStatusOptions;
  customerEmail: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  paymentStatus: OrderPaymentStatusOptions;
}

export class OrderOverview {
  private readonly orderId: UUID;
  private readonly orderStatus: OrderStatus;
  private readonly customerEmail: EmailAddress;
  private readonly totalAmount: NonNegativeInteger;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;
  private readonly paymentStatus: OrderPaymentStatus;

  constructor(params: {
    orderId: UUID;
    orderStatus: OrderStatus;
    customerEmail: EmailAddress;
    totalAmount: NonNegativeInteger;
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
      customerEmail: EmailAddress.clone(orderOverview.customerEmail),
      totalAmount: NonNegativeInteger.clone(orderOverview.totalAmount),
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

  toPrimitives(): PrimitiveOrderOverview {
    return {
      orderId: this.orderId.getValue(),
      orderStatus: this.orderStatus.getValue(),
      customerEmail: this.customerEmail.getValue(),
      totalAmount: this.totalAmount.getValue(),
      createdAt: new Date(this.createdAt),
      updatedAt: new Date(this.updatedAt),
      paymentStatus: this.paymentStatus.getValue(),
    };
  }
}
