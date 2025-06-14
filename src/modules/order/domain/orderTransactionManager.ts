import { OrderAssociatedDataProvider } from "./associatedDataProvider.js";
import { OrderRepository } from "./orderRepository.js";

type action<T> = (transactionalAccessor: {
  transactionalOrderRepository: OrderRepository;
  transactionalAssociatedDataProvider: OrderAssociatedDataProvider;
}) => Promise<T>;

export abstract class OrderTransactionManager {
  abstract runInTransaction<T>(action: action<T>): Promise<T>;
}
