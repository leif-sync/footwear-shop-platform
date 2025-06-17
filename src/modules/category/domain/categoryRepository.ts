import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Category } from "./category.js";
import { CategoryName } from "./categoryName.js";

export abstract class CategoryRepository {
  abstract create(params: { category: Category }): Promise<void>;

  abstract list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
  }): Promise<Category[]>;

  abstract countCategories(): Promise<NonNegativeInteger>;

  abstract retrieveCategoriesByName(
    categoryName: CategoryName | CategoryName[]
  ): Promise<Category[]>;

  abstract find(params: {
    categoryName: CategoryName;
  }): Promise<Category | null>;
  abstract find(params: { categoryId: UUID }): Promise<Category | null>;

  abstract delete(params: { categoryId: UUID }): Promise<void>;
  abstract delete(params: { categoryName: CategoryName }): Promise<void>;
}
