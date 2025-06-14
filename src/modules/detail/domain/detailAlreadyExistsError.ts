export class DetailAlreadyExistsError extends Error {
  constructor(params: { detailName: string }) {
    super(`Detail with name ${params.detailName} already exists`);
  }
}
