import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Size } from "../domain/size.js";
import { SizeAlreadyExistsError } from "../domain/errors/sizeAlreadyExistsError.js";
import { SizeRepository } from "../domain/sizeRepository.js";

export class CreateSize {
  private readonly sizeRepository: SizeRepository;

  constructor(params: { sizeRepository: SizeRepository }) {
    this.sizeRepository = params.sizeRepository;
  }

  async run(params: { sizeValue: number }) {
    const id = UUID.generateRandomUUID();
    const sizeValue = new PositiveInteger(params.sizeValue);
    const size = new Size({ sizeId: id, sizeValue });

    const sizeFound = await this.sizeRepository.find({ sizeValue });
    if (sizeFound)
      throw new SizeAlreadyExistsError({ sizeValue: params.sizeValue });

    await this.sizeRepository.create({ size });
    return {
      sizeId: id.getValue(),
    };
  }
}
