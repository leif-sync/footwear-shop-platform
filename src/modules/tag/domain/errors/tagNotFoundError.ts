export class TagNotFoundError extends Error {
  constructor(params: { tagId: string });
  constructor(params: { tagName: string });
  constructor(params: { tagName?: string; tagId?: string }) {
    const { tagName, tagId } = params;
    if (tagName) super(`Tag with name ${tagName} not found`);
    else if (tagId) super(`Tag with id ${tagId} not found`);
    else throw new Error("Tag name or id must be provided");
  }
}
