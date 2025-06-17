import { UUID } from "../../shared/domain/UUID.js";
import { CategoryName } from "./categoryName.js";

export interface PrimitiveCategory {
  categoryId: string;
  categoryName: string;
}

export class Category {
  private readonly categoryId: UUID;
  private readonly categoryName: CategoryName;

  constructor(params: { categoryId: UUID; categoryName: CategoryName }) {
    this.categoryId = params.categoryId;
    this.categoryName = params.categoryName;
  }

  static clone(category: Category): Category {
    return new Category({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
    });
  }

  getId(): UUID {
    return this.categoryId;
  }

  getName(): CategoryName {
    return this.categoryName;
  }

  toPrimitives(): PrimitiveCategory {
    return {
      categoryId: this.categoryId.getValue(),
      categoryName: this.categoryName.getValue(),
    };
  }
}
