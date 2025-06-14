export class InvalidCategoryError extends Error {
  constructor(params: { categoryName: string }) {
    super(`Category with name ${params.categoryName} does not exist`);
  }
}
