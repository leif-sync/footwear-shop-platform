import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { ActiveSizeError } from "../domain/errors/activeSizeError.js";
import { SizeNotFoundError } from "../domain/errors/sizeNotFoundError.js";
import { SizeRepository } from "../domain/sizeRepository.js";
import { SizeValidationService } from "../domain/sizeValidationService.js";

export class DeleteSize {
  private readonly sizeRepository: SizeRepository;
  private readonly sizeValidationService: SizeValidationService;

  constructor(params: {
    sizeRepository: SizeRepository;
    sizeValidationService: SizeValidationService;
  }) {
    this.sizeRepository = params.sizeRepository;
    this.sizeValidationService = params.sizeValidationService;
  }

  private async deleteSizeBySizeId(id: string) {
    const sizeId = new UUID(id);

    const sizeFound = await this.sizeRepository.find({ sizeId });
    if (!sizeFound) throw new SizeNotFoundError({ sizeId: id });

    const sizeValue = new PositiveInteger(sizeFound.getSizeValue());
    const isSizeInUsage = await this.sizeValidationService.checkSizeUsage({
      sizeValue,
    });
    if (isSizeInUsage) {
      throw new ActiveSizeError({ sizeValue: sizeFound.getSizeValue() });
    }

    await this.sizeRepository.delete({ sizeId });
  }

  private async deleteSizeBySizeValue(sizeValue: number) {
    const sizeValueObj = new PositiveInteger(sizeValue);

    const sizeFound = await this.sizeRepository.find({
      sizeValue: sizeValueObj,
    });
    if (!sizeFound) throw new SizeNotFoundError({ sizeValue });

    const isSizeInUsage = await this.sizeValidationService.checkSizeUsage({
      sizeValue: sizeValueObj,
    });
    if (isSizeInUsage) throw new ActiveSizeError({ sizeValue });

    await this.sizeRepository.delete({ sizeValue: sizeValueObj });
  }

  async run(params: { sizeValue: number }): Promise<void>;
  async run(params: { sizeId: string }): Promise<void>;
  async run(params: { sizeValue?: number; sizeId?: string }) {
    const { sizeValue, sizeId } = params;
    if (sizeValue) return this.deleteSizeBySizeValue(sizeValue);
    if (sizeId) return this.deleteSizeBySizeId(sizeId);
  }
}
