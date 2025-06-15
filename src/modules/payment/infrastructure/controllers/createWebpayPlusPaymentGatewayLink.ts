import { Request, Response } from "express";
import { createLinkPaymentGatewaySchema } from "../schemas/webpayPlus.js";
import { ZodError } from "zod";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { WebpaySdkHelper } from "../webpaySdkHelper.js";
import { randomBytes } from "node:crypto";
import { SERVER_BASE_URL } from "../../../../environmentVariables.js";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { InvalidOrderError } from "../../domain/errors/invalidOrderError.js";
import { PaymentAlreadyMadeError } from "../../domain/errors/paymentAlreadyMadeError.js";
import { PaymentDeadlineExceededError } from "../../domain/errors/paymentDeadlineExceededError.js";
import { AppUrl } from "../../../shared/domain/appUrl.js";
import { UUID } from "../../../shared/domain/UUID.js";

const buyOrderLength = 20;
export const paymentsEndpoint = "/api/v1/payments";
export const webpayPlusConfirmUrlRoutePath = "/gateways/webpay-plus/confirm";

function generateRandomBuyOrder() {
  return randomBytes(buyOrderLength / 2).toString("hex");
}

export async function createWebpayPlusPaymentGatewayLink(
  req: Request,
  res: Response
) {
  try {
    const result = createLinkPaymentGatewaySchema.parse(req.body);

    const webpayReturnUrl = new AppUrl(
      SERVER_BASE_URL,
      paymentsEndpoint,
      webpayPlusConfirmUrlRoutePath
    );

    const orderId = new UUID(result.orderId);

    const { invoiceAmount } =
      await ServiceContainer.payment.prepareOrderForPayment.run({
        orderId,
      });

    const webpayResult = await WebpaySdkHelper.createLinkPaymentGateway({
      sessionId: orderId.getValue(),
      amount: invoiceAmount.getValue(),
      buyOrder: generateRandomBuyOrder(),
      returnUrl: webpayReturnUrl.getValue(),
    });

    res.status(HTTP_STATUS.OK).send(`
        <form method="post" action="${webpayResult.url}">
          <input type="hidden" name="token_ws" value="${webpayResult.token}" />
          <input type="submit" value="Ir a pagar" />
        </form>
      `);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid request",
        errors: error.issues,
      });
      return;
    }

    if (error instanceof InvalidOrderError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Order not found",
      });
      return;
    }

    if (error instanceof PaymentAlreadyMadeError) {
      res.status(HTTP_STATUS.CONFLICT).json({
        message: "Payment already made",
      });
      return;
    }

    if (error instanceof PaymentDeadlineExceededError) {
      res.status(HTTP_STATUS.CONFLICT).json({
        message: "Payment deadline exceeded",
      });
      return;
    }

    throw error;
  }
}
