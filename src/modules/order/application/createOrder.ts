import { Email } from "../../shared/domain/email.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Customer } from "../domain/customer.js";
import { SizeNotAvailableForVariantError } from "../domain/errors/sizeNotAvailableForVariantError.js";
import { OrderVariantWrite } from "../domain/orderVariantWrite.js";
import { OrderProductWrite } from "../domain/orderProductWrite.js";
import { OrderStatus, orderStatusOptions } from "../domain/orderStatus.js";
import { OrderWrite } from "../domain/orderWrite.js";
import { ShippingAddress } from "../domain/shippingAddress.js";
import { OrderPaymentInfo } from "../domain/orderPaymentInfo.js";
import {
  OrderPaymentStatus,
  orderPaymentStatusOptions,
} from "../domain/orderPaymentStatus.js";
import { InvalidVariantError } from "../domain/errors/invalidVariantError.js";
import { NotEnoughStockError } from "../domain/errors/notEnoughStockError.js";
import { InvalidProductError } from "../domain/errors/invalidProductError.js";
import { OrderAssociatedDataProvider } from "../domain/associatedDataProvider.js";
import { ProductUpdater } from "../domain/productUpdater.js";
import { OrderTransactionManager } from "../domain/orderTransactionManager.js";
import { OrderVariantSize } from "../domain/orderVariantSize.js";
import { Phone } from "../../shared/domain/phone.js";
import { OrderCreatorDetails } from "../domain/orderCreatorDetails.js";
import { InvalidCreatorError } from "../domain/errors/invalidCreatorError.js";
import { PAYMENT_TIMEOUT_SECONDS } from "../../../environmentVariables.js";
import { OrderCreator } from "../domain/orderCreator.js";

type customer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type shippingAddress = {
  region: string;
  commune: string;
  streetName: string;
  streetNumber: string;
  additionalInfo?: string;
};

type orderProduct = {
  productId: string;
  productVariants: {
    variantId: string;
    variantSizes: {
      quantity: number;
      sizeValue: number;
    }[];
  }[];
};

type createOrderParams = {
  customer: customer;
  shippingAddress: shippingAddress;
  orderProducts: orderProduct[];
};

type createOrderForUserParams = createOrderParams;

type createOrderForAdminParams = createOrderParams & {
  orderStatus: orderStatusOptions;
  creatorDetails: {
    creatorId: string;
  };
  paymentInfo: {
    paymentStatus: orderPaymentStatusOptions;
    paymentAt: Date | null;
    paymentDeadline: Date;
  };
};

export class CreateOrder {
  private readonly associatedDataProvider: OrderAssociatedDataProvider;
  private readonly orderTransactionManager: OrderTransactionManager;

  constructor(params: {
    orderAssociatedDataProvider: OrderAssociatedDataProvider;
    orderTransactionManager: OrderTransactionManager;
  }) {
    const {
      orderAssociatedDataProvider: associatedDataProvider,
      orderTransactionManager: transactionManager,
    } = params;
    this.associatedDataProvider = associatedDataProvider;
    this.orderTransactionManager = transactionManager;
  }

  private createAndValidateOrderVariant(params: {
    orderVariant: createOrderForAdminParams["orderProducts"][number]["productVariants"][number];
    productUpdater: ProductUpdater;
    decrementStock: boolean;
  }) {
    const { orderVariant, productUpdater: productSales } = params;

    // validate if variant exists
    const variantId = new UUID(orderVariant.variantId);
    const isVariantPresent = productSales.hasVariant({ variantId });
    if (!isVariantPresent) throw new InvalidVariantError({ variantId });

    const variantSizes = orderVariant.variantSizes.map((variantSize) => {
      // validate if variant has size
      const sizeValue = new PositiveInteger(variantSize.sizeValue);
      const isSizePresent = productSales.hasSizeForVariant({
        variantId,
        sizeValue,
      });
      if (!isSizePresent) {
        throw new SizeNotAvailableForVariantError({
          variantId,
          sizeValue: variantSize.sizeValue,
        });
      }

      const desiredStock = new PositiveInteger(variantSize.quantity);

      if (!params.decrementStock) {
        return new OrderVariantSize({
          quantity: desiredStock,
          sizeValue,
        });
      }

      // validate if variant has enough stock
      const hasEnoughStockForSize = productSales.hasEnoughStockForVariant({
        variantId,
        sizeValue,
        stockToCheck: desiredStock,
      });

      if (!hasEnoughStockForSize) {
        throw new NotEnoughStockError({
          variantId,
          sizeValue: variantSize.sizeValue,
        });
      }

      // * subtract stock -- this will be necessary when the order is created
      productSales.subtractStockForVariant({
        variantId,
        sizeValue,
        stockToSubtract: desiredStock,
      });

      return new OrderVariantSize({
        quantity: desiredStock,
        sizeValue,
      });
    });

    return new OrderVariantWrite({
      variantId,
      variantSizes,
    });
  }

