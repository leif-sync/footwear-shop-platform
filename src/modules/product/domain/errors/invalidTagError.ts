export class InvalidTagError extends Error {
  constructor(params: { tagName: string }) {
    const { tagName } = params;
    super(`Tag with name ${tagName} not found`);
  }
}
