import { CountCategories } from "../../../category/application/countCategories.js";
import { CreateCategory } from "../../../category/application/createCategory.js";
import { DeleteCategory } from "../../../category/application/deleteCategory.js";
import { GetCategory } from "../../../category/application/getCategory.js";
import { ListCategories } from "../../../category/application/listCategories.js";
import { CategoryRepository } from "../../../category/domain/categoryRepository.js";
import { AssociatedDataProvider as CategoryAssociatedDataProvider } from "../../../category/infrastructure/associatedDataProvider.js";
import { ProductRepository } from "../../../product/domain/productRepository.js";

export interface CategoryService {
  createCategory: CreateCategory;
  deleteCategory: DeleteCategory;
  getCategory: GetCategory;
  listCategories: ListCategories;
  countCategories: CountCategories;
}

export function setupCategoryService({
  categoryRepository,
  productRepository,
}: {
  categoryRepository: CategoryRepository;
  productRepository: ProductRepository;
}) {
  const categoryAssociatedDataProvider = new CategoryAssociatedDataProvider({
    productRepository,
  });

  return {
    createCategory: new CreateCategory({ categoryRepository }),
    deleteCategory: new DeleteCategory({
      categoryRepository,
      associatedDataProvider: categoryAssociatedDataProvider,
    }),
    getCategory: new GetCategory({ categoryRepository }),
    listCategories: new ListCategories({ categoryRepository }),
    countCategories: new CountCategories({ categoryRepository }),
  };
}
