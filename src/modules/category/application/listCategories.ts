import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { CategoryRepository } from "../domain/categoryRepository.js";

export class ListCategories {
  private readonly categoryRepository: CategoryRepository;

  constructor(params: { categoryRepository: CategoryRepository }) {
    this.categoryRepository = params.categoryRepository;
  }

  /**
   * Lists categories with pagination.
   * @param params.limit - The maximum number of categories to return. positive integer.
   * @param params.offset - The number of categories to skip before starting to collect the result set. non-negative integer.
   * @returns - A promise that resolves to an array of category details.
   */
  async run(params: { limit: PositiveInteger; offset: NonNegativeInteger }) {
    const { limit, offset } = params;
    const categories = await this.categoryRepository.list({
      limit,
      offset,
    });
    return categories.map((category) => category.toPrimitives());
  }
}
