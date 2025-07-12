import { Request, Response } from "express";
import { ServiceContainer } from "../../../shared/infrastructure/setupDependencies.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { CannotUpdateOrderError } from "../../domain/errors/cannotUpdateOrderError.js";
import { OrderNotFoundError } from "../../domain/errors/orderNotFoundError.js";
import { updatePartialOrderSchema } from "../schemas/orderSchemas.js";
import { z, ZodError } from "zod";
import { UUID } from "../../../shared/domain/UUID.js";
import { Customer } from "../../domain/customer.js";
import { EmailAddress } from "../../../shared/domain/emailAddress.js";
import { CustomerFirstName } from "../../domain/customerFirstName.js";
import { CustomerLastName } from "../../domain/customerLastName.js";
import { Phone } from "../../../shared/domain/phone.js";
import { OrderStatus } from "../../domain/orderStatus.js";
import { ShippingAddress } from "../../domain/shippingAddress.js";
import { OrderPaymentInfo } from "../../domain/orderPaymentInfo.js";
import { OrderPaymentStatus } from "../../domain/orderPaymentStatus.js";
import { InvalidProductError } from "../../domain/errors/invalidProductError.js";
import { InvalidVariantError } from "../../domain/errors/invalidVariantError.js";
import { SizeNotAvailableForVariantError } from "../../domain/errors/sizeNotAvailableForVariantError.js";
import { InvalidOrderStatusTransitionError } from "../../domain/errors/invalidOrderStatusTransitionError.js";
import { CannotUpdateCustomerForOrderStatusError } from "../../domain/errors/cannotUpdateCustomerForOrderStatus.js";
import { CannotUpdateShippingForOrderStatusError } from "../../domain/errors/cannotUpdateShippingAddressForOrderStatus.js";
import { CannotUpdatePaymentInfoForOrderStatusError } from "../../domain/errors/cannotUpdatePaymentInfoForOrderStatus.js";
import { CannotUpdateProductsForOrderStatusError } from "../../domain/errors/cannotUpdateProductsForOrderStatusError.js";

const idSchema = z.string().uuid();

export async function updatePartialOrder(
  req: Request<{ orderId: string }>,
  res: Response
) {
  try {
    const newOrderData = updatePartialOrderSchema.parse(req.body);

    const orderId = new UUID(idSchema.parse(req.params.orderId));
    const orderStatus = newOrderData.orderStatus
      ? new OrderStatus(newOrderData.orderStatus)
      : undefined;
    const customer = newOrderData.customer
      ? new Customer({
          email: new EmailAddress(newOrderData.customer.email),
          firstName: new CustomerFirstName(newOrderData.customer.firstName),
          lastName: new CustomerLastName(newOrderData.customer.lastName),
          phone: new Phone(newOrderData.customer.phone),
        })
      : undefined;

    const shippingAddress = newOrderData.shippingAddress
      ? new ShippingAddress({
          commune: newOrderData.shippingAddress.commune,
          region: newOrderData.shippingAddress.region,
          streetName: newOrderData.shippingAddress.streetName,
          streetNumber: newOrderData.shippingAddress.streetNumber,
          additionalInfo: newOrderData.shippingAddress.additionalInfo,
        })
      : undefined;

    const paymentInfo = newOrderData.paymentInfo
      ? new OrderPaymentInfo({
          paymentAt: newOrderData.paymentInfo.paymentAt,
          paymentDeadline: newOrderData.paymentInfo.paymentDeadline,
          paymentStatus: new OrderPaymentStatus(
            newOrderData.paymentInfo.paymentStatus
          ),
        })
      : undefined;

    await ServiceContainer.order.updatePartialOrder.run({
      orderId,
      orderStatus,
      customer,
      shippingAddress,
      paymentInfo,
    });

    res.status(HTTP_STATUS.NO_CONTENT).end();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid request",
        errors: error.issues,
      });
      return;
    }

    if (error instanceof OrderNotFoundError) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Order not found",
        errors: error.message,
      });
      return;
    }

    if (error instanceof InvalidProductError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid product",
        errors: error.message,
      });
      return;
    }

    if (error instanceof InvalidVariantError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid variant",
        errors: error.message,
      });
      return;
    }

    if (error instanceof SizeNotAvailableForVariantError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Size not available for variant",
        errors: error.message,
      });
      return;
    }

    if (error instanceof InvalidOrderStatusTransitionError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid order status transition",
        errors: error.message,
      });
      return;
    }

    if (error instanceof CannotUpdateCustomerForOrderStatusError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Cannot update customer for order status",
        errors: error.message,
      });
      return;
    }

    if (error instanceof CannotUpdateShippingForOrderStatusError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Cannot update shipping address for order status",
        errors: error.message,
      });
      return;
    }

    if (error instanceof CannotUpdatePaymentInfoForOrderStatusError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Cannot update payment info for order status",
        errors: error.message,
      });
      return;
    }

    if (error instanceof CannotUpdateProductsForOrderStatusError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Cannot update products for order status",
        errors: error.message,
      });
      return;
    }

    if (error instanceof CannotUpdateOrderError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Cannot update order",
        errors: error.message,
      });
      return;
    }

    throw error;
  }
}
