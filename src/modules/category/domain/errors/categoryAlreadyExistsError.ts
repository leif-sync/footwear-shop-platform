import { CategoryName } from "../categoryName.js";

export class CategoryAlreadyExistsError extends Error {
  constructor(params: { categoryName: CategoryName }) {
    const name =
      params.categoryName instanceof CategoryName
        ? params.categoryName.getValue()
        : params.categoryName;

    super(`Category with name ${name} already exists`);
  }
}
