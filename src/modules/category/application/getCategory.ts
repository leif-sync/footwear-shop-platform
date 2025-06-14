import { CategoryNotFoundError } from "../domain/errors/categoryNotFoundError.js";
import { CategoryRepository } from "../domain/categoryRepository.js";

export class GetCategory {
  private categoryRepository: CategoryRepository;

  constructor(params: { categoryRepository: CategoryRepository }) {
    this.categoryRepository = params.categoryRepository;
  }

  async run(params: { categoryName: string }) {
    const { categoryName } = params;
    const category = await this.categoryRepository.find({ categoryName });
    if (!category) throw new CategoryNotFoundError({ categoryName });
    return category.toPrimitives();
  }
}
