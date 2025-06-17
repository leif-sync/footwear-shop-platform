import { OrderPaymentInfo } from "../../order/domain/orderPaymentInfo.js";
import {
  OrderPaymentStatus,
  OrderPaymentStatusOptions,
} from "../../order/domain/orderPaymentStatus.js";
import { OrderRepository } from "../../order/domain/orderRepository.js";
import {
  OrderStatus,
  OrderStatusOptions,
} from "../../order/domain/orderStatus.js";
import { OrderWrite } from "../../order/domain/orderWrite.js";
import { UUID } from "../../shared/domain/UUID.js";
import { InvalidOrderError } from "../domain/errors/invalidOrderError.js";
import { PaymentAssociatedDataProvider as PaymentAssociatedDataProviderPort } from "../domain/PaymentAssociatedDataProvider.js";
import { PaymentOrder } from "../domain/PaymentOrder.js";

export class PaymentAssociatedDataProvider
  implements PaymentAssociatedDataProviderPort
{
  private readonly orderRepository: OrderRepository;

  constructor(params: { orderRepository: OrderRepository }) {
    this.orderRepository = params.orderRepository;
  }

  async checkIfOrderExists(params: { orderId: UUID }): Promise<boolean> {
    const { orderId } = params;
    const order = await this.orderRepository.checkIfOrderExists({ orderId });
    return order !== null;
  }

  async findPaymentOrder(params: {
    orderId: UUID;
  }): Promise<PaymentOrder | null> {
    const { orderId } = params;

    const order = await this.orderRepository.find({ orderId });
    if (!order) return null;

    return new PaymentOrder({
      isPaid: order.getPaymentStatus().equals(OrderPaymentStatusOptions.PAID),
      paymentDeadline: order.getPaymentDeadline(),
      orderId: order.getOrderId(),
      finalAmount: order.evaluateFinalAmount(),
    });
  }

  async markOrderAsWaitingForShipment(params: {
    orderId: UUID;
  }): Promise<void> {
    const { orderId } = params;

    const order = await this.orderRepository.find({ orderId });

    if (!order) {
      throw new InvalidOrderError({ orderId });
    }

    const orderWrite = OrderWrite.from(order);

    const newOrderStatus = new OrderStatus(
      OrderStatusOptions.WAITING_FOR_SHIPMENT
    );

    const newPaymentInfo = new OrderPaymentInfo({
      paymentAt: new Date(),
      paymentStatus: new OrderPaymentStatus(OrderPaymentStatusOptions.PAID),
      paymentDeadline: order.getPaymentDeadline(),
    });

    orderWrite.setOrderStatusAndPaymentInfo({
      updatedOrderStatus: newOrderStatus,
      updatedPaymentInfo: newPaymentInfo,
    });

    await this.orderRepository.update({ order: orderWrite });
  }
}
