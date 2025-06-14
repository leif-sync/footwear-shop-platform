const IVA_RATE = 0.19;
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";

export abstract class IvaCalculator {

  constructor() {
  }

  static calculateIva(params: {
    amount: NonNegativeInteger;
  }): NonNegativeInteger {
    const { amount } = params;

    if (amount.getValue() === 0) return new NonNegativeInteger(0);

    const iva = amount.getValue() * IVA_RATE;
    return new NonNegativeInteger(Math.round(iva));
  }
}
