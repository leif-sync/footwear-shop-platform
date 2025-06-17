export class DetailTitle {
  static readonly MAX_LENGTH = 100;
  static readonly MIN_LENGTH = 1;

  private readonly detailTitle: string;

  constructor(detailTitle: string) {
    this.detailTitle = detailTitle;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.detailTitle.length < DetailTitle.MIN_LENGTH)
      throw new Error(
        `Detail title must be at least ${DetailTitle.MIN_LENGTH} characters long`
      );
    if (this.detailTitle.length > DetailTitle.MAX_LENGTH)
      throw new Error(
        `Detail title must be at most ${DetailTitle.MAX_LENGTH} characters long`
      );
  }

  static clone(detailTitle: DetailTitle): DetailTitle {
    return new DetailTitle(detailTitle.getValue());
  }

  clone(): DetailTitle {
    return DetailTitle.clone(this);
  }

  getValue(): string {
    return this.detailTitle;
  }

  equals(other: DetailTitle | string): boolean {
    const toCompare = other instanceof DetailTitle ? other.getValue() : other;
    return this.detailTitle === toCompare;
  }
}
