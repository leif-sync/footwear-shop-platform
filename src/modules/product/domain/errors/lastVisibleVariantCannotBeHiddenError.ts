export class LastVisibleVariantCannotBeHiddenError extends Error {
  constructor() {
    super("The last visible variant cannot be hidden");
  }
}
