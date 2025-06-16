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

  async run(params: {
    customer: Customer;
    shippingAddress: ShippingAddress;
    creatorDetails: OrderCreatorDetails;
    orderStatus: OrderStatus;
    paymentInfo: OrderPaymentInfo;
    orderProducts: OrderItem[];
  }) {
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
