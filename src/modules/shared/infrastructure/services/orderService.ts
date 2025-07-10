import { PAYMENT_TIMEOUT_SECONDS } from "../../../../environmentVariables.js";
import { AdminRepository } from "../../../admin/domain/adminRepository.js";
import { CountStoredOrders } from "../../../order/application/countStoredOrders.js";
import { CreateAdminOrder } from "../../../order/application/createAdminOrder.js";
import { CreateCustomerOrder } from "../../../order/application/createCustomerOrder.js";
import { DeleteOrderAndReleaseProductsStock } from "../../../order/application/deleteOrdersAndReleaseProductStock.js";
import { GetOrder } from "../../../order/application/getOrder.js";
import { ListOrderOverviews } from "../../../order/application/listOrderOverviews.js";
import { UpdatePartialOrder } from "../../../order/application/updatePartialOrder.js";
import { OrderRepository } from "../../../order/domain/orderRepository.js";
import { OrderTransactionManager } from "../../../order/domain/orderTransactionManager.js";
import { OrderAssociatedDataProvider } from "../../../order/infrastructure/orderAssociatedDataProvider.js";
import { ProductRepository } from "../../../product/domain/productRepository.js";
import { NonNegativeInteger } from "../../domain/nonNegativeInteger.js";

export interface OrderService {
  countStoredOrders: CountStoredOrders;
  createCustomerOrder: CreateCustomerOrder;
  createAdminOrder: CreateAdminOrder;
  listOrderOverviews: ListOrderOverviews;
  getOrder: GetOrder;
  deleteOrderAndReleaseProductStock: DeleteOrderAndReleaseProductsStock;
  updatePartialOrder: UpdatePartialOrder;
}

export function setupOrderService({
  orderRepository,
  orderTransactionManager,
  adminRepository,
  productRepository,
}: {
  orderRepository: OrderRepository;
  orderTransactionManager: OrderTransactionManager;
  adminRepository: AdminRepository;
  productRepository: ProductRepository;
}) {
  const orderAssociatedDataProvider = new OrderAssociatedDataProvider({
    adminRepository,
    productRepository,
  });

  return {
    countStoredOrders: new CountStoredOrders({ orderRepository }),
    createCustomerOrder: new CreateCustomerOrder({
      orderAssociatedDataProvider,
      orderTransactionManager,
      paymentTimeoutDuration: new NonNegativeInteger(PAYMENT_TIMEOUT_SECONDS),
    }),
    createAdminOrder: new CreateAdminOrder({
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
  };
}
