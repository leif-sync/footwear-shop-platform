import { ProductRepository } from "../../product/domain/productRepository.js";
import { AppUrl } from "../../shared/domain/appUrl.js";
import { Specification } from "../../shared/domain/specification.js";
import { Email } from "../../shared/domain/email.js";
import { HexColor } from "../../shared/domain/hexColor.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Customer } from "../domain/customer.js";
import { OrderFull } from "../domain/orderFull.js";
import { OrderNotFoundError } from "../domain/errors/orderNotFoundError.js";
import { OrderOverview } from "../domain/orderOverview.js";
import { OrderProduct } from "../domain/orderProduct.js";
import { OrderVariant } from "../domain/orderVariant.js";
import {
  orderFilterCriteria,
  OrderRepository,
} from "../domain/orderRepository.js";
import { OrderStatus } from "../domain/orderStatus.js";
import { OrderWrite } from "../domain/orderWrite.js";
import { ShippingAddress } from "../domain/shippingAddress.js";
import { AppImage } from "../../shared/domain/AppImage.js";
import { OrderPaymentInfo } from "../domain/orderPaymentInfo.js";
import { OrderPaymentStatus } from "../domain/orderPaymentStatus.js";
import { OrderVariantSize } from "../domain/orderVariantSize.js";
import { OrderCreatorDetails } from "../domain/orderCreatorDetails.js";
import { OrderCreator } from "../domain/orderCreator.js";
import { Phone } from "../../shared/domain/phone.js";
import { InvalidProductError } from "../domain/errors/invalidProductError.js";
import { InvalidVariantError } from "../domain/errors/invalidVariantError.js";
import { SmartOmit } from "../../shared/domain/helperTypes.js";

function orderStatusCriteria(orderStatus: OrderStatus) {
  const filter = (order: OrderWrite) =>
    orderStatus.equals(order.getOrderStatus());

  return new Specification(filter);
}

function orderPaymentStatusCriteria(orderPaymentStatus: OrderPaymentStatus) {
  const filter = (order: OrderWrite) =>
    orderPaymentStatus.equals(order.getPaymentStatus());

  return new Specification(filter);
}

function creatorCriteria(creator: OrderCreator) {
  const filter = (order: OrderWrite) =>
    order.toPrimitives().creatorDetails.creator === creator.getValue();

  return new Specification(filter);
}

function customerEmailCriteria(customerEmail: Email) {
  const filter = (order: OrderWrite) =>
    order.toPrimitives().customer.email === customerEmail.getValue();

  return new Specification(filter);
}

type findAndCreateOrderProductParams = {
  productId: string;
  unitPrice: number;
  productVariants: {
    variantId: string;
    variantSizes: {
      quantity: number;
      sizeValue: number;
    }[];
  }[];
};

export class InMemoryOrderRepository implements OrderRepository {
  private readonly productRepository: ProductRepository;
  private orders: OrderWrite[] = [];

  constructor(params: { productRepository: ProductRepository }) {
    this.productRepository = params.productRepository;
  }

  async checkIfOrderExists(params: { orderId: UUID }): Promise<boolean> {
    const { orderId } = params;

    const orderExists = this.orders.some((order) =>
      orderId.equals(order.getId())
    );
    return orderExists;
  }

  async create(params: { order: OrderWrite }): Promise<void> {
    const { order } = params;

    this.orders.push(order);
  }

  private aggregateCriteria<T, U>(params: {
    data: T | T[];
    criteriaToAdd: (T: T) => Specification<U>;
    criteria: Specification<U>;
  }) {
    if (Array.isArray(params.data) && params.data.length === 0) {
      throw new Error("Data must be an array with at least one element");
    }

    const arr = Array.isArray(params.data) ? params.data : [params.data];

    let initialCriteria = params.criteriaToAdd(arr[0]);
    arr.forEach((data, index) => {
      if (index === 0) return;
      initialCriteria = initialCriteria.or(params.criteriaToAdd(data));
    });
    return params.criteria.and(initialCriteria);
  }

