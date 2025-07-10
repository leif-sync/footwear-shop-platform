import { ProductRepository } from "../../../product/domain/productRepository.js";
import { CountTags } from "../../../tag/application/countTags.js";
import { CreateTag } from "../../../tag/application/createTag.js";
import { DeleteTag } from "../../../tag/application/deleteTag.js";
import { GetTag } from "../../../tag/application/getTag.js";
import { ListTags } from "../../../tag/application/listTags.js";
import { TagRepository } from "../../../tag/domain/tagRepository.js";
import { TagValidationService } from "../../../tag/infrastructure/validationService.js";

export interface TagService {
  createTag: CreateTag;
  listTags: ListTags;
  getTag: GetTag;
  deleteTag: DeleteTag;
  countTags: CountTags;
}

export function setupTagService({
  tagRepository,
  productRepository,
}: {
  tagRepository: TagRepository;
  productRepository: ProductRepository;
}) {
  const tagValidationService = new TagValidationService({ productRepository });

  return {
    createTag: new CreateTag({ tagRepository }),
    listTags: new ListTags({ tagRepository }),
    getTag: new GetTag({ tagRepository }),
    deleteTag: new DeleteTag({ tagRepository, tagValidationService }),
    countTags: new CountTags({ tagRepository }),
  };
}
