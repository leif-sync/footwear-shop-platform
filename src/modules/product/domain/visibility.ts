export enum visibilityOptions {
  HIDDEN = "HIDDEN",
  VISIBLE = "VISIBLE",
}

export class VisibilityError extends Error {
  constructor(params: { invalidVisibility: string }) {
    const { invalidVisibility } = params;
    super(`Invalid visibility: ${invalidVisibility}`);
  }
}

export class Visibility {
  private readonly value: visibilityOptions;

  constructor(visibility: visibilityOptions) {
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

  static from(visibility: string): Visibility {
    const validVisibilities = Object.values(visibilityOptions);
    const isVisibilityValid = validVisibilities.includes(
      visibility as visibilityOptions
    );
    if (!isVisibilityValid) {
      throw new VisibilityError({ invalidVisibility: visibility });
    }
    return new Visibility(visibility as visibilityOptions);
  }

  getValue() {
    return this.value;
  }
}
