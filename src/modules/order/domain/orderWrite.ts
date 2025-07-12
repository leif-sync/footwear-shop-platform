import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Customer, PrimitiveCustomer } from "./customer.js";
import { OrderFull } from "./orderFull.js";
import {
  OrderPaymentInfo,
  PrimitiveOrderPaymentInfo,
} from "./orderPaymentInfo.js";
import {
  OrderPaymentStatus,
  OrderPaymentStatusOptions,
} from "./orderPaymentStatus.js";
import { OrderVariantWrite } from "./orderVariantWrite.js";
import {
  OrderProductWrite,
  PrimitiveOrderProductWrite,
} from "./orderProductWrite.js";
import { OrderStatus, OrderStatusOptions } from "./orderStatus.js";
import {
  PrimitiveShippingAddress,
  ShippingAddress,
} from "./shippingAddress.js";
import { OrderVariantSize } from "./orderVariantSize.js";
import {
  OrderCreatorDetails,
  PrimitiveOrderCreatorDetails,
} from "./orderCreatorDetails.js";
import { OrderCreator } from "./orderCreator.js";
import { Phone } from "../../shared/domain/phone.js";
import { CustomerFirstName } from "./customerFirstName.js";
import { CustomerLastName } from "./customerLastName.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { InvalidPaymentStatusForOrderStatusError } from "./errors/invalidPaymentStatusForOrderStatusError.js";
import { InvalidOrderStatusTransitionError } from "./errors/invalidOrderStatusTransitionError.js";
import { CannotUpdateCustomerForOrderStatusError } from "./errors/cannotUpdateCustomerForOrderStatus.js";
import { CannotUpdateShippingForOrderStatusError } from "./errors/cannotUpdateShippingAddressForOrderStatus.js";
import { CannotUpdatePaymentInfoForOrderStatusError } from "./errors/cannotUpdatePaymentInfoForOrderStatus.js";
import { CannotUpdateProductsForOrderStatusError } from "./errors/cannotUpdateProductsForOrderStatusError.js";

const validPaymentStatusForOrderStatus = new Map([
  [
    OrderStatusOptions.WAITING_FOR_PAYMENT,
    [
      OrderPaymentStatusOptions.PENDING,
      OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY,
      OrderPaymentStatusOptions.EXPIRED,
    ],
  ],
  [OrderStatusOptions.WAITING_FOR_SHIPMENT, [OrderPaymentStatusOptions.PAID]],
  [OrderStatusOptions.SHIPPED, [OrderPaymentStatusOptions.PAID]],
  [OrderStatusOptions.DELIVERED, [OrderPaymentStatusOptions.PAID]],
  [OrderStatusOptions.CANCELED, [OrderPaymentStatusOptions.REFUNDED]],
  [OrderStatusOptions.RETURNED, [OrderPaymentStatusOptions.REFUNDED]],
]);

const orderStatusValidTransitions = new Map([
  [
    OrderStatusOptions.WAITING_FOR_PAYMENT,
    [
      OrderStatusOptions.WAITING_FOR_PAYMENT, // Can remain in the same status
      OrderStatusOptions.WAITING_FOR_SHIPMENT,
      OrderStatusOptions.CANCELED,
    ],
  ],
  [
    OrderStatusOptions.WAITING_FOR_SHIPMENT,
    [
      OrderStatusOptions.WAITING_FOR_SHIPMENT, // Can remain in the same status
      OrderStatusOptions.SHIPPED,
      OrderStatusOptions.CANCELED,
    ],
  ],
  [
    OrderStatusOptions.SHIPPED,
    [OrderStatusOptions.SHIPPED, OrderStatusOptions.DELIVERED], // Can remain in the same status
  ],
  [
    OrderStatusOptions.DELIVERED,
    [
      OrderStatusOptions.DELIVERED, // Can remain in the same status
      OrderStatusOptions.RETURNED,
    ],
  ],
  [OrderStatusOptions.CANCELED, [OrderStatusOptions.CANCELED]], // can remain in the same status and no other transitions allowed
  [OrderStatusOptions.RETURNED, [OrderStatusOptions.RETURNED]], // can remain in the same status and no other transitions allowed
]);

