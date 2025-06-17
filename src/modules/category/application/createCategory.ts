import { UUID } from "../../shared/domain/UUID.js";
import { Category } from "../domain/category.js";
import { CategoryAlreadyExistsError } from "../domain/errors/categoryAlreadyExistsError.js";
import { CategoryRepository } from "../domain/categoryRepository.js";
import { CategoryName } from "../domain/categoryName.js";

/**
 * Use case for creating a new category.
 * This class encapsulates the logic for creating a category in the repository.
 */
export class CreateCategory {
  private readonly categoryRepository: CategoryRepository;

  constructor(params: { categoryRepository: CategoryRepository }) {
    this.categoryRepository = params.categoryRepository;
  }

  /**
   * Creates a new category with the given name.
   * @param params.categoryName - The name of the category to create.
   * @returns - A promise that resolves to the created category's ID.
   * @throws {CategoryAlreadyExistsError} If a category with the same name already exists.
   */
  async run(params: { categoryName: CategoryName }) {
    const { categoryName } = params;
    const categoryFound = await this.categoryRepository.find({ categoryName });

    if (categoryFound) {
      throw new CategoryAlreadyExistsError({
        categoryName,
      });
    }

    const category = new Category({
      categoryId: UUID.generateRandomUUID(),
      categoryName,
    });

    await this.categoryRepository.create({ category });

    return {
      categoryId: category.getId(),
    };
  }
}
