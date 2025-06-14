import { UUID } from "../../shared/domain/UUID.js";
import { PaymentOrder } from "./PaymentOrder.js";

export abstract class PaymentAssociatedDataProvider {
  /**
   * Comprueba si un pedido existe.
   * @param params.orderId - El ID del pedido a comprobar.
   * @returns true si el pedido existe, false en caso contrario.
   */
  abstract checkIfOrderExists(params: { orderId: UUID }): Promise<boolean>;

  /**
   * Busca un pedido de pago por su ID.
   * @param params.orderId - El ID del pedido a buscar.
   * @returns El pedido de pago si existe, o null si no existe.
   */
  abstract findPaymentOrder(params: {
    orderId: UUID;
  }): Promise<PaymentOrder | null>;

  abstract markOrderAsWaitingForShipment(params: {
    orderId: UUID;
  }): Promise<void>;
}
