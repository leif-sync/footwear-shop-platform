export enum CurrencyOptions {
  CLP = "CLP",
}

export class CurrencyError extends Error {
  constructor(params: { invalidCurrency: string }) {
    super(`Invalid currency: ${params.invalidCurrency}`);
  }
}

export class Currency {
  private readonly value: CurrencyOptions;

  constructor(value: CurrencyOptions) {
    this.value = value;
  }

  static clone(currency: Currency) {
    return new Currency(currency.getValue());
  }

  static from(data: string) {
    const currency = Object.values(CurrencyOptions).find(
      (option) => option === data.toUpperCase()
    );

    if (!currency) throw new CurrencyError({ invalidCurrency: data });

    return new Currency(currency);
  }

  static create = {
    CLP: () => new Currency(CurrencyOptions.CLP),
  };

  getValue() {
    return this.value;
  }
}
