import {
  OrderPaymentStatus,
  OrderPaymentStatusOptions,
} from "./orderPaymentStatus.js";

const isPresentPaymentAtByStatus = new Map([
  [OrderPaymentStatusOptions.EXPIRED, false],
  [OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY, false],
  [OrderPaymentStatusOptions.PAID, true],
  [OrderPaymentStatusOptions.PENDING, false],
  [OrderPaymentStatusOptions.REFUNDED, true],
]);

export interface PrimitiveOrderPaymentInfo {
  paymentStatus: OrderPaymentStatusOptions;
  paymentDeadline: Date;
  paymentAt: Date | null;
}

export class OrderPaymentInfo {
  private paymentStatus: OrderPaymentStatus;
  private readonly paymentDeadline: Date;
  private paymentAt: Date | null;

  constructor(params: {
    paymentStatus: OrderPaymentStatus;
    paymentDeadline: Date;
    paymentAt: Date | null;
  }) {
    this.paymentStatus = OrderPaymentStatus.clone(params.paymentStatus);
    this.paymentDeadline = new Date(params.paymentDeadline);
    this.paymentAt = params.paymentAt ? new Date(params.paymentAt) : null;

    // * como el paymentStatus viene de la db es posible que no sea valido ya que el
    // * paymentDeadline podría haber vencido cuando el status era PENDING por lo
    // * cual hacemos la transformación a EXPIRED
    const isPending =
      this.paymentStatus.equals(OrderPaymentStatus.create.pending()) ||
      this.paymentStatus.equals(OrderPaymentStatus.create.inPaymentGateway());

    const isExpired = this.paymentDeadline < new Date();

    if (isPending && isExpired) {
      this.paymentStatus = OrderPaymentStatus.create.expired();
    }

    const paymentStatusValue = this.paymentStatus.getValue();
    const paymentPresenceStatus =
      isPresentPaymentAtByStatus.get(paymentStatusValue);

    if (paymentPresenceStatus === undefined) {
      throw new Error(
        `Invalid payment status: ${paymentStatusValue}. Expected one of: ${Array.from(
          isPresentPaymentAtByStatus.keys()
        ).join(", ")}`
      );
    }

    const isPresentPaymentAt = Boolean(this.paymentAt);

    if (paymentPresenceStatus !== isPresentPaymentAt) {
      throw new Error(
        `Payment status ${paymentStatusValue} requires paymentAt to be ${
          paymentPresenceStatus ? "present" : "absent"
        }, but it is ${isPresentPaymentAt ? "present" : "absent"}`
      );
    }
  }

  static clone(paymentInfo: OrderPaymentInfo): OrderPaymentInfo {
    return new OrderPaymentInfo({
      paymentStatus: paymentInfo.paymentStatus,
      paymentDeadline: paymentInfo.paymentDeadline,
      paymentAt: paymentInfo.paymentAt,
    });
  }

  clone(): OrderPaymentInfo {
    return OrderPaymentInfo.clone(this);
  }

  isPaid() {
    return this.paymentStatus.equals(OrderPaymentStatus.create.paid());
  }

  isExpired() {
    return this.paymentStatus.equals(OrderPaymentStatus.create.expired());
  }

  getPaymentStatus(): OrderPaymentStatus {
    return this.paymentStatus;
  }

  getPaymentDeadline(): Date {
    return new Date(this.paymentDeadline);
  }

  getPaymentAt(): Date | null {
    return this.paymentAt;
  }

  toPrimitives(): PrimitiveOrderPaymentInfo {
    return {
      paymentStatus: this.paymentStatus.getValue(),
      paymentDeadline: this.paymentDeadline,
      paymentAt: this.paymentAt,
    };
  }

  static fromPrimitives(
    primitive: PrimitiveOrderPaymentInfo
  ): OrderPaymentInfo {
    return new OrderPaymentInfo({
      paymentStatus: OrderPaymentStatus.from(primitive.paymentStatus),
      paymentDeadline: new Date(primitive.paymentDeadline),
      paymentAt: primitive.paymentAt ? new Date(primitive.paymentAt) : null,
    });
  }

  static from(data: PrimitiveOrderPaymentInfo): OrderPaymentInfo {
    return OrderPaymentInfo.fromPrimitives(data);
  }
}
