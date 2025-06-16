export class OrderCreatorIsRequiredError extends Error {
  constructor() {
    super("Order creator is required");
  }
}
