import { PostgreSqlAdminRepository } from "../../admin/infrastructure/postgreSqlAdminRepository.js";
import { PostgresAdminRefreshTokenRepository } from "../../auth/infrastructure/postgreSqlAdminRefreshTokenRepository.js";
import { PostgresLoginCodeRepository } from "../../auth/infrastructure/postgreSqlLoginCodeRepository.js";
import { PostgreSqlCategoryRepository } from "../../category/infrastructure/postgreSqlCategoryRepository.js";
import { PostgreSqlDetailRepository } from "../../detail/infrastructure/postgreSqlDetailRepository.js";
import { PostgreSqlOrderRepository } from "../../order/infrastructure/postgreSqlOrderRepository.js";
import { PostgreSqlOrderTransactionManager } from "../../order/infrastructure/postgreSqlOrderTransactionManager.js";
import { PostgreSqlPaymentTransactionRepository } from "../../payment/infrastructure/postgreSqlPaymentTransactionRepository.js";
import { PostgreSqlProductRepository } from "../../product/infrastructure/postgreSqlProductRepository.js";
import { PostgreSqlSizeRepository } from "../../size/infrastructure.ts/postgreSqlSizeRepository.js";
import { PostgreSqlTagRepository } from "../../tag/infrastructure/postgreSqlTagRepository.js";
import { RepositoryContainer } from "./repositoryContainer.js";

export function setupPostgreSqlRepositories(): RepositoryContainer {
  return {
    productRepository: new PostgreSqlProductRepository(),
    tagRepository: new PostgreSqlTagRepository(),
    sizeRepository: new PostgreSqlSizeRepository(),
    categoryRepository: new PostgreSqlCategoryRepository(),
    detailRepository: new PostgreSqlDetailRepository(),
    orderRepository: new PostgreSqlOrderRepository(),
    paymentTransactionRepository: new PostgreSqlPaymentTransactionRepository(),
    loginCodeRepository: new PostgresLoginCodeRepository(),
    refreshTokenRepository: new PostgresAdminRefreshTokenRepository(),
    adminRepository: new PostgreSqlAdminRepository(),
    orderTransactionManager: new PostgreSqlOrderTransactionManager(),
  };
}
