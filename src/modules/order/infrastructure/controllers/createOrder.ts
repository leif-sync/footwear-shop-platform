import { ZodError } from "zod";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { InvalidProductError } from "../../domain/errors/invalidProductError.js";
import { InvalidVariantError } from "../../domain/errors/invalidVariantError.js";
import { NotEnoughStockError } from "../../domain/errors/notEnoughStockError.js";
import { SizeNotAvailableForVariantError } from "../../domain/errors/sizeNotAvailableForVariantError.js";
import { Request, Response } from "express";
import {
  createOrderForAdminSchema,
  createOrderSchema,
} from "../schemas/orderSchemas.js";
import { InvalidCreatorError } from "../../domain/errors/invalidCreatorError.js";
import { Customer } from "../../domain/customer.js";
import { Email } from "../../../shared/domain/email.js";
import { Phone } from "../../../shared/domain/phone.js";
import { ShippingAddress } from "../../domain/shippingAddress.js";
import { OrderCreatorDetails } from "../../domain/orderCreatorDetails.js";
import { OrderCreator } from "../../domain/orderCreator.js";
import { UUID } from "../../../shared/domain/UUID.js";
import { OrderVariantWrite } from "../../domain/orderVariantWrite.js";
import { OrderVariantSize } from "../../domain/orderVariantSize.js";
import { PositiveInteger } from "../../../shared/domain/positiveInteger.js";
import { OrderItem } from "../../domain/setupOrderInformation.js";
import { OrderStatus } from "../../domain/orderStatus.js";
import { OrderPaymentInfo } from "../../domain/orderPaymentInfo.js";
import { OrderPaymentStatus } from "../../domain/orderPaymentStatus.js";
import { CustomerFirstName } from "../../domain/customerFirstName.js";
import { CustomerLastName } from "../../domain/customerLastName.js";

function handleError(
  error: unknown,
  res: Response<{
    message: string;
    errors: string[] | ZodError["issues"];
  }>
) {
  if (error instanceof ZodError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid request",
      errors: error.issues,
    });
    return;
  }

  if (error instanceof InvalidProductError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid product",
      errors: [error.message],
    });
    return;
  }

  if (error instanceof InvalidVariantError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid variant",
      errors: [error.message],
    });
    return;
  }

  if (error instanceof SizeNotAvailableForVariantError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Size not available for variant",
      errors: [error.message],
    });
    return;
  }

  if (error instanceof NotEnoughStockError) {
    res.status(HTTP_STATUS.CONFLICT).json({
      message: "Not enough stock",
      errors: [error.message],
    });
    return;
  }

  if (error instanceof InvalidCreatorError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid creator",
      errors: [error.message],
    });
    return;
  }

  throw error;
}

export async function createOrder(req: Request, res: Response) {
  if (req.admin) {
    await createOrderForAdmin({
      request: req,
      response: res,
      adminId: req.admin.adminId,
    });
    return;
  }

  try {
    // * se utiliza strict para diferenciar entre el esquema de admin y el de cliente
    const orderFromRequest = createOrderSchema
      .strict(
        "Some fields were sent additionally or those fields need authentication"
      )
      .parse(req.body);

    const customer = new Customer({
      email: new Email(orderFromRequest.customer.email),
      firstName: new CustomerFirstName(orderFromRequest.customer.firstName),
      lastName: new CustomerLastName(orderFromRequest.customer.lastName),
      phone: new Phone(orderFromRequest.customer.phone),
    });

    const shippingAddress = new ShippingAddress({
      commune: orderFromRequest.shippingAddress.commune,
      region: orderFromRequest.shippingAddress.region,
      streetName: orderFromRequest.shippingAddress.streetName,
      streetNumber: orderFromRequest.shippingAddress.streetNumber,
      additionalInfo: orderFromRequest.shippingAddress.additionalInfo,
    });

    const orderProducts = orderFromRequest.orderProducts.map((orderProduct) => {
      const productVariants = orderProduct.productVariants.map(
        (productVariant) => {
          const variantSizes = productVariant.variantSizes.map(
            (variantSize) => {
              return new OrderVariantSize({
                quantity: new PositiveInteger(variantSize.quantity),
                sizeValue: new PositiveInteger(variantSize.sizeValue),
              });
            }
          );

          return new OrderVariantWrite({
            variantId: new UUID(productVariant.variantId),
            variantSizes,
          });
        }
      );

      return {
        productId: new UUID(orderProduct.productId),
        productVariants,
      };
    });

    const { orderId } = await ServiceContainer.order.createCustomerOrder.run({
      customer,
      shippingAddress,
      orderProducts,
    });

    res.status(HTTP_STATUS.CREATED).json({
      order: {
        orderId: orderId.getValue(),
      },
    });
    return;
  } catch (error) {
    handleError(error, res);
  }
}

async function createOrderForAdmin(params: {
  request: Request;
  response: Response;
  adminId: string;
}) {
  const { request: req, response: res, adminId } = params;
  try {
    const orderFromRequest = createOrderForAdminSchema.parse(req.body);

    const customer = new Customer({
      email: new Email(orderFromRequest.customer.email),
      firstName: new CustomerFirstName(orderFromRequest.customer.firstName),
      lastName: new CustomerLastName(orderFromRequest.customer.lastName),
      phone: new Phone(orderFromRequest.customer.phone),
    });

    const shippingAddress = new ShippingAddress({
      commune: orderFromRequest.shippingAddress.commune,
      region: orderFromRequest.shippingAddress.region,
      streetName: orderFromRequest.shippingAddress.streetName,
      streetNumber: orderFromRequest.shippingAddress.streetNumber,
      additionalInfo: orderFromRequest.shippingAddress.additionalInfo,
    });

    const creatorDetails = new OrderCreatorDetails({
      orderCreator: OrderCreator.create.guest(),
      creatorId: new UUID(adminId),
    });

    const orderProducts: OrderItem[] = orderFromRequest.orderProducts.map(
      (orderProduct) => {
        const productVariants = orderProduct.productVariants.map(
          (productVariant) => {
            const variantSizes = productVariant.variantSizes.map(
              (variantSize) => {
                return new OrderVariantSize({
                  quantity: new PositiveInteger(variantSize.quantity),
                  sizeValue: new PositiveInteger(variantSize.sizeValue),
                });
              }
            );

            return new OrderVariantWrite({
              variantId: new UUID(productVariant.variantId),
              variantSizes,
            });
          }
        );

        return {
          productId: new UUID(orderProduct.productId),
          productVariants,
        };
      }
    );

    const orderStatus = new OrderStatus(orderFromRequest.orderStatus);

    const paymentInfo = new OrderPaymentInfo({
      paymentAt: orderFromRequest.paymentInfo.paymentAt,
      paymentDeadline: orderFromRequest.paymentInfo.paymentDeadline,
      paymentStatus: new OrderPaymentStatus(
        orderFromRequest.paymentInfo.paymentStatus
      ),
    });

    const { orderId } = await ServiceContainer.order.createAdminOrder.run({
      customer,
      shippingAddress,
      creatorDetails,
      orderStatus,
      paymentInfo,
      orderProducts,
    });
 
    res.status(HTTP_STATUS.CREATED).json({
      message: "Order created",
      order: {
        orderId: orderId.getValue(),
      },
    });
  } catch (error) {
    handleError(error, res);
  }
}
