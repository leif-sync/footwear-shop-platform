export class DetailInUseError extends Error {
  constructor(params: { detailName: string }) {
    super(`Detail with name ${params.detailName} is in use`);
  }
}