const allowedOrderStatusToUpdateCustomer = [
  OrderStatusOptions.WAITING_FOR_PAYMENT,
  OrderStatusOptions.WAITING_FOR_SHIPMENT,
] as const;

const allowedOrderStatusToUpdateShippingAddress = [
  OrderStatusOptions.WAITING_FOR_PAYMENT,
  OrderStatusOptions.WAITING_FOR_SHIPMENT,
] as const;

const allowedOrderStatusToUpdatePaymentInfo = [
  OrderStatusOptions.WAITING_FOR_PAYMENT,
] as const;

const allowedOrderStatusToUpdateProducts = [
  OrderStatusOptions.WAITING_FOR_PAYMENT,
] as const;

export interface PrimitiveOrderWrite {
  orderId: string;
  orderStatus: OrderStatusOptions;
  customer: PrimitiveCustomer;
  shippingAddress: PrimitiveShippingAddress;
  orderProducts: PrimitiveOrderProductWrite[];
  createdAt: Date;
  updatedAt: Date;
  paymentInfo: PrimitiveOrderPaymentInfo;
  creatorDetails: PrimitiveOrderCreatorDetails;
}

export class OrderWrite {
  private readonly orderId: UUID;
  private orderStatus: OrderStatus;
  private customer: Customer;
  private shippingAddress: ShippingAddress;
  private orderProducts: OrderProductWrite[];
  private paymentInfo: OrderPaymentInfo;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private readonly creatorDetails: OrderCreatorDetails;

  constructor(params: {
    orderId: UUID;
    orderStatus: OrderStatus;
    customer: Customer;
    shippingAddress: ShippingAddress;
    orderProducts: OrderProductWrite[];
    createdAt: Date;
    updatedAt: Date;
    paymentInfo: OrderPaymentInfo;
    creatorDetails: OrderCreatorDetails;
  }) {
    this.orderId = params.orderId;
    this.customer = params.customer.clone();
    this.orderStatus = params.orderStatus;
    this.shippingAddress = params.shippingAddress.clone();
    this.orderProducts = params.orderProducts.map(OrderProductWrite.clone);
    this.createdAt = new Date(params.createdAt);
    this.updatedAt = new Date(params.updatedAt);
    this.paymentInfo = params.paymentInfo.clone();
    this.creatorDetails = params.creatorDetails.clone();

    OrderWrite.ensureOrderStatusAndPayment({
      orderStatus: this.orderStatus,
      paymentStatus: this.paymentInfo.getPaymentStatus(),
    });
  }

  /**
   * Ensures that the order status and payment status are compatible.
   * Throws an error if the payment status is not valid for the given order status.
   * @param params - The parameters containing the order status and payment status.
   * @throws {InvalidPaymentStatusForOrderStatusError} If the payment status is not valid for the order status.
   */
  private static ensureOrderStatusAndPayment(params: {
    orderStatus: OrderStatus;
    paymentStatus: OrderPaymentStatus;
  }) {
    const { orderStatus, paymentStatus } = params;

    const validPaymentStatus = validPaymentStatusForOrderStatus.get(
      orderStatus.getValue()
    );

    if (!validPaymentStatus) {
      throw new InvalidPaymentStatusForOrderStatusError({
        orderStatus,
        paymentStatus,
      });
    }

    if (!validPaymentStatus.includes(paymentStatus.getValue())) {
      throw new InvalidPaymentStatusForOrderStatusError({
        orderStatus,
        paymentStatus,
      });
    }
  }

