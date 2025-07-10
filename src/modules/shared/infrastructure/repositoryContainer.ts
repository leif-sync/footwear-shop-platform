import { AdminRepository } from "../../admin/domain/adminRepository.js";
import { AdminRefreshTokenRepository } from "../../auth/domain/adminRefreshTokenRepository.js";
import { LoginCodeRepository } from "../../auth/domain/loginCodeRepository.js";
import { CategoryRepository } from "../../category/domain/categoryRepository.js";
import { DetailRepository } from "../../detail/domain/detailRepository.js";
import { OrderRepository } from "../../order/domain/orderRepository.js";
import { OrderTransactionManager } from "../../order/domain/orderTransactionManager.js";
import { PaymentTransactionRepository } from "../../payment/domain/paymentTransactionRepository.js";
import { ProductRepository } from "../../product/domain/productRepository.js";
import { SizeRepository } from "../../size/domain/sizeRepository.js";
import { TagRepository } from "../../tag/domain/tagRepository.js";

export interface RepositoryContainer {
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
  orderTransactionManager: OrderTransactionManager;
}
