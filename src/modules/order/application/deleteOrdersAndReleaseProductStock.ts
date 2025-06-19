import { UUID } from "../../shared/domain/UUID.js";
import { OrderAssociatedDataProvider } from "../domain/associatedDataProvider.js";
import { OrderRepository } from "../domain/orderRepository.js";
import { ProductUpdater } from "../domain/productUpdater.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { OrderWrite } from "../domain/orderWrite.js";
import { OrderStatus } from "../domain/orderStatus.js";
import { OrderPaymentStatus } from "../domain/orderPaymentStatus.js";
import { InvalidProductError } from "../domain/errors/invalidProductError.js";

type orderProduct = {
  productId: string;
  variants: {
    variantId: string;
    variantSizes: {
      sizeValue: number;
      quantity: number;
    }[];
  }[];
};

export class DeleteOrderAndReleaseProductsStock {
  private readonly orderRepository: OrderRepository;
  private readonly orderAssociatedDataProvider: OrderAssociatedDataProvider;

  constructor(params: {
    orderRepository: OrderRepository;
    orderAssociatedDataProvider: OrderAssociatedDataProvider;
  }) {
    this.orderRepository = params.orderRepository;
    this.orderAssociatedDataProvider = params.orderAssociatedDataProvider;
  }

  /**
   * Deletes orders that have expired payment status and releases the stock of their associated products.
   * It aggregates the order products, retrieves product updaters, validates and updates product variants,
   * and finally applies the product updaters to release the stock.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   * @throws {InvalidProductError} If there are duplicate products in the repository.
   * @throws {InvalidVariantError} If a variant is not found in the product updater.
   * @throws {SizeNotAvailableForVariantError} If a size is not available for a variant in the product updater.
   */
  async run(): Promise<void> {
    const ordersPaymentExpired = await this.orderRepository.listAllOrders({
      orderStatus: OrderStatus.create.waitingForPayment(),
      paymentStatus: OrderPaymentStatus.create.expired(),
    });

    const orderProductsMap = new Map<string, orderProduct>();

    ordersPaymentExpired.forEach((order) => {
      this.aggregateOrderProducts(order, orderProductsMap);
    });

    const orderProductIdsArray = Array.from(orderProductsMap.keys());
    const orderProductIds = orderProductIdsArray.map((id) => new UUID(id));

    const productUpdatersMap =
      await this.retrieveProductUpdatersMap(orderProductIds);

    orderProductsMap.forEach((orderProduct) => {
      this.validateAndUpdateProductVariants(orderProduct, productUpdatersMap);
    });

    const productUpdaterList = Array.from(productUpdatersMap.values());
    await this.orderAssociatedDataProvider.applyProductUpdaters({
      productUpdaters: productUpdaterList,
    });

    const orderIds = ordersPaymentExpired.map((order) => order.getId());

    await this.orderRepository.delete({ orderId: orderIds });
  }

  private async retrieveProductUpdatersMap(orderProductIds: UUID[]) {
    const productUpdaters =
      await this.orderAssociatedDataProvider.retrieveProductUpdaters({
        productIds: orderProductIds,
      });

    const productUpdatersMap = new Map<string, ProductUpdater>();
    productUpdaters.forEach((productUpdater) => {
      const productId = productUpdater.getProductId();
      const isProductUpdaterPresent = productUpdatersMap.has(productId);
      if (isProductUpdaterPresent) {
        throw new Error("Product updater already exists");
      }
      productUpdatersMap.set(productId, productUpdater);
    });

    return productUpdatersMap;
  }

  /**
   * Validates and updates the product variants for a specific order product.
   * @param orderProduct - The order product to validate and update.
   * @param productUpdaters - A map of product updaters keyed by product ID.
   * @throws {InvalidProductError} - If the product updater is not found for the given product ID.
   * @throws {InvalidVariantError} - If a variant is not found in the product updater.
   * @throws {SizeNotAvailableForVariantError} - If a size is not available
   */
  private validateAndUpdateProductVariants(
    orderProduct: orderProduct,
    productUpdaters: Map<string, ProductUpdater>
  ) {
    const productUpdater = productUpdaters.get(orderProduct.productId);
    if (!productUpdater) throw new InvalidProductError({ productId: orderProduct.productId });

    orderProduct.variants.forEach((orderVariant) => {
      this.validateAndUpdateVariantSizes(orderVariant, productUpdater);
    });
  }

  /**
   * Validates and updates the variant sizes for a specific order variant.
   * @param orderVariant - The order variant to validate and update.
   * @param productUpdater - The product updater to apply the changes.
   * @throws {InvalidVariantError} - If the variant is not found in the product updater.
   * @throws {SizeNotAvailableForVariantError} - If a size is not available
   */
  private validateAndUpdateVariantSizes(
    orderVariant: orderProduct["variants"][number],
    productUpdater: ProductUpdater
  ) {
    const variantId = new UUID(orderVariant.variantId);

    orderVariant.variantSizes.forEach((orderVariantSize) => {
      const sizeValue = new PositiveInteger(orderVariantSize.sizeValue);
      const quantity = new PositiveInteger(orderVariantSize.quantity);

      productUpdater.addStockForVariant({
        variantId,
        stockToAdd: quantity,
        sizeValue,
      });
    });
  }

  private aggregateOrderProducts(
    order: OrderWrite,
    products: Map<string, orderProduct>
  ) {
    const orderPrimitives = order.toPrimitives();

    orderPrimitives.orderProducts.forEach((orderProduct) => {
      const { productId } = orderProduct;
      const { productVariants } = orderProduct;

      const productFound = products.get(productId);
      if (!productFound) {
        return products.set(productId, {
          productId,
          variants: productVariants,
        });
      }

      productVariants.forEach((variant) => {
        const variantFound = productFound.variants.find(
          (variantFound) => variantFound.variantId === variant.variantId
        );

        if (!variantFound) return productFound.variants.push(variant);

        variant.variantSizes.forEach((size) => {
          const sizeFound = variantFound.variantSizes.find(
            (matchingSize) => matchingSize.sizeValue === size.sizeValue
          );

          if (!sizeFound) return variantFound.variantSizes.push(size);

          sizeFound.quantity += size.quantity;
        });
      });
    });
  }
}
