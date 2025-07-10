import { CategoryRepository } from "../../../category/domain/categoryRepository.js";
import { DetailRepository } from "../../../detail/domain/detailRepository.js";
import { OrderRepository } from "../../../order/domain/orderRepository.js";
import { AddImageToVariant } from "../../../product/application/addImageToVariant.js";
import { AddVariantToProduct } from "../../../product/application/addVariantToProduct.js";
import { CountTotalProducts } from "../../../product/application/countTotalProducts.js";
import { CreateProduct } from "../../../product/application/createProduct.js";
import { DeleteImageFromVariant } from "../../../product/application/deleteImageFromVariant.js";
import { DeleteProduct } from "../../../product/application/deleteProduct.js";
import { DeleteVariant } from "../../../product/application/deleteVariant.js";
import { GetProduct } from "../../../product/application/getProduct.js";
import { ListProducts } from "../../../product/application/listProducts.js";
import { UpdatePartialProduct } from "../../../product/application/updatePartialProduct.js";
import { UpdatePartialVariant } from "../../../product/application/updatePartialVariant.js";
import { ImageStorageEngine } from "../../../product/domain/imageStorageEngine.js";
import { ProductRepository } from "../../../product/domain/productRepository.js";
import { ProductValidationService } from "../../../product/domain/productValidationService.js";
import { ProductAssociatedDataProvider } from "../../../product/infrastructure/productAssociatedDataProvider.js";
import { SizeRepository } from "../../../size/domain/sizeRepository.js";
import { TagRepository } from "../../../tag/domain/tagRepository.js";

export interface ProductService {
  list: ListProducts;
  createProduct: CreateProduct;
  getProduct: GetProduct;
  updatePartialProduct: UpdatePartialProduct;
  updatePartialVariant: UpdatePartialVariant;
  addVariantToProduct: AddVariantToProduct;
  addImageToVariant: AddImageToVariant;
  deleteImageFromVariant: DeleteImageFromVariant;
  deleteProduct: DeleteProduct;
  deleteVariant: DeleteVariant;
  countTotalProducts: CountTotalProducts;
}

export function setupProductService(params: {
  productRepository: ProductRepository;
  imageUploader: ImageStorageEngine;
  categoryRepository: CategoryRepository;
  detailRepository: DetailRepository;
  sizeRepository: SizeRepository;
  tagRepository: TagRepository;
  orderRepository: OrderRepository;
}): ProductService {
  const {
    productRepository,
    imageUploader,
    categoryRepository,
    detailRepository,
    orderRepository,
    sizeRepository,
    tagRepository,
  } = params;

  const productAssociatedDataProvider = new ProductAssociatedDataProvider({
    categoryRepository,
    detailRepository,
    sizeRepository,
    tagRepository,
    orderRepository,
  });

  const productValidationService = new ProductValidationService({
    productAssociatedDataProvider: productAssociatedDataProvider,
  });

  return {
    list: new ListProducts({ productRepository }),
    createProduct: new CreateProduct({
      productRepository,
      imageUploader,
      productValidationService,
    }),
    getProduct: new GetProduct({ productRepository }),
    updatePartialProduct: new UpdatePartialProduct({
      productRepository,
      productValidationService,
    }),
    updatePartialVariant: new UpdatePartialVariant({
      productRepository,
      productValidationService,
    }),
    addVariantToProduct: new AddVariantToProduct({
      productRepository,
      imageUploader,
      productValidationService,
    }),
    addImageToVariant: new AddImageToVariant({
      productRepository,
      imageUploader,
    }),
    deleteImageFromVariant: new DeleteImageFromVariant({
      productRepository,
      imageUploader,
    }),
    deleteProduct: new DeleteProduct({
      productRepository,
      productAssociatedDataProvider,
    }),
    deleteVariant: new DeleteVariant({
      productRepository,
      productAssociatedDataProvider,
    }),
    countTotalProducts: new CountTotalProducts({ productRepository }),
  };
}
