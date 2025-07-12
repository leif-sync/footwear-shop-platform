import { InMemoryAdminRepository } from "../../admin/infrastructure/inMemoryAdminRepository.js";
import { InMemoryLoginCodeRepository } from "../../auth/infrastructure/inMemoryLoginCodeRepository.js";
import { InMemoryRefreshTokenRepository } from "../../auth/infrastructure/inMemoryRefreshTokenRepository.js";
import { InMemoryCategoryRepository } from "../../category/infrastructure/inMemoryCategoryRepository.js";
import { InMemoryDetailRepository } from "../../detail/infrastructure/inMemoryDetailRepository.js";
import { InMemoryEmailRepository } from "../../notification/infrastructure.ts/inMemoryEmailRepository.js";
import { FakeOrderTransactionManager } from "../../order/infrastructure/fakeOrderTransactionManager.js";
import { InMemoryOrderRepository } from "../../order/infrastructure/inMemoryOrderRepository.js";
import { OrderAssociatedDataProvider } from "../../order/infrastructure/orderAssociatedDataProvider.js";
import { InMemoryPaymentTransactionRepository } from "../../payment/infrastructure/inMemoryPaymentTransactionRepository.js";
import { InMemoryProductRepository } from "../../product/infrastructure/inMemoryProductRepository.js";
import { InMemorySizeRepository } from "../../size/infrastructure.ts/inMemorySizeRepository.js";
import { InMemoryTagRepository } from "../../tag/infrastructure/inMemoryTagRepository.js";
import { RepositoryContainer } from "./repositoryContainer.js";

export function setupInMemoryRepositories(): RepositoryContainer {
  const productRepository = new InMemoryProductRepository();
  const adminRepository = new InMemoryAdminRepository();
  const orderRepository = new InMemoryOrderRepository({ productRepository });

  const orderAssociatedDataProvider = new OrderAssociatedDataProvider({
    adminRepository,
    productRepository,
  });

  const orderTransactionManager = new FakeOrderTransactionManager({
    orderAssociatedDataProvider,
    orderRepository,
  });

  return {
    productRepository,
    tagRepository: new InMemoryTagRepository(),
    sizeRepository: new InMemorySizeRepository(),
    categoryRepository: new InMemoryCategoryRepository(),
    detailRepository: new InMemoryDetailRepository(),
    orderRepository,
    paymentTransactionRepository: new InMemoryPaymentTransactionRepository(),
    adminRepository,
    loginCodeRepository: new InMemoryLoginCodeRepository(),
    refreshTokenRepository: new InMemoryRefreshTokenRepository(),
    orderTransactionManager,
    emailRepository: new InMemoryEmailRepository(),
  };
}
