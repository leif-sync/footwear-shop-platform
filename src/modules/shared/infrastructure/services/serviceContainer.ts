import { AdminRepository } from "../../../admin/domain/adminRepository.js";
import { AdminRefreshTokenRepository } from "../../../auth/domain/adminRefreshTokenRepository.js";
import { LoginCodeRepository } from "../../../auth/domain/loginCodeRepository.js";
import { CategoryRepository } from "../../../category/domain/categoryRepository.js";
import { DetailRepository } from "../../../detail/domain/detailRepository.js";
import { EmailSender } from "../../../notification/domain/emailSender.js";
import { OrderRepository } from "../../../order/domain/orderRepository.js";
import { OrderTransactionManager } from "../../../order/domain/orderTransactionManager.js";
import { PaymentTransactionRepository } from "../../../payment/domain/paymentTransactionRepository.js";
import { ImageStorageEngine } from "../../../product/domain/imageStorageEngine.js";
import { ProductRepository } from "../../../product/domain/productRepository.js";
import { SizeRepository } from "../../../size/domain/sizeRepository.js";
import { TagRepository } from "../../../tag/domain/tagRepository.js";
import { AdminService, setupAdminService } from "./adminService.js";
import { CategoryService, setupCategoryService } from "./categoryService.js";
import { DetailService, setupDetailService } from "./detailService.js";
import { OrderService, setupOrderService } from "./orderService.js";
import { PaymentService, setupPaymentService } from "./paymentService.js";
import { ProductService, setupProductService } from "./productService.js";
import { setupSizeService, SizeService } from "./SizeService.js";
import { setupTagService, TagService } from "./tagService.js";

export interface ServiceContainer {
  product: ProductService;
  tag: TagService;
  size: SizeService;
  category: CategoryService;
  detail: DetailService;
  order: OrderService;
  payment: PaymentService;
  admin: AdminService;
}

export function setupServiceContainer(params: {
  repositories: {
    productRepository: ProductRepository;
    tagRepository: TagRepository;
    sizeRepository: SizeRepository;
    categoryRepository: CategoryRepository;
    detailRepository: DetailRepository;
    orderRepository: OrderRepository;
    paymentTransactionRepository: PaymentTransactionRepository;
    adminRepository: AdminRepository;
    loginCodeRepository: LoginCodeRepository;
    refreshTokenRepository: AdminRefreshTokenRepository;
  };
  transactionManagers: {
    orderTransactionManager: OrderTransactionManager;
  };
  utilityServices: {
    imageUploader: ImageStorageEngine;
    emailSender: EmailSender;
  };
}): ServiceContainer {
  const {
    productRepository,
    tagRepository,
    sizeRepository,
    categoryRepository,
    detailRepository,
    orderRepository,
    paymentTransactionRepository,
    adminRepository,
    loginCodeRepository,
    refreshTokenRepository,
  } = params.repositories;

  const { orderTransactionManager } = params.transactionManagers;
  const { imageUploader, emailSender } = params.utilityServices;

  const orderService = setupOrderService({
    orderRepository,
    orderTransactionManager,
    adminRepository,
    productRepository,
  });

  const productService = setupProductService({
    imageUploader,
    productRepository,
    categoryRepository,
    detailRepository,
    sizeRepository,
    tagRepository,
    orderRepository,
  });

  const tagService = setupTagService({ tagRepository, productRepository });

  const sizeService = setupSizeService({
    sizeRepository,
    productRepository,
  });

  const categoryService = setupCategoryService({
    categoryRepository,
    productRepository,
  });

  const detailService = setupDetailService({
    detailRepository,
    productRepository,
  });

  const adminService = setupAdminService({ adminRepository, emailSender });

  const paymentService = setupPaymentService({
    orderRepository,
    emailSender,
    paymentTransactionRepository,
  });

  return {
    product: productService,
    tag: tagService,
    size: sizeService,
    category: categoryService,
    detail: detailService,
    admin: adminService,
    order: orderService,
    payment: paymentService,
  };
}
