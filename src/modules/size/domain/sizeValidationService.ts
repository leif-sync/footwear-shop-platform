import { PositiveInteger } from "../../shared/domain/positiveInteger.js";

export abstract class SizeValidationService {
  abstract checkSizeUsage(params: {
    sizeValue: PositiveInteger;
  }): Promise<boolean>;
}
