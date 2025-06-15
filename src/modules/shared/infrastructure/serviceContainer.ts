import {
  IMAGE_STORAGE_ENGINE,
  imageStorageOptions,
} from "../../../environmentVariables.js";
import { CreateCategory } from "../../category/application/createCategory.js";
import { DeleteCategory } from "../../category/application/deleteCategory.js";
import { GetCategory } from "../../category/application/getCategory.js";
import { ListCategories } from "../../category/application/listCategories.js";
import { InMemoryCategoryRepository } from "../../category/infrastructure/inMemoryCategoryRepository.js";
import { CreateDetail } from "../../detail/application/createDetail.js";
import { DeleteDetail } from "../../detail/application/deleteDetail.js";
import { ListDetails } from "../../detail/application/listDetails.js";
import { UpdateDetail } from "../../detail/application/updateDetail.js";
import { InMemoryDetailRepository } from "../../detail/infrastructure/inMemoryDetailRepository.js";
import { CreateProduct } from "../../product/application/createProduct.js";
import { GetProduct } from "../../product/application/getProduct.js";
import { ListProducts } from "../../product/application/listProducts.js";
import { ProductValidationService } from "../../product/domain/productValidationService.js";
import { DiskImageUploader } from "../../product/infrastructure/diskImageUploader.js";
import { FakeImageUploader } from "../../product/infrastructure/fakeImageUploader.js";
import { InMemoryProductRepository } from "../../product/infrastructure/inMemoryProductRepository.js";
import { CreateSize } from "../../size/application/createSize.js";
import { DeleteSize } from "../../size/application/deleteSize.js";
import { ListSizes } from "../../size/application/listSizes.js";
import { inMemorySizeRepository } from "../../size/infrastructure.ts/inMemorySizeRepository.js";
import { CreateTag } from "../../tag/application/createTag.js";
import { DeleteTag } from "../../tag/application/deleteTag.js";
import { GetTag } from "../../tag/application/getTag.js";
import { ListTags } from "../../tag/application/listTags.js";
import { InMemoryTagRepository } from "../../tag/infrastructure/inMemoryTagRepository.js";
import { ProductAssociatedDataProvider } from "../../product/infrastructure/productAssociatedDataProvider.js";
import { TagValidationService } from "../../tag/infrastructure/validationService.js";
import { SizeValidationService } from "../../size/infrastructure.ts/sizeValidationService.js";
import { CategoryValidationService } from "../../category/infrastructure/categoryValidationService.js";
import { UpdatePartialProduct } from "../../product/application/updatePartialProduct.js";
import { UpdatePartialVariant } from "../../product/application/updatePartialVariant.js";
import { AddVariantToProduct } from "../../product/application/addVariantToProduct.js";
import { AddImageToVariant } from "../../product/application/addImageToVariant.js";
import { DeleteImageFromVariant } from "../../product/application/deleteImageFromVariant.js";
import { CreateOrder } from "../../order/application/createOrder.js";
import { OrderAssociatedDataProvider } from "../../order/infrastructure/orderAssociatedDataProvider.js";
import { FakeOrderTransactionManager } from "../../order/infrastructure/fakeOrderTransactionManager.js";
import { InMemoryOrderRepository } from "../../order/infrastructure/inMemoryOrderRepository.js";
import { FakeEmailSender } from "../../notification/infrastructure.ts/fakeEmailSender.js";
import { ListOrderOverviews } from "../../order/application/listOrderOverviews.js";
import { GetOrder } from "../../order/application/getOrder.js";
import { OrderRepository } from "../../order/domain/orderRepository.js";
import { PaymentGatewaySuccessHandler } from "../../payment/application/paymentGatewaySuccessHandler.js";
import { PaymentOrderNotifier } from "../../payment/infrastructure/paymentOrderNotifier.js";
import { InMemoryPaymentTransactionRepository } from "../../payment/infrastructure/inMemoryPaymentTransactionRepository.js";
import { PaymentTransactionRepository } from "../../payment/domain/paymentTransactionRepository.js";
import { ListPayments } from "../../payment/application/listPayments.js";
import { GetPaymentTransaction } from "../../payment/application/getPaymentTransaction.js";
import { DeleteOrderAndReleaseProductsStock } from "../../order/application/deleteOrdersAndReleaseProductStock.js";
import { CreateAdmin } from "../../admin/application/createAdmin.js";
import { InMemoryAdminRepository } from "../../admin/infrastructure/inMemoryAdminRepository.js";
import { GetAdmin } from "../../admin/application/getAdmin.js";
import { UpdatePartialAdmin } from "../../admin/application/updatePartialAdmin.js";
import { AdminNotifier } from "../../admin/domain/adminNotifier.js";
import { InMemoryLoginCodeRepository } from "../../auth/infrastructure/inMemoryLoginCodeRepository.js";
import { UpdatePartialOrder } from "../../order/application/updatePartialOrder.js";
import { DeleteProduct } from "../../product/application/deleteProduct.js";
import { DeleteVariant } from "../../product/application/deleteVariant.js";
import { GetSize } from "../../size/application/getSize.js";
import { CountTotalProducts } from "../../product/application/countTotalProducts.js";
import { CountTags } from "../../tag/application/countTags.js";
import { CountSizes } from "../../size/application/countSizes.js";
import { CountCategories } from "../../category/application/countCategories.js";
import { GetDetail } from "../../detail/application/getDetail.js";
import { CountDetails } from "../../detail/application/countDetails.js";
import { CountStoredOrders } from "../../order/application/countStoredOrders.js";
import { InMemoryRefreshTokenRepository } from "../../auth/infrastructure/inMemoryRefreshTokenRepository.js";
import { CountTransactions } from "../../payment/application/countTransactions.js";
import { CreatePaymentTransaction } from "../../payment/application/createPaymentTransaction.js";
import { PaymentAssociatedDataProvider } from "../../payment/infrastructure/paymentAssociatedDataProvider.js";
import { PrepareOrderForPayment } from "../../payment/application/prepareOrderForPayment.js";

