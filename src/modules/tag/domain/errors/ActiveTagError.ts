export class ActiveTagError extends Error {
  constructor(params: { tagName: string }) {
    super(`Tag with name ${params.tagName} is in use`);
  }
}
