import { OrderAssociatedDataProvider as OrderAssociatedDataProviderPort } from "../domain/associatedDataProvider.js";
import { OrderRepository } from "../domain/orderRepository.js";
import { OrderTransactionManager } from "../domain/orderTransactionManager.js";

export class FakeOrderTransactionManager implements OrderTransactionManager {
  private readonly orderRepository: OrderRepository;
  private readonly associatedDataProvider: OrderAssociatedDataProviderPort;

  constructor(params: {
    orderRepository: OrderRepository;
    orderAssociatedDataProvider: OrderAssociatedDataProviderPort;
  }) {
    this.orderRepository = params.orderRepository;
    this.associatedDataProvider = params.orderAssociatedDataProvider;
  }

  async runInTransaction<T>(
    action: (transactionalAccessor: {
      transactionalOrderRepository: OrderRepository;
      transactionalAssociatedDataProvider: OrderAssociatedDataProviderPort;
    }) => Promise<T>
  ): Promise<T> {
    const orderRepository = this.orderRepository;
    const associatedDataProvider = this.associatedDataProvider;

    return action({
      transactionalOrderRepository: orderRepository,
      transactionalAssociatedDataProvider: associatedDataProvider,
    });
  }
}
