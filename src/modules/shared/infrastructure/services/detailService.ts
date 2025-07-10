import { CountDetails } from "../../../detail/application/countDetails.js";
import { CreateDetail } from "../../../detail/application/createDetail.js";
import { DeleteDetail } from "../../../detail/application/deleteDetail.js";
import { GetDetail } from "../../../detail/application/getDetail.js";
import { ListDetails } from "../../../detail/application/listDetails.js";
import { UpdateDetail } from "../../../detail/application/updateDetail.js";
import { DetailRepository } from "../../../detail/domain/detailRepository.js";
import { ProductRepository } from "../../../product/domain/productRepository.js";

export interface DetailService {
  createDetail: CreateDetail;
  deleteDetail: DeleteDetail;
  updateDetail: UpdateDetail;
  listDetails: ListDetails;
  getDetail: GetDetail;
  countDetails: CountDetails;
}
export function setupDetailService({
  detailRepository,
  productRepository,
}: {
  detailRepository: DetailRepository;
  productRepository: ProductRepository;
}) {
  return {
    createDetail: new CreateDetail({ detailRepository }),
    deleteDetail: new DeleteDetail({ detailRepository, productRepository }),
    updateDetail: new UpdateDetail({ detailRepository }),
    listDetails: new ListDetails({ detailRepository }),
    getDetail: new GetDetail({ detailRepository }),
    countDetails: new CountDetails({ detailRepository }),
  };
}
