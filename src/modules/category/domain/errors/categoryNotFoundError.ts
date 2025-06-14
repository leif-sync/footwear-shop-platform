import { UUID } from "../../../shared/domain/UUID.js";

export class CategoryNotFoundError extends Error {
  constructor(params: { categoryName: string });
  constructor(params: { categoryId: string | UUID });
  constructor(params: { categoryName?: string; categoryId?: string | UUID }) {
    const { categoryName, categoryId } = params;
    if (categoryName) super(`Category with name ${categoryName} not found`);
    else if (categoryId) {
      const id =
        categoryId instanceof UUID ? categoryId.getValue() : categoryId;
      super(`Category with id ${id} not found`);
    } else throw new TypeError("Invalid params");
  }
}
