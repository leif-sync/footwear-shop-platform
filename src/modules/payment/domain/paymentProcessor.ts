export enum PaymentProcessorOptions {
  WEBPAY = "WEBPAY",
}

export class PaymentProcessorError extends Error {
  constructor(params: { invalidPaymentProcessor: string }) {
    super(`Invalid payment processor: ${params.invalidPaymentProcessor}`);
    this.name = "PaymentProcessorError";
  }
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

  static from(value: string): PaymentProcessor {
    if (
      !Object.values(PaymentProcessorOptions).includes(
        value as PaymentProcessorOptions
      )
    ) {
      throw new Error(`Invalid payment processor: ${value}`);
    }
    return new PaymentProcessor(value as PaymentProcessorOptions);
  }
}
