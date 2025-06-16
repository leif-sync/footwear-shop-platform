import { UUID } from "../../shared/domain/UUID.js";
import { ProductUpdater } from "./productUpdater.js";

export abstract class OrderAssociatedDataProvider {
  abstract checkAdminExistence(params: { adminId: UUID }): Promise<boolean>;

  abstract retrieveProductUpdaters(params: {
    productIds: UUID[];
  }): Promise<ProductUpdater[]>;

  abstract applyProductUpdaters(params: {
    productUpdaters: ProductUpdater[];
  }): Promise<void>;

}
