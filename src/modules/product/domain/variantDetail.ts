import { variantConstraint } from "./variantConstraints.js";

export class VariantDetail {
  private readonly title: string;
  private readonly content: string;

  constructor(params: { title: string; content: string }) {
    const { title, content } = params;
    this.title = title;
    this.content = content;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    const { title, content } = this;
    const { maxTitleLength, minTitleLength } = variantConstraint.detail.title;
    const { maxContentLength, minContentLength } =
      variantConstraint.detail.content;

    if (title.length < minTitleLength || title.length > maxTitleLength) {
      throw new Error(
        `Title length must be between ${minTitleLength} and ${maxTitleLength}`
      );
    }

    if (
      content.length < minContentLength ||
      content.length > maxContentLength
    ) {
      throw new Error(
        `Content length must be between ${minContentLength} and ${maxContentLength}`
      );
    }
  }

  static clone(detail: VariantDetail) {
    return new VariantDetail({
      title: detail.getTitle(),
      content: detail.getContent(),
    });
  }

  getTitle() {
    return this.title;
  }

  getContent() {
    return this.content;
  }

  toPrimitives() {
    return {
      title: this.title,
      content: this.content,
    };
  }
}
