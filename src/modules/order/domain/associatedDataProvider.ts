import { UUID } from "../../shared/domain/UUID.js";
import { ProductUpdater } from "./productUpdater.js";

export abstract class OrderAssociatedDataProvider {
  abstract retrieveProductUpdaters(
    productIds: UUID[]
  ): Promise<ProductUpdater[]>;
  abstract applyProductUpdaters(updaters: ProductUpdater[]): Promise<void>;
  abstract checkAdminExistence(params: { adminId: UUID }): Promise<boolean>;
}
