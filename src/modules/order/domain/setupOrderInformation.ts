import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Customer } from "./customer.js";
import { InvalidProductError } from "./errors/invalidProductError.js";
import { OrderCreatorDetails } from "./orderCreatorDetails.js";
import { OrderPaymentInfo } from "./orderPaymentInfo.js";
import { OrderProductWrite } from "./orderProductWrite.js";
import { OrderStatus } from "./orderStatus.js";
import { OrderVariantWrite } from "./orderVariantWrite.js";
import { OrderWrite } from "./orderWrite.js";
import { ProductUpdater } from "./productUpdater.js";
import { ShippingAddress } from "./shippingAddress.js";

export interface OrderItem {
  productId: UUID;
  productVariants: OrderVariantWrite[];
}

export function setupOrderInformation(params: {
  productUpdaters: ProductUpdater[];
  customer: Customer;
  shippingAddress: ShippingAddress;
  creatorDetails: OrderCreatorDetails;
  orderStatus: OrderStatus;
  paymentInfo: OrderPaymentInfo;
  orderProducts: OrderItem[];
}) {
  const {
    productUpdaters,
    customer,
    shippingAddress,
    creatorDetails,
    orderStatus,
    paymentInfo,
  } = params;

  const orderProducts = params.orderProducts.map((orderProduct) => {
    const productId = orderProduct.productId;

    const productUpdater = productUpdaters.find((updater) =>
      productId.equals(updater.getProductId())
    );

    if (!productUpdater) throw new InvalidProductError({ productId });

    return new OrderProductWrite({
      productId,
      productVariants: orderProduct.productVariants,
      unitPrice: new PositiveInteger(productUpdater.getUnitPrice()),
    });
  });

  const order = new OrderWrite({
    orderId: UUID.generateRandomUUID(),
    customer,
    shippingAddress,
    creatorDetails,
    orderStatus,
    paymentInfo,
    orderProducts,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  params.orderProducts.forEach((orderProduct) => {
    orderProduct.productVariants.forEach((orderVariant) => {
      orderVariant.toPrimitives().variantSizes.forEach((variantSize) => {
        const productUpdater = productUpdaters.find((updater) =>
          orderProduct.productId.equals(updater.getProductId())
        );

        if (!productUpdater) {
          throw new InvalidProductError({
            productId: orderProduct.productId,
          });
        }

        productUpdater.subtractStockForVariant({
          variantId: new UUID(orderVariant.getVariantId()),
          sizeValue: new PositiveInteger(variantSize.sizeValue),
          stockToSubtract: new PositiveInteger(variantSize.quantity),
        });
      });
    });
  });

  return order;
}
