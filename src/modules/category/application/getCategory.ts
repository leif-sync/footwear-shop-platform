import { CategoryNotFoundError } from "../domain/errors/categoryNotFoundError.js";
import { CategoryRepository } from "../domain/categoryRepository.js";

export class GetCategory {
  private categoryRepository: CategoryRepository;

  constructor(params: { categoryRepository: CategoryRepository }) {
    this.categoryRepository = params.categoryRepository;
  }

  /**
   * Retrieves a category by its name.
   * @param params.categoryName - The name of the category to retrieve.
   * @returns - A promise that resolves to the found category's details.
   * @throws {CategoryNotFoundError} If no category with the given name is found.
   */
  async run(params: { categoryName: string }) {
    const { categoryName } = params;
    const category = await this.categoryRepository.find({ categoryName });
    if (!category) throw new CategoryNotFoundError({ categoryName });
    return category.toPrimitives();
  }
}
