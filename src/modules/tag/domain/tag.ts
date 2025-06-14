import { UUID } from "../../shared/domain/UUID.js";

export class Tag {
  private readonly tagName: string;
  private readonly tagId: UUID;
  private readonly minNameLength = 1;

  constructor(params: { tagName: string; tagId: UUID }) {
    if (params.tagName.length < this.minNameLength)
      throw new Error(
        `Name must be at least ${this.minNameLength} characters long`
      );

    this.tagName = params.tagName;
    this.tagId = params.tagId;
  }

  static clone(tag: Tag): Tag {
    return new Tag({ tagName: tag.getName(), tagId: tag.tagId });
  }

  getName() {
    return this.tagName;
  }

  getId() {
    return this.tagId.getValue();
  }

  toPrimitives() {
    return {
      tagId: this.tagId.getValue(),
      tagName: this.tagName,
    };
  }
}
