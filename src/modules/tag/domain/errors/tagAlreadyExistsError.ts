export class TagAlreadyExistsError extends Error {
  constructor(params: { tagName: string }) {
    super(`Tag with name ${params.tagName} already exists`);
  }
}
