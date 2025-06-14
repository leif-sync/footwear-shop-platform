import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { OrderVariant } from "./orderVariant.js";

export class OrderProduct {
  private readonly productId: UUID;
  private readonly productName: string;
  private readonly unitPrice: PositiveInteger;
  private readonly productVariants: OrderVariant[];

  constructor(params: {
    productId: UUID;
    productName: string;
    unitPrice: PositiveInteger;
    productVariants: OrderVariant[];
  }) {
    if (!params.productName.length) throw new Error("Invalid product name");

    this.productId = params.productId;
    this.productName = params.productName;
    this.unitPrice = params.unitPrice;
    this.productVariants = params.productVariants;
  }

  static clone(product: OrderProduct): OrderProduct {
    return new OrderProduct({
      productId: UUID.clone(product.productId),
      productName: product.productName,
      unitPrice: PositiveInteger.clone(product.unitPrice),
      productVariants: product.productVariants.map(OrderVariant.clone),
    });
  }

  getProductId() {
    return this.productId.getValue();
  }

  getProductName() {
    return this.productName;
  }

  getUnitPrice() {
    return this.unitPrice.getValue();
  }

  toPrimitives() {
    return {
      productId: this.productId.getValue(),
      productName: this.productName,
      unitPrice: this.unitPrice.getValue(),
      productVariants: this.productVariants.map((variant) =>
        variant.toPrimitives()
      ),
    };
  }
}
