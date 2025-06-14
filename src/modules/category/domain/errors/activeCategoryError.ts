export class ActiveCategoryError extends Error {
  constructor(params: { categoryName: string }) {
    super(`Category ${params.categoryName} is in use`);
  }
}
