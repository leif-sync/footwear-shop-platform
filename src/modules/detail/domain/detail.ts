import { UUID } from "../../shared/domain/UUID.js";

export class Detail {
  private readonly detailId: UUID;
  private readonly detailName: string;

  constructor(params: { detailId: UUID; detailName: string }) {
    this.detailId = params.detailId;
    this.detailName = params.detailName;
    this.ensureIsValid();
  }

  static clone(detail: Detail): Detail {
    return new Detail({
      detailId: new UUID(detail.getId()),
      detailName: detail.getTitle(),
    });
  }

  private ensureIsValid() {
    if (this.detailName.length < 1) throw new Error("Title is required");
  }

  getId(): string {
    return this.detailId.getValue();
  }

  getTitle(): string {
    return this.detailName;
  }

  toPrimitives() {
    return {
      detailId: this.detailId.getValue(),
      detailName: this.getTitle()
    }
  }
}