  /**
   * Ensures that the transition from the current order status to the next order status is valid.
   * Throws an error if the transition is not allowed.
   * @param params - The parameters containing the current and next order statuses.
   * @throws {InvalidOrderStatusTransitionError} If the transition is not valid.
   */
  private static ensureOrderStatusTransition(params: {
    currentOrderStatus: OrderStatus;
    nextOrderStatus: OrderStatus;
  }) {
    const { nextOrderStatus, currentOrderStatus } = params;

    const allowedStatusTransitions = orderStatusValidTransitions.get(
      currentOrderStatus.getValue()
    );

    if (!allowedStatusTransitions) {
      throw new InvalidOrderStatusTransitionError({
        fromStatus: currentOrderStatus,
        toStatus: nextOrderStatus,
      });
    }

    const isValidTransition = allowedStatusTransitions.some((status) =>
      nextOrderStatus.equals(status)
    );

    if (!isValidTransition) {
      throw new InvalidOrderStatusTransitionError({
        fromStatus: currentOrderStatus,
        toStatus: nextOrderStatus,
      });
    }
  }

  /**
   * Ensures that the current order status allows updating the customer information.
   * Throws an error if the order status does not allow updating the customer.
   * @param params - The parameters containing the current order status.
   * @throws {CannotUpdateCustomerForOrderStatusError} If the order status does not allow updating the customer.
   */
  private static ensureCanUpdateCustomer(params: {
    currentOrderStatus: OrderStatus;
  }) {
    const { currentOrderStatus } = params;

    const isAllowedToUpdateCustomer = allowedOrderStatusToUpdateCustomer.some(
      (status) => currentOrderStatus.equals(status)
    );

    if (!isAllowedToUpdateCustomer) {
      throw new CannotUpdateCustomerForOrderStatusError({
        orderStatus: currentOrderStatus,
      });
    }
  }

  /**
   * Ensures that the current order status allows updating the shipping address.
   * Throws an error if the order status does not allow updating the shipping address.
   * @param params - The parameters containing the current order status.
   * @throws {CannotUpdateShippingForOrderStatusError} If the order status does not allow updating the shipping address.
   */
  private static ensureCanUpdateShippingAddress(params: {
    currentOrderStatus: OrderStatus;
  }) {
    const { currentOrderStatus } = params;

    const isAllowedToUpdateShippingAddress =
      allowedOrderStatusToUpdateShippingAddress.some((status) =>
        currentOrderStatus.equals(status)
      );

    if (!isAllowedToUpdateShippingAddress) {
      throw new CannotUpdateShippingForOrderStatusError({
        orderStatus: currentOrderStatus,
      });
    }
  }

  /**
   * Ensures that the current order status allows updating the payment information.
   * Throws an error if the order status does not allow updating the payment information.
   * @param params - The parameters containing the current order status.
   * @throws {CannotUpdatePaymentInfoForOrderStatusError} If the order status does not allow updating the payment information.
   */
  private static ensureCanUpdatePaymentInfo(params: {
    currentOrderStatus: OrderStatus;
  }) {
    const { currentOrderStatus } = params;

    const isAllowedToUpdatePaymentInfo =
      allowedOrderStatusToUpdatePaymentInfo.some((status) =>
        currentOrderStatus.equals(status)
      );

    if (!isAllowedToUpdatePaymentInfo) {
      throw new CannotUpdatePaymentInfoForOrderStatusError({
        orderStatus: currentOrderStatus,
      });
    }
  }

  /**
   * Ensures that the current order status allows updating the products in the order.
   * Throws an error if the order status does not allow updating the products.
   * @param params - The parameters containing the current order status.
   * @throws {CannotUpdateProductsForOrderStatusError} If the order status does not allow updating the products.
   */
  private static ensureCanUpdateProducts(params: {
    currentOrderStatus: OrderStatus;
  }) {
    const { currentOrderStatus } = params;

    const isAllowedToUpdateProducts = allowedOrderStatusToUpdateProducts.some(
      (status) => currentOrderStatus.equals(status)
    );

    if (!isAllowedToUpdateProducts) {
      throw new CannotUpdateProductsForOrderStatusError({
        orderStatus: currentOrderStatus,
      });
    }
  }

  static clone(order: OrderWrite): OrderWrite {
    return new OrderWrite({
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      customer: order.customer,
      shippingAddress: order.shippingAddress,
      orderProducts: order.orderProducts,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paymentInfo: order.paymentInfo,
      creatorDetails: order.creatorDetails,
    });
  }

