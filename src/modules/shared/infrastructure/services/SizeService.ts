import { ProductRepository } from "../../../product/domain/productRepository.js";
import { CountSizes } from "../../../size/application/countSizes.js";
import { CreateSize } from "../../../size/application/createSize.js";
import { DeleteSize } from "../../../size/application/deleteSize.js";
import { GetSize } from "../../../size/application/getSize.js";
import { ListSizes } from "../../../size/application/listSizes.js";
import { SizeRepository } from "../../../size/domain/sizeRepository.js";
import { SizeValidationService } from "../../../size/infrastructure.ts/sizeValidationService.js";

export interface SizeService {
  list: ListSizes;
  createSize: CreateSize;
  deleteSize: DeleteSize;
  getSize: GetSize;
  countSizes: CountSizes;
}
export function setupSizeService({
  sizeRepository,
  productRepository,
}: {
  sizeRepository: SizeRepository;
  productRepository: ProductRepository;
}) {
  const sizeValidationService = new SizeValidationService({
    productRepository,
  });

  return {
    list: new ListSizes({ sizeRepository }),
    createSize: new CreateSize({ sizeRepository }),
    deleteSize: new DeleteSize({
      sizeRepository,
      sizeValidationService,
    }),
    getSize: new GetSize({ sizeRepository }),
    countSizes: new CountSizes({ sizeRepository }),
  };
}
