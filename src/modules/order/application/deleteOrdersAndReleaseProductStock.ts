import { UUID } from "../../shared/domain/UUID.js";
import { OrderAssociatedDataProvider } from "../domain/associatedDataProvider.js";
import { OrderRepository } from "../domain/orderRepository.js";
import { ProductUpdater } from "../domain/productUpdater.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { OrderWrite } from "../domain/orderWrite.js";
import { OrderStatus } from "../domain/orderStatus.js";
import { OrderPaymentStatus } from "../domain/orderPaymentStatus.js";

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

  async run() {
    const ordersPaymentExpired = await this.orderRepository.listOrderWrites({
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

  private validateAndUpdateProductVariants(
    orderProduct: orderProduct,
    productUpdaters: Map<string, ProductUpdater>
  ) {
    const productUpdater = productUpdaters.get(orderProduct.productId);
    if (!productUpdater) throw new Error("Product updater not found");

    orderProduct.variants.forEach((orderVariant) => {
      this.validateAndUpdateVariantSizes(orderVariant, productUpdater);
    });
  }

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