// repositories
// ! change to valid repositories
export const productRepository = new InMemoryProductRepository();
const tagRepository = new InMemoryTagRepository();
const sizeRepository = new inMemorySizeRepository();
const categoryRepository = new InMemoryCategoryRepository();
const detailRepository = new InMemoryDetailRepository();
export const orderRepository: OrderRepository = new InMemoryOrderRepository({
  productRepository,
});
export const paymentTransactionRepository: PaymentTransactionRepository =
  new InMemoryPaymentTransactionRepository();
const adminRepository = new InMemoryAdminRepository();
export const loginCodeRepository = new InMemoryLoginCodeRepository();
export const refreshTokenRepository = new InMemoryRefreshTokenRepository();

// services
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

const tagValidationService = new TagValidationService({
  productRepository,
});

const sizeValidationService = new SizeValidationService({
  productRepository,
});

const categoryValidationService = new CategoryValidationService({
  productRepository,
});

const orderAssociatedDataProvider = new OrderAssociatedDataProvider({
  productRepository,
  adminRepository,
});

export const paymentAssociatedDataProvider = new PaymentAssociatedDataProvider({
  orderRepository,
});

// other dependencies

const imgUpl = {
  [imageStorageOptions.DISK]: new DiskImageUploader(),
  [imageStorageOptions.FAKE]: new FakeImageUploader(),
  [imageStorageOptions.CLOUDINARY]: new FakeImageUploader(), // ! change to CloudinaryImageUploader
} as const;

export const imageUploader = imgUpl[IMAGE_STORAGE_ENGINE];

export const emailSender = new FakeEmailSender(); // ! change to a valid email sender
const paymentOrderNotifier = new PaymentOrderNotifier({
  emailSender,
  orderRepository,
});

const adminNotifier = new AdminNotifier({
  emailSender,
});

// ! change to a valid order transaction manager
const orderTransactionManager = new FakeOrderTransactionManager({
  orderAssociatedDataProvider,
  orderRepository,
});

export const ServiceContainer = {
  product: {
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
    countTotalProducts: new CountTotalProducts({
      productRepository,
    }),
  },
  tag: {
    createTag: new CreateTag({ tagRepository }),
    listTags: new ListTags({ tagRepository }),
    getTag: new GetTag({ tagRepository }),
    deleteTag: new DeleteTag({ tagRepository, tagValidationService }),
    countTags: new CountTags({ tagRepository }),
  },
  size: {
    list: new ListSizes({ sizeRepository }),
    createSize: new CreateSize({ sizeRepository }),
    deleteSize: new DeleteSize({
      sizeRepository,
      sizeValidationService,
    }),
    getSize: new GetSize({ sizeRepository }),
    countSizes: new CountSizes({ sizeRepository }),
  },
  category: {
    createCategory: new CreateCategory({ categoryRepository }),
    deleteCategory: new DeleteCategory({
      categoryRepository,
      categoryValidationService,
    }),
    getCategory: new GetCategory({ categoryRepository }),
    litCategories: new ListCategories({ categoryRepository }),
    countCategories: new CountCategories({ categoryRepository }),
  },
  detail: {
    createDetail: new CreateDetail({ detailRepository }),
    deleteDetail: new DeleteDetail({
      detailRepository,
      productRepository,
    }),
    updateDetail: new UpdateDetail({ detailRepository }),
    listDetails: new ListDetails({ detailRepository }),
    getDetail: new GetDetail({ detailRepository }),
    countDetails: new CountDetails({ detailRepository }),
  },
  order: {
    countStoredOrders: new CountStoredOrders({ orderRepository }),
    createOrder: new CreateOrder({
      orderAssociatedDataProvider,
      orderTransactionManager,
    }),
    listOrderOverviews: new ListOrderOverviews({ orderRepository }),
    getOrder: new GetOrder({ orderRepository }),
    deleteOrderAndReleaseProductStock: new DeleteOrderAndReleaseProductsStock({
      orderRepository,
      orderAssociatedDataProvider,
    }),
    updatePartialOrder: new UpdatePartialOrder({
      orderRepository,
      orderAssociatedDataProvider,
      orderTransactionManager,
    }),
  },
  payment: {
    paymentGatewaySuccessHandler: new PaymentGatewaySuccessHandler({
      paymentAssociatedDataProvider,
      paymentOrderNotifier,
      paymentTransactionRepository,
    }),
    // paymentDataRetriever: new CreatePaymentDataRetriever({ orderRepository }),
    listPaymentTransactions: new ListPayments({
      paymentTransactionRepository,
    }),
    getPaymentTransaction: new GetPaymentTransaction({
      paymentTransactionRepository,
    }),
    countPaymentTransactions: new CountTransactions({
      paymentTransactionRepository,
    }),
    createPaymentTransaction: new CreatePaymentTransaction({
      paymentTransactionRepository,
      paymentAssociatedDataProvider,
    }),
    prepareOrderForPayment: new PrepareOrderForPayment({
      paymentAssociatedDataProvider,
    }),
  },
  admin: {
    createAdmin: new CreateAdmin({
      adminRepository,
    }),
    getAdmin: new GetAdmin({
      adminRepository,
    }),
    updatePartialAdmin: new UpdatePartialAdmin({
      adminRepository,
      adminNotifier,
    }),
  },
};
