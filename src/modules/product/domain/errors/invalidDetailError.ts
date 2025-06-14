export class InvalidDetailError extends Error {
  constructor(params: { detailName: string }) {
    const { detailName } = params;
    super(`Detail with name ${detailName} not found`);
  }
}