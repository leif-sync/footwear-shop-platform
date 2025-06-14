import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { CategoryRepository } from "../domain/categoryRepository.js";

export class ListCategories {
  private readonly categoryRepository: CategoryRepository;

  constructor(params: { categoryRepository: CategoryRepository }) {
    this.categoryRepository = params.categoryRepository;
  }

  async run(params: { limit: number; offset: number }) {
    const limit = new PositiveInteger(params.limit);
    const offset = new NonNegativeInteger(params.offset);
    const categories = await this.categoryRepository.list({
      limit,
      offset,
    });
    return categories.map((category) => category.toPrimitives());
  }
}
