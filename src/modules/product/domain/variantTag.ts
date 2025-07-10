
export class VariantTag {
  static readonly minTagLength: 3;
  static readonly maxTagLength: 50;
  private readonly tag: string;

  constructor(tag: string) {
    this.tag = tag;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    const tag = this.tag;
    const tagLength = tag.length;

    const minimumTagLength = VariantTag.minTagLength;
    if (tagLength < minimumTagLength) {
      throw new Error(
        `Tag cannot have less than ${minimumTagLength} characters`
      );
    }
    const maximumTagLength = VariantTag.maxTagLength;
    if (tagLength > maximumTagLength) {
      throw new Error(
        `Tag cannot have more than ${maximumTagLength} characters`
      );
    }
  }

  getValue() {
    return this.tag;
  }

  static clone(tag: VariantTag) {
    return new VariantTag(tag.getValue());
  }
}
