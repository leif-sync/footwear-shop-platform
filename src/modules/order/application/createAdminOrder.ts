import { OrderStatus } from "../domain/orderStatus.js";
import { OrderAssociatedDataProvider } from "../domain/associatedDataProvider.js";
import { OrderTransactionManager } from "../domain/orderTransactionManager.js";
import { Customer } from "../domain/customer.js";
import { ShippingAddress } from "../domain/shippingAddress.js";
import { OrderCreatorDetails } from "../domain/orderCreatorDetails.js";
import { OrderPaymentInfo } from "../domain/orderPaymentInfo.js";
import { InvalidCreatorError } from "../domain/errors/invalidCreatorError.js";
import {
  OrderItem,
  setupOrderInformation,
} from "../domain/setupOrderInformation.js";
import { OrderCreatorIsRequiredError } from "../domain/errors/orderCreatorIsRequiredError.js";
import { UUID } from "../../shared/domain/UUID.js";

/**
 * Use case for creating an order by an admin.
 */
export class CreateAdminOrder {
  private readonly associatedDataProvider: OrderAssociatedDataProvider;
  private readonly orderTransactionManager: OrderTransactionManager;

  constructor(params: {
    orderAssociatedDataProvider: OrderAssociatedDataProvider;
    orderTransactionManager: OrderTransactionManager;
  }) {
    this.associatedDataProvider = params.orderAssociatedDataProvider;
    this.orderTransactionManager = params.orderTransactionManager;
  }

  /**
   * Executes the use case to create an order by an admin.
   * @param params - Parameters required for creating the order.
   * @param params.customer - Customer for whom the order is created.
   * @param params.shippingAddress - Shipping address for the order.
   * @param params.creatorDetails - Details of the admin creating the order.
   * @param params.orderStatus - Status of the order.
   * @param params.paymentInfo - Payment information for the order.
   * @param params.orderProducts - List of products in the order.
   * @returns An object containing the order ID.
   *
   * @throws {OrderCreatorIsRequiredError} If the creator details are not provided.
   * @throws {InvalidCreatorError} If the creator ID does not correspond to a valid admin.
   * @throws {InvalidProductError} If any product in the order is invalid.
   * @throws {InvalidVariantError} If any variant in the order is invalid.
   * @throws {SizeNotAvailableForVariantError} If a size is not available for a variant in the order.
   * @throws {NotEnoughStockError} If there is not enough stock for a variant in the order.
   */
  async run(params: {
    customer: Customer;
    shippingAddress: ShippingAddress;
    creatorDetails: OrderCreatorDetails;
    orderStatus: OrderStatus;
    paymentInfo: OrderPaymentInfo;
    orderProducts: OrderItem[];
  }): Promise<{ orderId: UUID }> {
    const {
      customer,
      shippingAddress,
      creatorDetails,
      orderStatus,
      paymentInfo,
    } = params;

    const adminId = creatorDetails.getCreatorId();

    if (!adminId) throw new OrderCreatorIsRequiredError();

    const isValidAdmin = await this.associatedDataProvider.checkAdminExistence({
      adminId,
    });

    if (!isValidAdmin) throw new InvalidCreatorError({ creatorId: adminId });

    const productIds = params.orderProducts.map(
      (orderProduct) => orderProduct.productId
    );

    const productUpdaters =
      await this.associatedDataProvider.retrieveProductUpdaters({
        productIds,
      });

    const order = setupOrderInformation({
      orderProducts: params.orderProducts,
      productUpdaters,
      customer,
      shippingAddress,
      creatorDetails,
      orderStatus,
      paymentInfo,
    });

    const isWaitingForPayment = OrderStatus.create
      .waitingForPayment()
      .equals(orderStatus);

    const isWaitingForShipment = OrderStatus.create
      .waitingForShipment()
      .equals(orderStatus);

    const shouldDecrementStock = isWaitingForPayment || isWaitingForShipment;

    await this.orderTransactionManager.runInTransaction(
      async (dataAccessor) => {
        const {
          transactionalAssociatedDataProvider,
          transactionalOrderRepository,
        } = dataAccessor;

        await transactionalOrderRepository.create({ order });
        if (!shouldDecrementStock) return;

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
