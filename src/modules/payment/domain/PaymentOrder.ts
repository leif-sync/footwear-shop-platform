import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { UUID } from "../../shared/domain/UUID.js";

export class PaymentOrder {
  private readonly orderId: UUID;
  private readonly finalAmount: NonNegativeInteger;
  private readonly isPaid: boolean;
  private readonly paymentDeadline: Date;

  constructor(params: {
    orderId: UUID;
    finalAmount: NonNegativeInteger;
    isPaid: boolean;
    paymentDeadline: Date;
  }) {
    this.orderId = UUID.clone(params.orderId);
    this.finalAmount = NonNegativeInteger.clone(params.finalAmount);
    this.isPaid = params.isPaid;
    this.paymentDeadline = new Date(params.paymentDeadline.getTime());
  }

  getOrderId(): UUID {
    return UUID.clone(this.orderId);
  }

  getFinalAmount(): NonNegativeInteger {
    return NonNegativeInteger.clone(this.finalAmount);
  }

  isPaymentExpired(): boolean {
    return new Date() > this.paymentDeadline;
  }

  getPaymentDeadline(): Date {
    return new Date(this.paymentDeadline.getTime());
  }

  isOrderPaid(): boolean {
    return this.isPaid;
  }
}
