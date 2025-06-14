import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { SizeNotFoundError } from "../domain/errors/sizeNotFoundError.js";
import { SizeRepository } from "../domain/sizeRepository.js";

export class GetSize {
  private readonly sizeRepository: SizeRepository;

  constructor(params: { sizeRepository: SizeRepository }) {
    this.sizeRepository = params.sizeRepository;
  }

  private async getSizeByValue(params: { sizeValue: number }) {
    const sizeValue = new PositiveInteger(params.sizeValue);
    const sizeFound = await this.sizeRepository.find({ sizeValue });
    if (!sizeFound) throw new SizeNotFoundError({ sizeValue });
    return sizeFound.toPrimitives();
  }

  private async getSizeById(params: { sizeId: string }) {
    const sizeId = new UUID(params.sizeId);
    const sizeFound = await this.sizeRepository.find({ sizeId });
    if (!sizeFound) throw new SizeNotFoundError({ sizeId });
    return sizeFound.toPrimitives();
  }

  async run(params: {
    sizeValue: number;
  }): Promise<{ sizeValue: number; sizeId: string }>;
  async run(params: {
    sizeId: string;
  }): Promise<{ sizeValue: number; sizeId: string }>;

  async run(params: { sizeValue?: number; sizeId?: string }): Promise<{
    sizeValue: number;
    sizeId: string;
  }> {
    const { sizeValue, sizeId } = params;
    if (sizeValue) return this.getSizeByValue({ sizeValue });
    if (sizeId) return this.getSizeById({ sizeId });
    throw new Error("Invalid params");
  }
}
