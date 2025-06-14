export enum PaymentProcessorOptions {
  WEBPAY = "WEBPAY",
}

export class PaymentProcessor {
  private readonly value: PaymentProcessorOptions;

  constructor(value: PaymentProcessorOptions) {
    this.value = value;
  }

  static clone(paymentProcessor: PaymentProcessor) {
    return new PaymentProcessor(paymentProcessor.getValue());
  }

  static create = {
    WEBPAY: () => new PaymentProcessor(PaymentProcessorOptions.WEBPAY),
  };

  getValue() {
    return this.value;
  }
}