  clone(): OrderWrite {
    return OrderWrite.clone(this);
  }

  static fromOrderFull(order: OrderFull) {
    const orderId = order.getOrderId();
    const orderPrimitives = order.toPrimitives();
    const orderStatus = new OrderStatus(orderPrimitives.status);
    const customer = new Customer({
      email: new EmailAddress(orderPrimitives.customer.email),
      firstName: new CustomerFirstName(orderPrimitives.customer.firstName),
      lastName: new CustomerLastName(orderPrimitives.customer.lastName),
      phone: new Phone(orderPrimitives.customer.phone),
    });
    const shippingAddress = new ShippingAddress({
      commune: orderPrimitives.shippingAddress.commune,
      region: orderPrimitives.shippingAddress.region,
      streetName: orderPrimitives.shippingAddress.streetName,
      streetNumber: orderPrimitives.shippingAddress.streetNumber,
      additionalInfo: orderPrimitives.shippingAddress.additionalInfo,
    });

    const orderProducts = orderPrimitives.products.map((product) => {
      const productVariants = product.productVariants.map((variant) => {
        const variantSizes = variant.variantSizes.map((variantSize) => {
          return new OrderVariantSize({
            quantity: new PositiveInteger(variantSize.quantity),
            sizeValue: new PositiveInteger(variantSize.sizeValue),
          });
        });

        return new OrderVariantWrite({
          variantId: new UUID(variant.variantId),
          variantSizes,
        });
      });

      return new OrderProductWrite({
        productId: new UUID(product.productId),
        unitPrice: new PositiveInteger(product.unitPrice),
        productVariants,
      });
    });

    const paymentInfo = new OrderPaymentInfo({
      paymentDeadline: new Date(orderPrimitives.paymentInfo.paymentDeadline),
      paymentStatus: new OrderPaymentStatus(
        orderPrimitives.paymentInfo.paymentStatus
      ),
      paymentAt: orderPrimitives.paymentInfo.paymentAt,
    });

    return new OrderWrite({
      orderId,
      orderStatus,
      customer,
      shippingAddress,
      orderProducts,
      createdAt: new Date(orderPrimitives.createdAt),
      updatedAt: new Date(orderPrimitives.updatedAt),
      paymentInfo,
      creatorDetails: new OrderCreatorDetails({
        orderCreator: new OrderCreator(orderPrimitives.creatorDetails.creator),
        creatorId: orderPrimitives.creatorDetails.creatorId
          ? UUID.from(orderPrimitives.creatorDetails.creatorId)
          : undefined,
      }),
    });
  }

  getPaymentStatus(): OrderPaymentStatus {
    return this.paymentInfo.getPaymentStatus();
  }

  setPaymentStatus(updatedPaymentStatus: OrderPaymentStatus): void {
    OrderWrite.ensureCanUpdatePaymentInfo({
      currentOrderStatus: this.orderStatus,
    });
    OrderWrite.ensureOrderStatusAndPayment({
      orderStatus: this.orderStatus,
      paymentStatus: updatedPaymentStatus,
    });

    this.paymentInfo = new OrderPaymentInfo({
      paymentStatus: updatedPaymentStatus,
      paymentDeadline: this.paymentInfo.getPaymentDeadline(),
      paymentAt: this.paymentInfo.getPaymentAt(),
    });

    this.updatedAt = new Date();
  }

  setOrderStatus(updatedOrderStatus: OrderStatus): void {
    OrderWrite.ensureOrderStatusTransition({
      nextOrderStatus: updatedOrderStatus,
      currentOrderStatus: this.orderStatus,
    });

    OrderWrite.ensureOrderStatusAndPayment({
      orderStatus: updatedOrderStatus,
      paymentStatus: this.paymentInfo.getPaymentStatus(),
    });

    this.orderStatus = updatedOrderStatus;
    this.updatedAt = new Date();
  }

