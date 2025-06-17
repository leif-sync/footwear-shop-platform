import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { OrderProduct } from "./orderProduct.js";
import { OrderVariantSize } from "./orderVariantSize.js";
import {
  OrderVariantWrite,
  PrimitiveOrderVariantWrite,
} from "./orderVariantWrite.js";

export interface PrimitiveOrderProductWrite {
  productId: string;
  unitPrice: number;
  productVariants: PrimitiveOrderVariantWrite[];
}

export class OrderProductWrite {
  private readonly productId: UUID;
  private readonly unitPrice: PositiveInteger;
  private readonly productVariants: OrderVariantWrite[];

  constructor(params: {
    productId: UUID;
    unitPrice: PositiveInteger;
    productVariants: OrderVariantWrite[];
  }) {
    this.productId = params.productId;
    this.unitPrice = params.unitPrice;
    this.productVariants = params.productVariants;
  }

  static from(product: OrderProduct) {
    const productId = new UUID(product.getProductId());
    const unitPrice = new PositiveInteger(product.getUnitPrice());

    const productVariants = product
      .toPrimitives()
      .productVariants.map((variant) => {
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
      productId,
      unitPrice,
      productVariants,
    });
  }

  getProductId() {
    return this.productId.getValue();
  }

  getUnitPrice() {
    return this.unitPrice.getValue();
  }

  static clone(product: OrderProductWrite): OrderProductWrite {
    return new OrderProductWrite({
      productId: UUID.clone(product.productId),
      unitPrice: PositiveInteger.clone(product.unitPrice),
      productVariants: product.productVariants.map(OrderVariantWrite.clone),
    });
  }

  toPrimitives(): PrimitiveOrderProductWrite {
    return {
      productId: this.productId.getValue(),
      unitPrice: this.unitPrice.getValue(),
      productVariants: this.productVariants.map((variant) =>
        variant.toPrimitives()
      ),
    };
  }
}
