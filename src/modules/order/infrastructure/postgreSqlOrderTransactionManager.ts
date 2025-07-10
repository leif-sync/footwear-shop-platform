import { PostgreSqlAdminRepository } from "../../admin/infrastructure/postgreSqlAdminRepository.js";
import { PostgreSqlProductRepository } from "../../product/infrastructure/postgreSqlProductRepository.js";
import { prismaConnection } from "../../shared/infrastructure/prismaClient.js";
import { OrderAssociatedDataProvider as OrderAssociatedDataProviderPort } from "../domain/associatedDataProvider.js";
import { OrderRepository } from "../domain/orderRepository.js";
import { OrderTransactionManager } from "../domain/orderTransactionManager.js";
import { OrderAssociatedDataProvider } from "./orderAssociatedDataProvider.js";
import { PostgreSqlOrderRepository } from "./postgreSqlOrderRepository.js";

export class PostgreSqlOrderTransactionManager extends OrderTransactionManager {
  async runInTransaction<T>(
    action: (transactionalAccessor: {
      transactionalOrderRepository: OrderRepository;
      transactionalAssociatedDataProvider: OrderAssociatedDataProviderPort;
    }) => Promise<T>
  ): Promise<T> {
    return await prismaConnection.$transaction(async (transactionContext) => {
      const transactionalOrderRepository = new PostgreSqlOrderRepository({
        transactionContext,
      });

      const productRepository = new PostgreSqlProductRepository({
        transactionContext,
      });

      const adminRepository = new PostgreSqlAdminRepository({
        transactionContext,
      });

      const transactionalAssociatedDataProvider =
        new OrderAssociatedDataProvider({
          productRepository,
          adminRepository,
        });

      return await action({
        transactionalOrderRepository,
        transactionalAssociatedDataProvider,
      });
    });
  }
}