  async listOrderOverviews(
    params: orderFilterCriteria
  ): Promise<OrderOverview[]> {
    const { limit, offset, orderStatus, paymentStatus, customerEmail } = params;

    const ordersClone = this.orders.map(OrderWrite.clone);
    let filters = new Specification<OrderWrite>(() => true);

    if (orderStatus) {
      filters = this.aggregateCriteria({
        data: orderStatus,
        criteriaToAdd: orderStatusCriteria,
        criteria: filters,
      });
    }

    if (paymentStatus) {
      filters = this.aggregateCriteria({
        data: paymentStatus,
        criteriaToAdd: orderPaymentStatusCriteria,
        criteria: filters,
      });
    }

    if (customerEmail) {
      filters = this.aggregateCriteria({
        data: customerEmail,
        criteriaToAdd: customerEmailCriteria,
        criteria: filters,
      });
    }

    const filteredOrders = ordersClone
      .filter(filters.isSatisfiedBy)
      .slice(offset.getValue(), offset.getValue() + limit.getValue());

    return filteredOrders.map(
      (order) =>
        new OrderOverview({
          orderId: new UUID(order.getId()),
          orderStatus: new OrderStatus(order.getOrderStatus()),
          customerEmail: new Email(order.toPrimitives().customer.email),
          totalAmount: new PositiveInteger(order.evaluateFinalAmount()),
          createdAt: order.getCreatedAt(),
          updatedAt: order.getUpdatedAt(),
          paymentStatus: new OrderPaymentStatus(
            order.toPrimitives().paymentInfo.paymentStatus
          ),
        })
    );
  }

  async countStoredOrders(
    params: SmartOmit<orderFilterCriteria, "limit" | "offset">
  ): Promise<NonNegativeInteger> {
    const { orderStatus, paymentStatus, customerEmail } = params;

    let filters = new Specification<OrderWrite>(() => true);

    if (orderStatus) {
      filters = this.aggregateCriteria({
        data: orderStatus,
        criteriaToAdd: orderStatusCriteria,
        criteria: filters,
      });
    }

    if (paymentStatus) {
      filters = this.aggregateCriteria({
        data: paymentStatus,
        criteriaToAdd: orderPaymentStatusCriteria,
        criteria: filters,
      });
    }

    if (customerEmail) {
      filters = this.aggregateCriteria({
        data: customerEmail,
        criteriaToAdd: customerEmailCriteria,
        criteria: filters,
      });
    }

    const filteredOrdersCount = this.orders.filter(
      filters.isSatisfiedBy
    ).length;

    return new NonNegativeInteger(filteredOrdersCount);
  }

  async update(params: { order: OrderWrite }): Promise<void>;
  async update(params: { orders: OrderWrite[] }): Promise<void>;
  async update(params: {
    order?: OrderWrite;
    orders?: OrderWrite[];
  }): Promise<void> {
    const ordersToUpdate = params.orders ?? [params.order!];

    ordersToUpdate.forEach((orderToUpdate) => {
      const orderId = orderToUpdate.getId();

      const orderIndex = this.orders.findIndex(
        (existingOrder) => existingOrder.getId() === orderId
      );

      if (orderIndex === -1) throw new OrderNotFoundError({ orderId });

      this.orders[orderIndex] = orderToUpdate;
    });
  }

  private findAndCreateOrderProduct = async (
    orderProduct: findAndCreateOrderProductParams
  ) => {
    const {
      productId,
      unitPrice,
      productVariants: orderVariants,
    } = orderProduct;

    const productFound = await this.productRepository.find({
      productId: new UUID(productId),
    });

    if (!productFound) {
      throw new Error(
        "Product not found, this should never happen, check the data consistency"
      );
    }

    const { variants } = productFound.toPrimitives();

    const productVariantsFound = orderVariants.map((orderVariant) => {
      const variantFound = variants.find(
        (variant) => variant.variantId === orderVariant.variantId
      );

      if (!variantFound) {
        throw new Error(
          "Product variant not found, this should never happen, check the data consistency"
        );
      }

      const variantSizes = orderVariant.variantSizes.map((variantSize) => {
        const sizeValue = variantFound.sizes.find(
          (size) => size.sizeValue === variantSize.sizeValue
        );

        if (!sizeValue) {
          throw new Error(
            "Product size not found, this should never happen, check the data consistency"
          );
        }

        return new OrderVariantSize({
          quantity: new PositiveInteger(variantSize.quantity),
          sizeValue: new PositiveInteger(variantSize.sizeValue),
        });
      });

      const orderImage = new AppImage({
        imageAlt: variantFound.images[0].imageAlt,
        imageUrl: new AppUrl(variantFound.images[0].imageUrl),
      });

      return new OrderVariant({
        variantId: new UUID(orderVariant.variantId),
        hexColor: new HexColor(variantFound.hexColor),
        image: orderImage,
        variantSizes,
      });
    });

    return new OrderProduct({
      productId: new UUID(productId),
      productName: productFound.getName(),
      unitPrice: new PositiveInteger(unitPrice),
      productVariants: productVariantsFound,
    });
  };