  /**
   * Updates the order details with the provided parameters.
   * Ensures that the updates are valid based on the current order status.
   * @param params - The parameters containing the updates for the order.
   * @param params.updatedOrderStatus - The new order status to set.
   * @param params.updatedCustomer - The new customer details to set.
   * @param params.updatedShippingAddress - The new shipping address to set.
   * @param params.newOrderProducts - The new products to set in the order.
   * @param params.updatedPaymentInfo - The new payment information to set.
   *
   * @throws {InvalidOrderStatusTransitionError} If trying to transition to an invalid order status.
   * @throws {CannotUpdateCustomerForOrderStatusError} If trying to update customer when not allowed.
   * @throws {CannotUpdateShippingForOrderStatusError} If trying to update shipping address when not allowed.
   * @throws {CannotUpdatePaymentInfoForOrderStatusError} If trying to update payment info when not allowed.
   * @throws {CannotUpdateProductsForOrderStatusError} If trying to update products when not allowed.
   */
  updateOrderDetails(params: {
    updatedOrderStatus?: OrderStatus;
    updatedCustomer?: Customer;
    updatedShippingAddress?: ShippingAddress;
    newOrderProducts?: OrderProductWrite[];
    updatedPaymentInfo?: OrderPaymentInfo;
  }) {
    const {
      updatedCustomer,
      newOrderProducts,
      updatedOrderStatus,
      updatedPaymentInfo,
      updatedShippingAddress,
    } = params;

    const currentOrderStatus = this.orderStatus.clone();

    if (updatedOrderStatus) {
      OrderWrite.ensureOrderStatusTransition({
        currentOrderStatus,
        nextOrderStatus: updatedOrderStatus,
      });
      this.orderStatus = updatedOrderStatus;
    }

    if (updatedCustomer) {
      OrderWrite.ensureCanUpdateCustomer({ currentOrderStatus });
      this.customer = updatedCustomer.clone();
    }

    if (updatedShippingAddress) {
      OrderWrite.ensureCanUpdateShippingAddress({ currentOrderStatus });
      this.shippingAddress = updatedShippingAddress.clone();
    }

    if (newOrderProducts) {
      OrderWrite.ensureCanUpdateProducts({ currentOrderStatus });
      this.orderProducts = newOrderProducts.map(OrderProductWrite.clone);
    }

    if (updatedPaymentInfo) {
      OrderWrite.ensureCanUpdatePaymentInfo({ currentOrderStatus });
      this.paymentInfo = updatedPaymentInfo.clone();
    }

    if (updatedOrderStatus && updatedPaymentInfo) {
      OrderWrite.ensureOrderStatusAndPayment({
        orderStatus: updatedOrderStatus,
        paymentStatus: updatedPaymentInfo.getPaymentStatus(),
      });
    }

    this.updatedAt = new Date();
  }

  getId(): UUID {
    return this.orderId;
  }

