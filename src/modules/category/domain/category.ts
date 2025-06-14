import { UUID } from "../../shared/domain/UUID.js";

export class Category {
  private readonly categoryId: UUID;
  private readonly categoryName: string;

  constructor(params: { categoryId: UUID; categoryName: string }) {
    if (params.categoryName.length === 0)
      throw new Error("categoryName cannot be empty");

    this.categoryId = params.categoryId;
    this.categoryName = params.categoryName;
  }

  static clone(category: Category): Category {
    return new Category({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
    });
  }

  getId() {
    return this.categoryId.getValue();
  }

  getName() {
    return this.categoryName;
  }

  toPrimitives() {
    return {
      categoryId: this.categoryId.getValue(),
      categoryName: this.categoryName,
    };
  }
}
