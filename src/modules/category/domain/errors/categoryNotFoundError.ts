import { UUID } from "../../../shared/domain/UUID.js";
import { CategoryName } from "../categoryName.js";

export class CategoryNotFoundError extends Error {
  constructor(params: { categoryName: CategoryName | string });
  constructor(params: { categoryId: string | UUID });
  constructor(
    params:
      | { categoryName: CategoryName | string }
      | { categoryId?: string | UUID }
  ) {
    const isCategoryName = "categoryName" in params;

    if (isCategoryName) {
      const categoryName =
        params.categoryName instanceof CategoryName
          ? params.categoryName.getValue()
          : params.categoryName;

      super(`Category with name ${categoryName} not found`);
      return;
    }
    
    const categoryId =
      params.categoryId instanceof UUID
        ? params.categoryId.getValue()
        : params.categoryId;

    super(`Category with ID ${categoryId} not found`);
  }
}