  getOrderStatus(): OrderStatus {
    return this.orderStatus;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  isPaid(): boolean {
    return this.paymentInfo.isPaid();
  }

  isExpired(): boolean {
    return this.paymentInfo.isExpired();
  }

  evaluateFinalAmount(): NonNegativeInteger {
    const { orderProducts } = this.toPrimitives();

    let totalAmount = 0;

    orderProducts.forEach((product) => {
      let totalProductItems = 0;

      product.productVariants.forEach((variant) => {
        variant.variantSizes.forEach((variantSize) => {
          totalProductItems += variantSize.quantity;
        });
      });

      totalAmount += product.unitPrice * totalProductItems;
    });

    return new NonNegativeInteger(totalAmount);
  }

  setPaymentAt(date: Date): void {
    const newPaymentInfo = new OrderPaymentInfo({
      paymentStatus: this.paymentInfo.getPaymentStatus(),
      paymentDeadline: this.paymentInfo.getPaymentDeadline(),
      paymentAt: new Date(date),
    });

    const currentOrderStatus = this.orderStatus.clone();
    OrderWrite.ensureCanUpdatePaymentInfo({ currentOrderStatus });
    OrderWrite.ensureOrderStatusAndPayment({
      orderStatus: currentOrderStatus,
      paymentStatus: newPaymentInfo.getPaymentStatus(),
    });

    this.paymentInfo = newPaymentInfo;
    this.updatedAt = new Date();
  }

  setProducts(orderProducts: OrderProductWrite[]): void {
    OrderWrite.ensureCanUpdateProducts({
      currentOrderStatus: this.orderStatus,
    });
    this.orderProducts = orderProducts.map(OrderProductWrite.clone);
    this.updatedAt = new Date();
  }

  getPaymentAt(): Date | null {
    const paymentAt = this.paymentInfo.getPaymentAt();
    return paymentAt ? new Date(paymentAt) : null;
  }

  setCustomer(newCustomer: Customer): void {
    OrderWrite.ensureCanUpdateCustomer({
      currentOrderStatus: this.orderStatus,
    });
    this.customer = newCustomer;
    this.updatedAt = new Date();
  }

  setShippingAddress(shippingAddress: ShippingAddress): void {
    OrderWrite.ensureCanUpdateShippingAddress({
      currentOrderStatus: this.orderStatus,
    });
    this.shippingAddress = shippingAddress.clone();
    this.updatedAt = new Date();
  }

  setPaymentInfo(paymentInfo: OrderPaymentInfo) {
    const currentOrderStatus = this.orderStatus.clone();

    OrderWrite.ensureCanUpdatePaymentInfo({
      currentOrderStatus,
    });

    OrderWrite.ensureOrderStatusAndPayment({
      orderStatus: currentOrderStatus,
      paymentStatus: paymentInfo.getPaymentStatus(),
    });

    this.paymentInfo = paymentInfo.clone();
    this.updatedAt = new Date();
  }

  setOrderStatusAndPaymentInfo(params: {
    updatedOrderStatus: OrderStatus;
    updatedPaymentInfo: OrderPaymentInfo;
  }): void {
    const currentOrderStatus = this.orderStatus.clone();

    OrderWrite.ensureOrderStatusTransition({
      currentOrderStatus,
      nextOrderStatus: params.updatedOrderStatus,
    });

    OrderWrite.ensureCanUpdatePaymentInfo({
      currentOrderStatus,
    });

    OrderWrite.ensureOrderStatusAndPayment({
      orderStatus: params.updatedOrderStatus,
      paymentStatus: params.updatedPaymentInfo.getPaymentStatus(),
    });

    this.orderStatus = params.updatedOrderStatus;
    this.paymentInfo = params.updatedPaymentInfo.clone();
    this.updatedAt = new Date();
  }

  getCreatorId(): UUID | undefined {
    return this.creatorDetails.getCreatorId();
  }

  getProductIds(): string[] {
    return this.orderProducts.map((product) => product.getProductId());
  }

  toPrimitives(): PrimitiveOrderWrite {
    return {
      orderId: this.orderId.getValue(),
      orderStatus: this.orderStatus.getValue(),
      customer: this.customer.toPrimitives(),
      shippingAddress: this.shippingAddress.toPrimitives(),
      orderProducts: this.orderProducts.map((product) =>
        product.toPrimitives()
      ),
      createdAt: new Date(this.createdAt),
      updatedAt: new Date(this.updatedAt),
      paymentInfo: this.paymentInfo.toPrimitives(),
      creatorDetails: this.creatorDetails.toPrimitives(),
    };
  }

  static fromPrimitives(data: PrimitiveOrderWrite): OrderWrite {
    return new OrderWrite({
      orderId: new UUID(data.orderId),
      orderStatus: new OrderStatus(data.orderStatus),
      customer: Customer.from(data.customer),
      shippingAddress: ShippingAddress.from(data.shippingAddress),
      orderProducts: data.orderProducts.map((product) =>
        OrderProductWrite.fromPrimitives(product)
      ),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      paymentInfo: OrderPaymentInfo.from(data.paymentInfo),
      creatorDetails: OrderCreatorDetails.from(data.creatorDetails),
    });
  }

  static from(data: PrimitiveOrderWrite | OrderFull): OrderWrite {
    const isFromOrderFull = data instanceof OrderFull;
    if (isFromOrderFull) {
      return this.fromOrderFull(data);
    }
    return this.fromPrimitives(data);
  }
}
