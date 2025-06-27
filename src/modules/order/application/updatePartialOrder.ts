import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { OrderAssociatedDataProvider } from "../domain/associatedDataProvider.js";
import { Customer } from "../domain/customer.js";
import { InvalidProductError } from "../domain/errors/invalidProductError.js";
import { InvalidVariantError } from "../domain/errors/invalidVariantError.js";
import { OrderNotFoundError } from "../domain/errors/orderNotFoundError.js";
import { SizeNotAvailableForVariantError } from "../domain/errors/sizeNotAvailableForVariantError.js";
import { OrderPaymentInfo } from "../domain/orderPaymentInfo.js";
import { OrderRepository } from "../domain/orderRepository.js";
import { OrderStatus } from "../domain/orderStatus.js";
import { OrderTransactionManager } from "../domain/orderTransactionManager.js";
import { OrderWrite } from "../domain/orderWrite.js";
import { ProductUpdater } from "../domain/productUpdater.js";
import { ShippingAddress } from "../domain/shippingAddress.js";

export interface updateOrderParams {
  orderId: UUID;
  customer?: Customer;
  shippingAddress?: ShippingAddress;
  orderStatus?: OrderStatus;
  paymentInfo?: OrderPaymentInfo;
}

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

  /**
   * Executes the use case to update a partial order.
   * @param params - Parameters for updating the order, see {@link updateOrderParams} for details.
   * @returns A promise that resolves when the order is successfully updated.
   * @throws {OrderNotFoundError} If the order is not found.
   * @throws {InvalidProductError} If any product in the order is invalid.
   * @throws {InvalidVariantError} If any variant in the order is invalid.
   * @throws {SizeNotAvailableForVariantError} If a size is not available for a variant in the order.
   * @throws {InvalidOrderStatusTransitionError} If trying to transition to an invalid order status.
   * @throws {CannotUpdateCustomerForOrderStatusError} If trying to update customer when not allowed.
   * @throws {CannotUpdateShippingForOrderStatusError} If trying to update shipping address when not allowed.
   * @throws {CannotUpdatePaymentInfoForOrderStatusError} If trying to update payment info when not allowed.
   * @throws {CannotUpdateProductsForOrderStatusError} If trying to update products when not allowed.
   */
  async run(params: updateOrderParams): Promise<void> {
    const { orderId, orderStatus, customer, paymentInfo, shippingAddress } =
      params;

    const orderFound = await this.orderRepository.find({ orderId });
    if (!orderFound) throw new OrderNotFoundError({ orderId });

    const orderWrite = OrderWrite.from(orderFound);

    // TODO: Create a new entity to be able to update orders, since at the moment it is not possible to update orderProducts
    orderWrite.updateOrderDetails({
      updatedOrderStatus: orderStatus,
      updatedCustomer: customer,
      updatedShippingAddress: shippingAddress,
      updatedPaymentInfo: paymentInfo,
    });

    const isNewOrderStatusCanceled = orderStatus?.equals(
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
