import { Email } from "../../shared/domain/email.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Customer } from "./customer.js";
import { OrderFull } from "./orderFull.js";
import { OrderPaymentInfo } from "./orderPaymentInfo.js";
import {
  OrderPaymentStatus,
  orderPaymentStatusOptions,
} from "./orderPaymentStatus.js";
import { OrderVariantWrite } from "./orderVariantWrite.js";
import { OrderProductWrite } from "./orderProductWrite.js";
import { OrderStatus, orderStatusOptions } from "./orderStatus.js";
import { ShippingAddress } from "./shippingAddress.js";
import { OrderVariantSize } from "./orderVariantSize.js";
import { OrderCreatorDetails } from "./orderCreatorDetails.js";
import { OrderCreator } from "./orderCreator.js";
import { Phone } from "../../shared/domain/phone.js";

const validPaymentStatusForOrderStatus = new Map<string, string[]>([
  [
    orderStatusOptions.WAITING_FOR_PAYMENT,
    [
      orderPaymentStatusOptions.PENDING,
      orderPaymentStatusOptions.IN_PAYMENT_GATEWAY,
      orderPaymentStatusOptions.EXPIRED,
    ],
  ],
  [orderStatusOptions.WAITING_FOR_SHIPMENT, [orderPaymentStatusOptions.PAID]],
  [orderStatusOptions.SHIPPED, [orderPaymentStatusOptions.PAID]],
  [orderStatusOptions.DELIVERED, [orderPaymentStatusOptions.PAID]],
  [orderStatusOptions.CANCELED, [orderPaymentStatusOptions.REFUNDED]],
  [orderStatusOptions.RETURNED, [orderPaymentStatusOptions.REFUNDED]],
]);

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
    this.orderId = UUID.clone(params.orderId);
    this.customer = Customer.clone(params.customer);
    this.orderStatus = OrderStatus.clone(params.orderStatus);
    this.shippingAddress = ShippingAddress.clone(params.shippingAddress);
    this.orderProducts = params.orderProducts.map(OrderProductWrite.clone);
    this.createdAt = new Date(params.createdAt);
    this.updatedAt = new Date(params.updatedAt);
    this.paymentInfo = OrderPaymentInfo.clone(params.paymentInfo);
    this.creatorDetails = OrderCreatorDetails.clone(params.creatorDetails);

    this.ensureIsValid();
  }

  ensureIsValid() {
    const validPaymentStatus = validPaymentStatusForOrderStatus.get(
      this.orderStatus.getValue()
    );

    if (!validPaymentStatus) {
      throw new Error("Invalid order status for payment status");
    }

    const paymentStatus = this.paymentInfo.getPaymentStatus();

    if (!validPaymentStatus.includes(paymentStatus)) {
      throw new Error(
        `Invalid payment status ${paymentStatus} for order status ${this.orderStatus.getValue()}`
      );
    }
  }

  static clone(order: OrderWrite): OrderWrite {
    // la copia profunda de los objetos se hace en los constructores de las clases
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

  static from(order: OrderFull) {
    const orderId = new UUID(order.getOrderId());
    const orderPrimitives = order.toPrimitives();
    const orderStatus = new OrderStatus(orderPrimitives.status);
    const customer = new Customer({
      email: new Email(orderPrimitives.customer.email),
      firstName: orderPrimitives.customer.firstName,
      lastName: orderPrimitives.customer.lastName,
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
          ? new UUID(orderPrimitives.creatorDetails.creatorId)
          : undefined,
      }),
    });
  }

  setPaymentStatus(paymentStatus: OrderPaymentStatus) {
    this.paymentInfo.setPaymentStatus(paymentStatus);
    this.ensureIsValid();
  }

  getPaymentStatus() {
    return this.paymentInfo.getPaymentStatus();
  }

  setOrderStatus(orderStatus: OrderStatus) {
    this.orderStatus = OrderStatus.clone(orderStatus);
    this.ensureIsValid();
  }

  updateOrderDetails(params: {
    orderStatus?: OrderStatus;
    customer?: Customer;
    shippingAddress?: ShippingAddress;
    orderProducts?: OrderProductWrite[];
    paymentInfo?: OrderPaymentInfo;
  }) {
    if (params.orderStatus) {
      this.orderStatus = OrderStatus.clone(params.orderStatus);
    }

    if (params.customer) {
      this.setCustomer(params.customer);
    }

    if (params.shippingAddress) {
      this.setShippingAddress(params.shippingAddress);
    }

    if (params.orderProducts) {
      this.setProducts(params.orderProducts);
    }

    if (params.paymentInfo) {
      this.paymentInfo = OrderPaymentInfo.clone(params.paymentInfo);
    }

    this.updatedAt = new Date();

    this.ensureIsValid();
  }

  getId() {
    return this.orderId.getValue();
  }

  getOrderStatus() {
    return this.orderStatus.getValue();
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }

  isPaid() {
    return this.paymentInfo.isPaid();
  }

  isExpired() {
    return this.paymentInfo.isExpired();
  }

  evaluateFinalAmount() {
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

    return totalAmount;
  }

  setPaymentAt(date: Date) {
    this.paymentInfo.setPaymentAt(date);
    this.ensureIsValid();
  }

  setProducts(orderProducts: OrderProductWrite[]) {
    this.orderProducts = orderProducts.map(OrderProductWrite.clone);
  }

  getPaymentAt() {
    return this.paymentInfo.getPaymentAt();
  }

  setCustomer(customer: Customer) {
    this.customer = Customer.clone(customer);
  }

  setShippingAddress(shippingAddress: ShippingAddress) {
    this.shippingAddress = ShippingAddress.clone(shippingAddress);
  }

  setPaymentInfo(paymentInfo: OrderPaymentInfo) {
    this.paymentInfo = OrderPaymentInfo.clone(paymentInfo);
    this.ensureIsValid();
  }

  setOrderStatusAndPaymentInfo(params: {
    orderStatus: OrderStatus;
    paymentInfo: OrderPaymentInfo;
  }) {
    this.orderStatus = OrderStatus.clone(params.orderStatus);
    this.paymentInfo = OrderPaymentInfo.clone(params.paymentInfo);
    this.ensureIsValid();
  }

  toPrimitives() {
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
}
