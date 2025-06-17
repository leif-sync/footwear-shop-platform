export class CategoryNameError extends Error {
  constructor(params: { minLength: number });
  constructor(params: { maxLength: number });

  constructor(params: { minLength: number } | { maxLength: number }) {
    if ("minLength" in params) {
      super(`Category name must be at least ${params.minLength} characters`);
      return;
    }
    super(`Category name cannot exceed ${params.maxLength} characters`);
  }
}

export class CategoryName {
  static readonly MAX_LENGTH = 100;
  static readonly MIN_LENGTH = 1;

  private readonly name: string;

  constructor(name: string) {
    if (name.length > CategoryName.MAX_LENGTH) {
      throw new Error(
        `Category name cannot exceed ${CategoryName.MAX_LENGTH} characters`
      );
    }
    if (name.length < CategoryName.MIN_LENGTH) {
      throw new Error(
        `Category name must be at least ${CategoryName.MIN_LENGTH} characters`
      );
    }
    this.name = name;
  }

  static clone(categoryName: CategoryName): CategoryName {
    return new CategoryName(categoryName.name);
  }

  getValue(): string {
    return this.name;
  }

  equals(other: CategoryName | string): boolean {
    const valueToCompare =
      other instanceof CategoryName ? other.getValue() : other;
    return this.name === valueToCompare;
  }
}
