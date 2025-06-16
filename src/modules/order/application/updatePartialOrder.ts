import { Email } from "../../shared/domain/email.js";
import { Phone } from "../../shared/domain/phone.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { OrderAssociatedDataProvider } from "../domain/associatedDataProvider.js";
import { Customer } from "../domain/customer.js";
import { CannotUpdateOrderError } from "../domain/errors/cannotUpdateOrderError.js";
import { InvalidProductError } from "../domain/errors/invalidProductError.js";
import { InvalidVariantError } from "../domain/errors/invalidVariantError.js";
import { OrderNotFoundError } from "../domain/errors/orderNotFoundError.js";
import { SizeNotAvailableForVariantError } from "../domain/errors/sizeNotAvailableForVariantError.js";
import { OrderFull } from "../domain/orderFull.js";
import { OrderPaymentInfo } from "../domain/orderPaymentInfo.js";
import {
  OrderPaymentStatus,
  orderPaymentStatusOptions,
} from "../domain/orderPaymentStatus.js";
import { OrderRepository } from "../domain/orderRepository.js";
import { OrderStatus, orderStatusOptions } from "../domain/orderStatus.js";
import { OrderTransactionManager } from "../domain/orderTransactionManager.js";
import { OrderWrite } from "../domain/orderWrite.js";
import { ProductUpdater } from "../domain/productUpdater.js";
import { ShippingAddress } from "../domain/shippingAddress.js";

interface customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface shippingAddress {
  region: string;
  commune: string;
  streetName: string;
  streetNumber: string;
  additionalInfo?: string;
}

interface paymentInfo {
  paymentStatus: orderPaymentStatusOptions;
  paymentAt: Date | null;
  paymentDeadline: Date;
}

interface updateOrderParams {
  orderId: string;
  customer?: customer;
  shippingAddress?: shippingAddress;
  orderStatus?: orderStatusOptions;
  paymentInfo?: paymentInfo;
}

// TODO: mover a la definición de OrderWrite y validar allí

const orderStatusValidTransitions = new Map([
  [
    orderStatusOptions.WAITING_FOR_PAYMENT,
    [orderStatusOptions.WAITING_FOR_SHIPMENT, orderStatusOptions.CANCELED],
  ],
  [
    orderStatusOptions.WAITING_FOR_SHIPMENT,
    [orderStatusOptions.SHIPPED, orderStatusOptions.CANCELED],
  ],
  [orderStatusOptions.SHIPPED, [orderStatusOptions.DELIVERED]],
  [orderStatusOptions.DELIVERED, [orderStatusOptions.RETURNED]],
  [orderStatusOptions.CANCELED, []], // No transitions allowed from CANCELED
  [orderStatusOptions.RETURNED, []], // No transitions allowed from RETURNED
]);

const allowedOrderStatusToUpdateCustomer = [
  orderStatusOptions.WAITING_FOR_PAYMENT,
  orderStatusOptions.WAITING_FOR_SHIPMENT,
];

const allowedOrderStatusToUpdateShippingAddress = [
  orderStatusOptions.WAITING_FOR_PAYMENT,
  orderStatusOptions.WAITING_FOR_SHIPMENT,
];

export class UpdatePartialOrder {
  private readonly orderRepository: OrderRepository;
  private readonly orderAssociatedDataProvider: OrderAssociatedDataProvider;
  private readonly orderTransactionManager: OrderTransactionManager;

  constructor(params: {
    orderRepository: OrderRepository;
    orderAssociatedDataProvider: OrderAssociatedDataProvider;
    orderTransactionManager: OrderTransactionManager;
  }) {
    this.orderRepository = params.orderRepository;
    this.orderAssociatedDataProvider = params.orderAssociatedDataProvider;
    this.orderTransactionManager = params.orderTransactionManager;
  }

  private ensureOrderStatusTransition(params: {
    currentOrderStatus: orderStatusOptions;
    targetOrderStatus?: orderStatusOptions;
    orderId: UUID;
  }) {
    const { currentOrderStatus, targetOrderStatus, orderId } = params;
    const allowedStatusTransitions =
      orderStatusValidTransitions.get(currentOrderStatus);

    if (!allowedStatusTransitions) {
      throw new Error(`Invalid current order status: ${currentOrderStatus}`);
    }

    if (!targetOrderStatus) return new OrderStatus(currentOrderStatus);

    const isValidTransition = allowedStatusTransitions.some(
      (status) => status === targetOrderStatus
    );

    if (!isValidTransition) {
      throw new CannotUpdateOrderError({
        orderId,
        reason: `Invalid order status transition from ${currentOrderStatus} to ${targetOrderStatus}`,
      });
    }

    return new OrderStatus(targetOrderStatus);
  }

  private ensureCanUpdateCustomer(params: {
    currentOrder: OrderFull;
    newCustomer?: customer;
  }) {
    const { currentOrder, newCustomer } = params;

    const { customer } = currentOrder.toPrimitives();

    if (!newCustomer) {
      return new Customer({
        email: new Email(customer.email),
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: new Phone(customer.phone),
      });
    }

    const currentOrderStatus = currentOrder.getOrderStatus();
    const isAllowedToUpdateCustomer = allowedOrderStatusToUpdateCustomer.some(
      (status) => status === currentOrderStatus
    );

    if (!isAllowedToUpdateCustomer) {
      throw new CannotUpdateOrderError({
        orderId: currentOrder.getOrderId(),
        reason: `Cannot update customer information when order status is ${currentOrderStatus}`,
      });
    }

    return new Customer({
      email: new Email(newCustomer.email),
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      phone: new Phone(newCustomer.phone),
    });
  }

