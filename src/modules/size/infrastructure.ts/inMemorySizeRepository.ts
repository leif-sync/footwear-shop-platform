import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Size } from "../domain/size.js";
import { SizeRepository } from "../domain/sizeRepository.js";

type findParams = { sizeId?: UUID; sizeValue?: PositiveInteger };
type deleteParams = { sizeId?: UUID; sizeValue?: PositiveInteger };

export class inMemorySizeRepository implements SizeRepository {
  private sizes: Size[] = [];

  async create(params: { size: Size }): Promise<void> {
    this.sizes.push(params.size);
  }

  private async findById(id: UUID): Promise<Size | null> {
    const size = this.sizes.find((size) => id.equals(size.getId()));
    if (!size) return null;
    return Size.clone(size);
  }

  private async findByValue(sizeValue: PositiveInteger): Promise<Size | null> {
    const size = this.sizes.find((size) =>
      sizeValue.equals(size.getSizeValue())
    );
    if (!size) return null;
    return Size.clone(size);
  }

  async find(params: { sizeId: UUID }): Promise<Size | null>;
  async find(params: { sizeValue: PositiveInteger }): Promise<Size | null>;
  async find(params: findParams): Promise<Size | null> {
    const { sizeId, sizeValue } = params;
    if (sizeId) return this.findById(sizeId);
    if (sizeValue) return this.findByValue(sizeValue);
    throw new Error("Invalid params");
  }

  async list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
  }): Promise<Size[]> {
    const { limit, offset } = params;
    const sizes = this.sizes.slice(
      offset.getValue(),
      offset.getValue() + limit.getValue()
    );
    return sizes.map((size) => Size.clone(size));
  }

  async countSizes(): Promise<NonNegativeInteger> {
    return new NonNegativeInteger(this.sizes.length);
  }

  async retrieveSizesByValue(
    sizeValue: PositiveInteger | PositiveInteger[]
  ): Promise<Size[]> {
    const sizeValues = Array.isArray(sizeValue) ? sizeValue : [sizeValue];
    return this.sizes.filter((size) =>
      sizeValues.some((value) => value.equals(size.getSizeValue()))
    );
  }

  private async deleteByValue(sizeValue: PositiveInteger): Promise<void> {
    this.sizes = this.sizes.filter(
      (size) => !sizeValue.equals(size.getSizeValue())
    );
  }

  private async deleteById(id: UUID): Promise<void> {
    this.sizes = this.sizes.filter((size) => !id.equals(size.getId()));
  }

  async delete(params: { sizeId: UUID }): Promise<void>;
  async delete(params: { sizeValue: PositiveInteger }): Promise<void>;
  async delete(params: deleteParams): Promise<void> {
    const { sizeId, sizeValue } = params;
    if (sizeId) return this.deleteById(sizeId);
    if (sizeValue) return this.deleteByValue(sizeValue);
  }
}
