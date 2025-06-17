import { UUID } from "../../shared/domain/UUID.js";
import {
  OrderVariantSize,
  PrimitiveOrderVariantSize,
} from "./orderVariantSize.js";

export interface PrimitiveOrderVariantWrite {
  variantId: string;
  variantSizes: PrimitiveOrderVariantSize[];
}

export class OrderVariantWrite {
  private readonly variantId: UUID;
  private readonly variantSizes: OrderVariantSize[];

  constructor(params: { variantId: UUID; variantSizes: OrderVariantSize[] }) {
    this.variantId = UUID.clone(params.variantId);
    this.variantSizes = params.variantSizes.map(OrderVariantSize.clone);
  }

  static clone(variant: OrderVariantWrite): OrderVariantWrite {
    return new OrderVariantWrite({
      variantId: variant.variantId,
      variantSizes: variant.variantSizes,
    });
  }

  getVariantId() {
    return this.variantId.getValue();
  }

  toPrimitives(): PrimitiveOrderVariantWrite {
    return {
      variantId: this.variantId.getValue(),
      variantSizes: this.variantSizes.map((variantSize) =>
        variantSize.toPrimitives()
      ),
    };
  }
}
