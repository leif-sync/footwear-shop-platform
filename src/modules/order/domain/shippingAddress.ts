import { CountryData } from "./countryData.js";

export interface PrimitiveShippingAddress {
  region: string;
  commune: string;
  streetName: string;
  streetNumber: string;
  additionalInfo?: string;
}

export class ShippingAddress {
  private readonly region: string;
  private readonly commune: string;
  private readonly streetName: string;
  private readonly streetNumber: string;
  private readonly additionalInfo?: string;

  constructor(params: {
    region: string;
    commune: string;
    streetName: string;
    streetNumber: string;
    additionalInfo?: string;
  }) {
    this.region = params.region;
    this.commune = params.commune;
    this.streetName = params.streetName;
    this.streetNumber = params.streetNumber;
    this.additionalInfo = params.additionalInfo;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.region.length === 0) throw new Error("Region is required");

    if (this.commune.length === 0) throw new Error("Commune is required");

    if (this.streetName.length === 0)
      throw new Error("Street name is required");

    if (this.streetNumber.length === 0)
      throw new Error("Street number is required");

    if (this.additionalInfo && this.additionalInfo.length === 0)
      throw new Error("Additional info is required");

    const region = CountryData.regions.find(
      (region) => region.name === this.region
    );
    if (!region) throw new Error("Invalid region");

    const commune = region.communes.find((commune) => commune === this.commune);
    if (!commune) throw new Error("Invalid commune");
  }

  static clone(address: ShippingAddress): ShippingAddress {
    return new ShippingAddress({
      region: address.region,
      commune: address.commune,
      streetName: address.streetName,
      streetNumber: address.streetNumber,
      additionalInfo: address.additionalInfo,
    });
  }

  clone(): ShippingAddress {
    return ShippingAddress.clone(this);
  }

  getRegion() {
    return this.region;
  }

  getCommune() {
    return this.commune;
  }

  getStreetName() {
    return this.streetName;
  }

  getStreetNumber() {
    return this.streetNumber;
  }

  getAdditionalInfo() {
    return this.additionalInfo;
  }

  toPrimitives(): PrimitiveShippingAddress {
    return {
      region: this.region,
      commune: this.commune,
      streetName: this.streetName,
      streetNumber: this.streetNumber,
      additionalInfo: this.additionalInfo,
    };
  }
}
