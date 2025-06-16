export enum visibilityOptions {
  HIDDEN = "HIDDEN",
  VISIBLE = "VISIBLE",
}

const variantVisibilitySet = new Set(
  Object.keys(visibilityOptions) as [keyof typeof visibilityOptions]
);

export class Visibility {
  private readonly value: visibilityOptions;

  constructor(visibility: visibilityOptions) {
    if (!variantVisibilitySet.has(visibility)) {
      throw new Error(`Invalid visibility: ${visibility}`);
    }

    this.value = visibility;
  }

  static clone(visibility: Visibility) {
    return new Visibility(visibility.getValue());
  }

  static create = {
    hidden: () => new Visibility(visibilityOptions.HIDDEN),
    visible: () => new Visibility(visibilityOptions.VISIBLE),
  };

  equals(visibility: Visibility | visibilityOptions): boolean {
    if (visibility instanceof Visibility) {
      return this.value === visibility.getValue();
    }

    return this.value === visibility;
  }

  getValue() {
    return this.value;
  }
}
