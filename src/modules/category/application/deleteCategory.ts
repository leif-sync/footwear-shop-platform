import { UUID } from "../../shared/domain/UUID.js";
import { ActiveCategoryError } from "../domain/errors/activeCategoryError.js";
import { CategoryNotFoundError } from "../domain/errors/categoryNotFoundError.js";
import { CategoryRepository } from "../domain/categoryRepository.js";
import { CategoryValidationService } from "../domain/categoryValidationService.js";

type deleteParams = { categoryId?: string; categoryName?: string };

export class DeleteCategory {
  private readonly categoryRepository: CategoryRepository;
  private readonly categoryValidationService: CategoryValidationService;

  constructor(params: {
    categoryRepository: CategoryRepository;
    categoryValidationService: CategoryValidationService;
  }) {
    this.categoryRepository = params.categoryRepository;
    this.categoryValidationService = params.categoryValidationService;
  }

  private async deleteById(id: string): Promise<void> {
    const categoryId = new UUID(id);
    const category = await this.categoryRepository.find({ categoryId });
    if (!category) throw new CategoryNotFoundError({ categoryId });

    const categoryName = category.getName();

    const isCategoryInUse =
      await this.categoryValidationService.checkCategoryUsage({
        categoryName,
      });

    if (isCategoryInUse) throw new ActiveCategoryError({ categoryName });

    await this.categoryRepository.delete({ categoryId });
  }

  private async deleteByName(categoryName: string): Promise<void> {
    const category = await this.categoryRepository.find({ categoryName });
    if (!category)
      throw new CategoryNotFoundError({ categoryName: categoryName });

    const isCategoryInUse =
      await this.categoryValidationService.checkCategoryUsage({
        categoryName,
      });

    if (isCategoryInUse) throw new ActiveCategoryError({ categoryName });

    await this.categoryRepository.delete({ categoryName });
  }

  async run(params: { categoryId: string }): Promise<void>;
  async run(params: { categoryName: string }): Promise<void>;
  async run(params: deleteParams): Promise<void> {
    const { categoryId, categoryName } = params;
    if (categoryId) return this.deleteById(categoryId);
    if (categoryName) return this.deleteByName(categoryName);
    throw new TypeError("Invalid params");
  }
}
