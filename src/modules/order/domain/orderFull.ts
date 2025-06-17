import { Email } from "../../shared/domain/email.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Customer, PrimitiveCustomer } from "./customer.js";
import { OrderCreatorDetails } from "./orderCreatorDetails.js";
import { OrderPaymentInfo } from "./orderPaymentInfo.js";
import { OrderProduct } from "./orderProduct.js";
import { OrderStatus, OrderStatusOptions } from "./orderStatus.js";
import {
  PrimitiveShippingAddress,
  ShippingAddress,
} from "./shippingAddress.js";

export interface PrimitiveOrderFull {
  orderId: string;
  customer: PrimitiveCustomer;
  shippingAddress: PrimitiveShippingAddress;
  orderStatus: OrderStatusOptions;
}

export class OrderFull {
  private readonly orderId: UUID;
  private readonly customer: Customer;
  private readonly shippingAddress: ShippingAddress;
  private readonly orderStatus: OrderStatus;
  private readonly products: OrderProduct[];
  private readonly createdAt: Date;
  private readonly updatedAt: Date;
  private readonly paymentInfo: OrderPaymentInfo;
  private readonly creatorDetails: OrderCreatorDetails;

  constructor(params: {
    orderId: UUID;
    customer: Customer;
    shippingAddress: ShippingAddress;
    orderStatus: OrderStatus;
    products: OrderProduct[];
    createdAt: Date;
    updatedAt: Date;
    paymentInfo: OrderPaymentInfo;
    creatorDetails: OrderCreatorDetails;
  }) {
    this.orderId = UUID.clone(params.orderId);
    this.customer = Customer.clone(params.customer);
    this.shippingAddress = ShippingAddress.clone(params.shippingAddress);
    this.orderStatus = OrderStatus.clone(params.orderStatus);
    this.products = params.products.map(OrderProduct.clone);
    this.createdAt = new Date(params.createdAt);
    this.updatedAt = new Date(params.updatedAt);
    this.paymentInfo = OrderPaymentInfo.clone(params.paymentInfo);
    this.creatorDetails = OrderCreatorDetails.clone(params.creatorDetails);
  }

  static clone(order: OrderFull): OrderFull {
    // la copia profunda de los objetos se hace en los constructores de las clases
    return new OrderFull({
      orderId: order.orderId,
      customer: order.customer,
      shippingAddress: order.shippingAddress,
      orderStatus: order.orderStatus,
      products: order.products,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paymentInfo: order.paymentInfo,
      creatorDetails: order.creatorDetails,
    });
  }

  isPaid() {
    return this.paymentInfo.isPaid();
  }

  isPaymentExpired() {
    return this.paymentInfo.isExpired();
  }

  getPaymentDeadline() {
    return new Date(this.paymentInfo.getPaymentDeadline());
  }

  getOrderId(): UUID {
    return this.orderId;
  }

  getOrderStatus() {
    return this.orderStatus;
  }

  getCustomerData() {
    return this.customer.toPrimitives();
  }

  getShippingAddressData() {
    return this.shippingAddress.toPrimitives();
  }

  getPaymentStatus() {
    return this.paymentInfo.getPaymentStatus();
  }

  evaluateFinalAmount(): NonNegativeInteger {
    const { products } = this.toPrimitives();

    let totalAmount = 0;

    products.forEach((product) => {
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

  toPrimitives() {
    return {
      orderId: this.orderId.getValue(),
      status: this.orderStatus.getValue(),
      customer: this.customer.toPrimitives(),
      shippingAddress: this.shippingAddress.toPrimitives(),
      createdAt: new Date(this.createdAt),
      updatedAt: new Date(this.updatedAt),
      products: this.products.map((product) => product.toPrimitives()),
      paymentInfo: this.paymentInfo.toPrimitives(),
      creatorDetails: this.creatorDetails.toPrimitives(),
    };
  }

  getCustomerEmail(): Email {
    return this.customer.getEmail();
  }

  getCustomerFullName(): string {
    return this.customer.getFullName();
  }
}
