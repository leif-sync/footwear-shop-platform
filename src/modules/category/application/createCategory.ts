import { UUID } from "../../shared/domain/UUID.js";
import { Category } from "../domain/category.js";
import { CategoryAlreadyExistsError } from "../domain/errors/categoryAlreadyExistsError.js";
import { CategoryRepository } from "../domain/categoryRepository.js";

export class CreateCategory {
  private readonly categoryRepository: CategoryRepository;

  constructor(params: { categoryRepository: CategoryRepository }) {
    this.categoryRepository = params.categoryRepository;
  }

  async run(params: { categoryName: string }) {
    const { categoryName } = params;
    const categoryFound = await this.categoryRepository.find({ categoryName });

    if (categoryFound) {
      throw new CategoryAlreadyExistsError({
        categoryName,
      });
    }

    const category = new Category({
      categoryId: UUID.generateRandomUUID(),
      categoryName: categoryName,
    });

    await this.categoryRepository.create({ category });

    return {
      categoryId: category.getId(),
    }
  }
}
