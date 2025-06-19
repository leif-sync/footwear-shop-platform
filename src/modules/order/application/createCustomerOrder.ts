import { OrderStatus } from "../domain/orderStatus.js";
import { OrderAssociatedDataProvider } from "../domain/associatedDataProvider.js";
import { OrderTransactionManager } from "../domain/orderTransactionManager.js";
import { Customer } from "../domain/customer.js";
import { ShippingAddress } from "../domain/shippingAddress.js";
import { OrderCreatorDetails } from "../domain/orderCreatorDetails.js";
import { OrderPaymentInfo } from "../domain/orderPaymentInfo.js";
import { OrderPaymentStatus } from "../domain/orderPaymentStatus.js";
import { OrderCreator } from "../domain/orderCreator.js";
import {
  OrderItem,
  setupOrderInformation,
} from "../domain/setupOrderInformation.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { UUID } from "../../shared/domain/UUID.js";

/**
 * Use case for creating a customer order.
 */
export class CreateCustomerOrder {
  private readonly associatedDataProvider: OrderAssociatedDataProvider;
  private readonly orderTransactionManager: OrderTransactionManager;
  private readonly paymentTimeoutDuration: NonNegativeInteger;

  /**
   * Constructor for the CreateCustomerOrder use case.
   * @param params - Parameters required for creating a customer order.
   * @param params.orderAssociatedDataProvider - Data provider for order-related information.
   * @param params.orderTransactionManager - Transaction manager for order operations.
   * @param params.paymentTimeoutDuration - Duration for payment timeout.
   */
  constructor(params: {
    orderAssociatedDataProvider: OrderAssociatedDataProvider;
    orderTransactionManager: OrderTransactionManager;
    paymentTimeoutDuration: NonNegativeInteger;
  }) {
    this.associatedDataProvider = params.orderAssociatedDataProvider;
    this.orderTransactionManager = params.orderTransactionManager;
    this.paymentTimeoutDuration = params.paymentTimeoutDuration;
  }

  /**
   * Executes the use case to create a customer order.
   * @param params.customer - Customer placing the order.
   * @param params.shippingAddress - Shipping address for the order.
   * @param params.orderProducts - List of products in the order.
   * @returns An object containing the order ID.
   * 
   * @throws {InvalidProductError} If any product in the order is invalid.
   * @throws {InvalidProductError} If any product in the order is invalid.
   * @throws {InvalidVariantError} If any variant in the order is invalid.
   * @throws {SizeNotAvailableForVariantError} If a size is not available for a variant in the order.
   * @throws {NotEnoughStockError} If there is not enough stock for a variant in the order.
   * 
   */
  async run(params: {
    customer: Customer;
    shippingAddress: ShippingAddress;
    orderProducts: OrderItem[];
  }): Promise<{ orderId: UUID }> {
    const { customer, shippingAddress } = params;

    const productIds = params.orderProducts.map(
      (orderProduct) => orderProduct.productId
    );

    const productUpdaters =
      await this.associatedDataProvider.retrieveProductUpdaters({
        productIds,
      });

    const paymentInfo = new OrderPaymentInfo({
      paymentAt: null,
      paymentStatus: OrderPaymentStatus.create.inPaymentGateway(),
      paymentDeadline: new Date(
        Date.now() + this.paymentTimeoutDuration.getValue() * 1000
      ),
    });

    const creatorDetails = new OrderCreatorDetails({
      orderCreator: OrderCreator.create.guest(),
    });

    const orderStatus = OrderStatus.create.waitingForPayment();

    const order = setupOrderInformation({
      orderProducts: params.orderProducts,
      productUpdaters,
      customer,
      shippingAddress,
      creatorDetails,
      orderStatus,
      paymentInfo,
    });

    await this.orderTransactionManager.runInTransaction(
      async (dataAccessor) => {
        const {
          transactionalAssociatedDataProvider,
          transactionalOrderRepository,
        } = dataAccessor;

        await transactionalOrderRepository.create({ order });

        await transactionalAssociatedDataProvider.applyProductUpdaters({
          productUpdaters,
        });
      }
    );

    return {
      orderId: order.getId(),
    };
  }
}
