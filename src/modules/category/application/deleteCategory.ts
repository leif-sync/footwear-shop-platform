import { UUID } from "../../shared/domain/UUID.js";
import { ActiveCategoryError } from "../domain/errors/activeCategoryError.js";
import { CategoryNotFoundError } from "../domain/errors/categoryNotFoundError.js";
import { CategoryRepository } from "../domain/categoryRepository.js";
import { AssociatedDataProvider } from "../domain/associatedDataProvider.js";
import { CategoryName } from "../domain/categoryName.js";

export class DeleteCategory {
  private readonly categoryRepository: CategoryRepository;
  private readonly associatedDataProvider: AssociatedDataProvider;

  constructor(params: {
    categoryRepository: CategoryRepository;
    associatedDataProvider: AssociatedDataProvider;
  }) {
    this.categoryRepository = params.categoryRepository;
    this.associatedDataProvider = params.associatedDataProvider;
  }

  private async deleteById(categoryId: UUID): Promise<void> {
    const category = await this.categoryRepository.find({ categoryId });
    if (!category) throw new CategoryNotFoundError({ categoryId });

    const categoryName = category.getName();

    const isCategoryInUse =
      await this.associatedDataProvider.checkCategoryUsage({
        categoryName,
      });

    if (isCategoryInUse) throw new ActiveCategoryError({ categoryName });

    await this.categoryRepository.delete({ categoryId });
  }

  private async deleteByName(categoryName: CategoryName): Promise<void> {
    const category = await this.categoryRepository.find({ categoryName });
    if (!category)
      throw new CategoryNotFoundError({ categoryName: categoryName });

    const isCategoryInUse =
      await this.associatedDataProvider.checkCategoryUsage({
        categoryName,
      });

    if (isCategoryInUse) throw new ActiveCategoryError({ categoryName });

    await this.categoryRepository.delete({ categoryName });
  }

  /**
   * Deletes a category by its ID or name.
   * @param params - The parameters for deletion.
   * @param params.categoryId - The ID of the category to delete.
   *
   * @throws {CategoryNotFoundError} If the category does not exist.
   * @throws {ActiveCategoryError} If the category is currently in use.
   */
  async run(params: { categoryId: UUID }): Promise<void>;

  /**
   * Deletes a category by its name.
   * @param params - The parameters for deletion.
   * @param params.categoryName - The name of the category to delete.
   *
   * @throws {CategoryNotFoundError} If the category does not exist.
   * @throws {ActiveCategoryError} If the category is currently in use.
   */
  async run(params: { categoryName: CategoryName }): Promise<void>;
  async run(
    params: { categoryName: CategoryName } | { categoryId: UUID }
  ): Promise<void> {
    const isCategoryId = "categoryId" in params;

    if (isCategoryId) {
      return this.deleteById(params.categoryId);
    }

    return this.deleteByName(params.categoryName);
  }
}
