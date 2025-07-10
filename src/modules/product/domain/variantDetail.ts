
export interface PrimitiveVariantDetail {
  title: string;
  content: string;
}

export class VariantDetail {
  static readonly minTitleLength: 3;
  static readonly maxTitleLength: 50;
  static readonly minContentLength: 3;
  static readonly maxContentLength: 150;

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

    if (title.length < VariantDetail.minTitleLength || title.length > VariantDetail.maxTitleLength) {
      throw new Error(
        `Title length must be between ${VariantDetail.minTitleLength} and ${VariantDetail.maxTitleLength}`
      );
    }

    if (
      content.length < VariantDetail.minContentLength ||
      content.length > VariantDetail.maxContentLength
    ) {
      throw new Error(
        `Content length must be between ${VariantDetail.minContentLength} and ${VariantDetail.maxContentLength}`
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

  toPrimitives(): PrimitiveVariantDetail {
    return {
      title: this.title,
      content: this.content,
    };
  }
}
