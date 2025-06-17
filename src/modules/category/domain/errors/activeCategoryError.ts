import { CategoryName } from "../categoryName.js";

export class ActiveCategoryError extends Error {
  constructor(params: { categoryName: string | CategoryName }) {
    const categoryName =
      params.categoryName instanceof CategoryName
        ? params.categoryName.getValue()
        : params.categoryName;

    super(
      `Category "${categoryName}" is currently in use and cannot be deleted.`
    );
  }
}