  private ensureCanUpdateShippingAddress(params: {
    currentOrder: OrderFull;
    newShippingAddress?: shippingAddress;
  }) {
    const { currentOrder, newShippingAddress } = params;
    const { shippingAddress } = currentOrder.toPrimitives();
    if (!newShippingAddress) {
      return new ShippingAddress({
        commune: shippingAddress.commune,
        region: shippingAddress.region,
        streetName: shippingAddress.streetName,
        streetNumber: shippingAddress.streetNumber,
        additionalInfo: shippingAddress.additionalInfo,
      });
    }
    const currentOrderStatus = currentOrder.getOrderStatus();
    const isAllowedToUpdateShippingAddress =
      allowedOrderStatusToUpdateShippingAddress.some(
        (status) => status === currentOrderStatus
      );

    if (!isAllowedToUpdateShippingAddress) {
      throw new CannotUpdateOrderError({
        orderId: currentOrder.getOrderId(),
        reason: `Cannot update shipping address when order status is ${currentOrderStatus}`,
      });
    }

    return new ShippingAddress({
      commune: newShippingAddress.commune,
      region: newShippingAddress.region,
      streetName: newShippingAddress.streetName,
      streetNumber: newShippingAddress.streetNumber,
      additionalInfo: newShippingAddress.additionalInfo,
    });
  }

  private ensureCanUpdatePaymentInfo(params: {
    currentOrder: OrderFull;
    newPaymentInfo?: paymentInfo;
  }) {
    const { currentOrder, newPaymentInfo } = params;
    const { paymentInfo } = currentOrder.toPrimitives();

    return new OrderPaymentInfo({
      paymentAt: newPaymentInfo?.paymentAt ?? paymentInfo.paymentAt,
      paymentDeadline:
        newPaymentInfo?.paymentDeadline ?? paymentInfo.paymentDeadline,
      paymentStatus: new OrderPaymentStatus(
        newPaymentInfo?.paymentStatus ?? paymentInfo.paymentStatus
      ),
    });
  }

  private validateAndAdjustVariantStock(
    orderVariant: {
      variantId: string;
      variantSizes: { sizeValue: number; quantity: number }[];
    },
    productUpdater: ProductUpdater
  ) {
    const variantId = new UUID(orderVariant.variantId);
    const hasVariant = productUpdater.hasVariant({ variantId });
    if (!hasVariant) throw new InvalidVariantError({ variantId });

    orderVariant.variantSizes.forEach((orderVariantSize) => {
      const sizeValue = new PositiveInteger(orderVariantSize.sizeValue);
      const hasVariantSize = productUpdater.hasSizeForVariant({
        sizeValue,
        variantId,
      });

      if (!hasVariantSize) {
        throw new SizeNotAvailableForVariantError({
          variantId,
          sizeValue: sizeValue.getValue(),
        });
      }

      productUpdater.addStockForVariant({
        sizeValue,
        stockToAdd: new PositiveInteger(orderVariantSize.quantity),
        variantId,
      });
    });
  }

  private async adjustStockForCanceledOrder(orderWrite: OrderWrite) {
    const { orderProducts } = orderWrite.toPrimitives();
    const productIds = orderProducts.map(
      ({ productId }) => new UUID(productId)
    );

    const productUpdaters =
      await this.orderAssociatedDataProvider.retrieveProductUpdaters({
        productIds,
      });

    const productUpdatersMap = new Map(
      productUpdaters.map((product) => [product.getProductId(), product])
    );

    orderProducts.forEach((orderProduct) => {
      const productId = new UUID(orderProduct.productId);
      const productUpdater = productUpdatersMap.get(orderProduct.productId);
      if (!productUpdater) throw new InvalidProductError({ productId });

      orderProduct.productVariants.forEach((orderVariant) => {
        this.validateAndAdjustVariantStock(orderVariant, productUpdater);
      });
    });

    return productUpdaters;
  }

  async run(params: updateOrderParams): Promise<void> {
    const orderId = new UUID(params.orderId);

    const orderFound = await this.orderRepository.find({ orderId });
    if (!orderFound) throw new OrderNotFoundError({ orderId });

    const orderStatusFound = orderFound.getOrderStatus();

    const newOrderStatus = this.ensureOrderStatusTransition({
      currentOrderStatus: orderStatusFound,
      targetOrderStatus: params.orderStatus,
      orderId,
    });

    const newCustomer = this.ensureCanUpdateCustomer({
      currentOrder: orderFound,
      newCustomer: params.customer,
    });

    const newShippingAddress = this.ensureCanUpdateShippingAddress({
      currentOrder: orderFound,
      newShippingAddress: params.shippingAddress,
    });

    const newPaymentInfo = this.ensureCanUpdatePaymentInfo({
      currentOrder: orderFound,
      newPaymentInfo: params.paymentInfo,
    });

    const orderWrite = OrderWrite.from(orderFound);
    orderWrite.updateOrderDetails({
      orderStatus: newOrderStatus,
      customer: newCustomer,
      shippingAddress: newShippingAddress,
      paymentInfo: newPaymentInfo,
    });

    const isNewOrderStatusCanceled = newOrderStatus.equals(
      OrderStatus.create.canceled()
    );

    if (!isNewOrderStatusCanceled) {
      return await this.orderRepository.update({ order: orderWrite });
    }

    const productUpdaters = await this.adjustStockForCanceledOrder(orderWrite);

    await this.orderTransactionManager.runInTransaction(
      async (dataAccessor) => {
        const {
          transactionalAssociatedDataProvider,
          transactionalOrderRepository,
        } = dataAccessor;

        await transactionalAssociatedDataProvider.applyProductUpdaters({
          productUpdaters,
        });
        await transactionalOrderRepository.update({ order: orderWrite });
      }
    );
  }
}
