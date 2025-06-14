import {
  OrderPaymentStatus,
  orderPaymentStatusOptions,
} from "./orderPaymentStatus.js";

const isPresentPaymentAtByStatus = new Map<string, boolean>([
  [orderPaymentStatusOptions.EXPIRED, false],
  [orderPaymentStatusOptions.IN_PAYMENT_GATEWAY, false],
  [orderPaymentStatusOptions.PAID, true],
  [orderPaymentStatusOptions.PENDING, false],
  [orderPaymentStatusOptions.REFUNDED, true],
]);

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
    // copias profundas en el constructor
    return new OrderPaymentInfo({
      paymentStatus: paymentInfo.paymentStatus,
      paymentDeadline: paymentInfo.paymentDeadline,
      paymentAt: paymentInfo.paymentAt,
    });
  }

  isPaid() {
    return this.paymentStatus.equals(OrderPaymentStatus.create.paid());
  }

  isExpired() {
    return this.paymentStatus.equals(OrderPaymentStatus.create.expired());
  }

  getPaymentStatus() {
    return this.paymentStatus.getValue();
  }

  getPaymentDeadline() {
    return new Date(this.paymentDeadline);
  }

  setPaymentStatus(status: OrderPaymentStatus) {
    this.paymentStatus = OrderPaymentStatus.clone(status);
  }

  setPaymentAt(date: Date) {
    this.paymentAt = new Date(date);
  }

  getPaymentAt() {
    return this.paymentAt;
  }

  toPrimitives() {
    return {
      paymentStatus: this.paymentStatus.getValue(),
      paymentDeadline: this.paymentDeadline,
      paymentAt: this.paymentAt,
    };
  }
}
