export class CategoryAlreadyExistsError extends Error {
  constructor(params: { categoryName: string }) {
    super(`Category with name ${params.categoryName} already exists`);
  }
}
