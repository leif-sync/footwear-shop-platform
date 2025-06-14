export class AtLeastOneVariantRequiredError extends Error {
  constructor() {
    super("At least one variant is required for the product.");
    this.name = "AtLeastOneVariantRequiredError";
  }
}