  private validateOrderProduct(params: {
    orderProduct: createOrderForAdminParams["orderProducts"][number];
    existingProductsMap: Map<string, ProductUpdater>;
    decrementStock: boolean;
  }) {
    const { orderProduct, existingProductsMap, decrementStock } = params;

    // validate if product exists
    const productId = new UUID(orderProduct.productId);

    const productUpdater = existingProductsMap.get(productId.getValue());
    if (!productUpdater) throw new InvalidProductError({ productId });

    // validate if all variants of the orderProduct are valid
    const newOrderVariants = orderProduct.productVariants.map((orderVariant) =>
      this.createAndValidateOrderVariant({
        orderVariant,
        productUpdater: productUpdater,
        decrementStock,
      })
    );

    const unitPrice = new PositiveInteger(productUpdater.getUnitPrice());
    return new OrderProductWrite({
      productId,
      productVariants: newOrderVariants,
      unitPrice,
    });
  }

  async run(params: createOrderForAdminParams): Promise<{
    orderId: string;
  }>;
  async run(params: createOrderForUserParams): Promise<{
    orderId: string;
  }>;

  async run(params: createOrderForAdminParams | createOrderForUserParams) {
    const orderId = UUID.generateRandomUUID();
    const createdAt = new Date();
    const updatedAt = new Date();
    const customer = new Customer({
      email: new Email(params.customer.email),
      firstName: params.customer.firstName,
      lastName: params.customer.lastName,
      phone: new Phone(params.customer.phone),
    });
    const shippingAddress = new ShippingAddress({
      commune: params.shippingAddress.commune,
      region: params.shippingAddress.region,
      streetName: params.shippingAddress.streetName,
      streetNumber: params.shippingAddress.streetNumber,
      additionalInfo: params.shippingAddress.additionalInfo,
    });

    const isAdmin = "creatorDetails" in params;

    const orderStatus = isAdmin
      ? new OrderStatus(params.orderStatus)
      : OrderStatus.create.waitingForPayment();

    const paymentStatus = isAdmin
      ? new OrderPaymentStatus(params.paymentInfo.paymentStatus)
      : OrderPaymentStatus.create.inPaymentGateway();

    const paymentInfo = isAdmin
      ? new OrderPaymentInfo({
          paymentDeadline: params.paymentInfo.paymentDeadline,
          paymentStatus,
          paymentAt: params.paymentInfo.paymentAt,
        })
      : new OrderPaymentInfo({
          paymentDeadline: new Date(
            Date.now() + PAYMENT_TIMEOUT_SECONDS * 1000
          ),
          paymentStatus,
          paymentAt: null,
        });

    const creatorId = isAdmin
      ? new UUID(params.creatorDetails.creatorId)
      : undefined;

    if (creatorId) {
      const isValidCreator =
        await this.associatedDataProvider.checkAdminExistence({
          adminId: creatorId,
        });

      if (!isValidCreator) throw new InvalidCreatorError({ creatorId });
    }

    const creatorDetails = new OrderCreatorDetails({
      orderCreator: isAdmin
        ? OrderCreator.create.admin()
        : OrderCreator.create.guest(),
      creatorId,
    });

    const productIds = params.orderProducts.map(
      (orderProduct) => new UUID(orderProduct.productId)
    );

    const productUpdaters =
      await this.associatedDataProvider.retrieveProductUpdaters(productIds); // * se ignoran los productos que no existen

    const existingProductsMap = new Map(
      productUpdaters.map((productUpdater) => [
        productUpdater.getProductId(),
        productUpdater,
      ])
    );
 
    const decrementStock = !OrderStatus.create.canceled().equals(orderStatus);

    const orderProducts = params.orderProducts.map((orderProduct) =>
      this.validateOrderProduct({
        orderProduct,
        existingProductsMap,
        decrementStock,
      })
    );

    // Create order
    const order = new OrderWrite({
      orderId,
      orderStatus,
      createdAt,
      updatedAt,
      customer,
      shippingAddress,
      orderProducts,
      paymentInfo,
      creatorDetails,
    });

    await this.orderTransactionManager.runInTransaction(
      async (dataAccessor) => {
        const {
          transactionalAssociatedDataProvider,
          transactionalOrderRepository,
        } = dataAccessor;

        await transactionalOrderRepository.create({ order });

        await transactionalAssociatedDataProvider.applyProductUpdaters(
          productUpdaters
        );
      }
    );

    return {
      orderId: order.getId(),
    };
  }
}