  async find(params: { orderId: UUID }): Promise<OrderFull | null> {
    const { orderId } = params;

    const order = this.orders.find((order) => orderId.equals(order.getId()));
    if (!order) return null;

    const orderPrimitives = order.toPrimitives();

    const productsPromises = orderPrimitives.orderProducts.map(
      this.findAndCreateOrderProduct
    );

    const products = await Promise.all(productsPromises);

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

    const paymentInfo = new OrderPaymentInfo({
      paymentDeadline: orderPrimitives.paymentInfo.paymentDeadline,
      paymentStatus: new OrderPaymentStatus(
        orderPrimitives.paymentInfo.paymentStatus
      ),
      paymentAt: orderPrimitives.paymentInfo.paymentAt,
    });

    const creatorDetails = new OrderCreatorDetails({
      orderCreator: new OrderCreator(orderPrimitives.creatorDetails.creator),
      creatorId: orderPrimitives.creatorDetails.creatorId
        ? new UUID(orderPrimitives.creatorDetails.creatorId)
        : undefined,
    });

    return new OrderFull({
      orderId: UUID.clone(orderId),
      orderStatus: new OrderStatus(orderPrimitives.orderStatus),
      customer,
      shippingAddress,
      createdAt: orderPrimitives.createdAt,
      updatedAt: orderPrimitives.updatedAt,
      products,
      paymentInfo,
      creatorDetails,
    });
  }

  async listOrderWrites(params: {
    limit?: PositiveInteger;
    offset?: NonNegativeInteger;
    orderStatus?: OrderStatus | OrderStatus[];
    paymentStatus?: OrderPaymentStatus | OrderPaymentStatus[];
    creator?: OrderCreator | OrderCreator[];
  }): Promise<OrderWrite[]> {
    const { limit, offset, orderStatus, paymentStatus, creator } = params;

    const ordersClone = this.orders.map(OrderWrite.clone);
    let filters = new Specification<OrderWrite>(() => true);

    if (orderStatus) {
      filters = this.aggregateCriteria({
        data: orderStatus,
        criteriaToAdd: orderStatusCriteria,
        criteria: filters,
      });
    }

    if (paymentStatus) {
      filters = this.aggregateCriteria({
        data: paymentStatus,
        criteriaToAdd: orderPaymentStatusCriteria,
        criteria: filters,
      });
    }

    if (creator) {
      filters = this.aggregateCriteria({
        data: creator,
        criteriaToAdd: creatorCriteria,
        criteria: filters,
      });
    }

    const offsetValue = offset?.getValue() ?? 0;
    const limitValue = limit?.getValue() ?? ordersClone.length;

    const filteredOrders = ordersClone
      .filter(filters.isSatisfiedBy)
      .slice(offsetValue, offsetValue + limitValue);

    return filteredOrders;
  }

  async delete(params: { orderId: UUID }): Promise<void>;
  async delete(params: { orderIds: UUID[] }): Promise<void>;
  async delete(params: { orderId?: UUID; orderIds?: UUID[] }): Promise<void> {
    const orderIdsToDelete = params.orderIds ?? [params.orderId!];

    orderIdsToDelete.forEach((orderId) => {
      const orderIndex = this.orders.findIndex((existingOrder) =>
        orderId.equals(existingOrder.getId())
      );

      if (orderIndex === -1) throw new OrderNotFoundError({ orderId });

      this.orders.splice(orderIndex, 1);
    });
  }

  async checkIfProductIsBought(params: { productId: UUID }): Promise<boolean> {
    const { productId } = params;
    let isProductFound = false;

    this.orders.forEach((order) => {
      const { orderProducts } = order.toPrimitives();

      const productFound = orderProducts.find((product) =>
        productId.equals(product.productId)
      );

      if (!productFound) throw new InvalidProductError({ productId });
      isProductFound = true;
    });

    return isProductFound;
  }

  async checkIfVariantIsBought(params: {
    productId: UUID;
    variantId: UUID;
  }): Promise<boolean> {
    const { productId, variantId } = params;

    let isVariantFound = false;

    this.orders.forEach((order) => {
      const { orderProducts } = order.toPrimitives();

      const productFound = orderProducts.find((product) =>
        productId.equals(product.productId)
      );

      if (!productFound) {
        throw new InvalidProductError({
          productId,
        });
      }

      const variantFound = productFound.productVariants.find((variant) =>
        variantId.equals(variant.variantId)
      );

      if (!variantFound) throw new InvalidVariantError({ variantId });
      isVariantFound = true;
    });

    return isVariantFound;
  }
}
