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

export class CreateCustomerOrder {
  private readonly associatedDataProvider: OrderAssociatedDataProvider;
  private readonly orderTransactionManager: OrderTransactionManager;
  private readonly paymentTimeoutDuration: number;

  constructor(params: {
    orderAssociatedDataProvider: OrderAssociatedDataProvider;
    orderTransactionManager: OrderTransactionManager;
    paymentTimeoutDuration: number;
  }) {
    this.associatedDataProvider = params.orderAssociatedDataProvider;
    this.orderTransactionManager = params.orderTransactionManager;
    this.paymentTimeoutDuration = params.paymentTimeoutDuration;
  }

  async run(params: {
    customer: Customer;
    shippingAddress: ShippingAddress;
    orderProducts: OrderItem[];
  }) {
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
        Date.now() + this.paymentTimeoutDuration * 1000
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
