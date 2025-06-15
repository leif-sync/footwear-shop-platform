import { Request, Response } from "express";
import { processWebpayPlusPaymentGatewaySchema } from "../schemas/webpayPlus.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import {
  webpayPlusResponseCodeOptions,
  webpayPlusStatusOptions,
  WebpaySdkHelper,
} from "../webpaySdkHelper.js";
import { InvalidOrderError } from "../../domain/errors/invalidOrderError.js";
import { PaymentDeadlineExceededError } from "../../domain/errors/paymentDeadlineExceededError.js";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { PaymentTransaction } from "../../domain/paymentTransaction.js";
import { Currency } from "../../domain/currency.js";
import {
  PaymentProcessor,
} from "../../domain/paymentProcessor.js";
import { UUID } from "../../../shared/domain/UUID.js";
import { TransactionType } from "../../domain/transactionType.js";
import { PaymentTransactionStatus } from "../../domain/paymentTransactionStatus.js";
import { PaymentAlreadyMadeError } from "../../domain/errors/paymentAlreadyMadeError.js";
import { COMMERCE_NAME } from "../../../../environmentVariables.js";
import { NonNegativeInteger } from "../../../shared/domain/nonNegativeInteger.js";
import { PaymentNotFromGatewayError } from "../../domain/errors/paymentNotFromGatewayError.js";
import { PaymentNotApprovedError } from "../../domain/errors/paymentNotApproved.js";

// * Todos los flujos de webpay-plus se encuentran en el siguiente enlace:
// * https://www.transbankdevelopers.cl/documentacion/webpay-plus#resumen-de-flujos

const commerceName = COMMERCE_NAME;

function handlePaymentSuccessErrors(params: {
  error: unknown;
  response: Response;
}) {
  const { error, response } = params;

  if (error instanceof PaymentNotFromGatewayError) {
    response.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: "Payment not from gateway",
        code: "PAYMENT_NOT_FROM_GATEWAY",
      },
    });
    return;
  }

  if (error instanceof PaymentNotApprovedError) {
    response.status(HTTP_STATUS.CONFLICT).json({
      error: {
        message: "Payment not approved",
        code: "PAYMENT_NOT_APPROVED",
      },
    });
    return;
  }

  if (error instanceof InvalidOrderError) {
    response.status(HTTP_STATUS.CONFLICT).json({
      error: {
        message: "Invalid order, payment has been refunded",
        code: "INVALID_ORDER",
        isPaymentRefunded: true,
      },
    });
  }

  if (error instanceof PaymentAlreadyMadeError) {
    response.status(HTTP_STATUS.CONFLICT).json({
      error: {
        message: "Payment already made",
        code: "PAYMENT_ALREADY_MADE",
        isPaymentRefunded: true,
      },
    });
    return;
  }

  if (error instanceof PaymentDeadlineExceededError) {
    response.status(HTTP_STATUS.CONFLICT).json({
      error: {
        message: "Payment deadline exceeded, payment has been refunded",
        code: "PAYMENT_DEADLINE_EXCEEDED",
        isPaymentRefunded: true,
      },
    });
  }
}

async function processCashBackWebpayPlus(params: {
  gatewaySessionId: string;
  amount: NonNegativeInteger;
  orderId: UUID;
}) {
  const { orderId, gatewaySessionId, amount } = params;

  try {
    const response = await WebpaySdkHelper.refundTransaction({
      amount: amount.getValue(),
      token: gatewaySessionId,
    });

    return new PaymentTransaction({
      transactionId: UUID.generateRandomUUID(),
      orderId,
      amount,
      transactionType: TransactionType.create.refund(),
      transactionStatus: PaymentTransactionStatus.create.approved(),
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentProcessor: PaymentProcessor.create.WEBPAY(),
      rawResponse: JSON.stringify(response),
      currency: Currency.create.CLP(),
      gatewaySessionId,
    });
  } catch (error) {
    return new PaymentTransaction({
      transactionId: UUID.generateRandomUUID(),
      orderId,
      amount,
      transactionType: TransactionType.create.refund(),
      transactionStatus: PaymentTransactionStatus.create.declined(),
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentProcessor: PaymentProcessor.create.WEBPAY(),
      rawResponse: JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        code: "REFUND_FAILED",
      }),
      currency: Currency.create.CLP(),
      gatewaySessionId,
    });
  }
}

async function handleFlow1(params: { response: Response; token: string }) {
  const { response, token } = params;

  const webpayTransactionResult = await WebpaySdkHelper.commitTransaction({
    token,
  });

  const isPaymentAPProved =
    webpayTransactionResult.response_code ===
    webpayPlusResponseCodeOptions.APPROVED;

  const isPaymentAuthorized =
    webpayTransactionResult.status === webpayPlusStatusOptions.AUTHORIZED;

  const isPaymentSuccessFull = isPaymentAPProved && isPaymentAuthorized;

  const currency = Currency.create.CLP();

  const paymentTransaction = new PaymentTransaction({
    transactionId: UUID.generateRandomUUID(),
    orderId: new UUID(webpayTransactionResult.session_id),
    currency,
    amount: new NonNegativeInteger(webpayTransactionResult.amount),
    transactionType: TransactionType.create.payment(),
    transactionStatus: isPaymentSuccessFull
      ? PaymentTransactionStatus.create.approved()
      : PaymentTransactionStatus.create.declined(),
    createdAt: new Date(),
    updatedAt: new Date(),
    paymentProcessor: PaymentProcessor.create.WEBPAY(),
    rawResponse: JSON.stringify(webpayTransactionResult),
    gatewaySessionId: token, // ocupamos el token como sessionId
  });

  try {
    await ServiceContainer.payment.paymentGatewaySuccessHandler.run({
      paymentTransaction,
      processCashBack: processCashBackWebpayPlus,
    });

    const isCreditCard = webpayTransactionResult.installments_amount;

    // * la respuesta es según los requerimientos de la pasarela de pago
    // * https://www.transbankdevelopers.cl/documentacion/como_empezar#requerimientos-de-pagina-de-resultado

    type WebpayPlusPaymentResponse = {
      commerceName: string;
      currency: string;
      totalAmount: number;
      authorizationCode: string;
      transactionDate: string;
      last4CardDigits: string;
      paymentType: "CREDIT" | "DEBIT";
      installmentsNumber?: number;
      installmentsAmount?: number;
    };

    const apiResponse: WebpayPlusPaymentResponse = {
      commerceName,
      currency: currency.getValue(),
      totalAmount: webpayTransactionResult.amount,
      authorizationCode: webpayTransactionResult.authorization_code,
      transactionDate: webpayTransactionResult.transaction_date,
      last4CardDigits: webpayTransactionResult.card_detail.card_number,
      installmentsNumber: webpayTransactionResult.installments_number,
      paymentType: isCreditCard ? "CREDIT" : "DEBIT",
    };

    if (isCreditCard) {
      apiResponse.installmentsNumber =
        webpayTransactionResult.installments_number;

      apiResponse.installmentsAmount =
        webpayTransactionResult.installments_amount;
    }

    response.status(HTTP_STATUS.OK).json({
      invoice: apiResponse,
    });
    return;
  } catch (error) {
    handlePaymentSuccessErrors({ error, response });
    return;
  }
}

export async function processWebpayPlusPaymentGateway(
  req: Request,
  res: Response
) {
  const resultParse = processWebpayPlusPaymentGatewaySchema.safeParse(
    req.query
  );

  if (!resultParse.success) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: "Invalid request",
        details: resultParse.error.issues,
      },
    });
    return;
  }

  const { TBK_ID_SESION, TBK_ORDEN_COMPRA, TBK_TOKEN, token_ws } =
    resultParse.data;

  // flujo 4. error en el formulario de pago
  const isPaymentFormError =
    token_ws && TBK_TOKEN && TBK_ID_SESION && TBK_ORDEN_COMPRA;

  if (isPaymentFormError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: "Error in payment form",
        code: "PAYMENT_GATEWAY_ERROR",
      },
    });
    return;
  }

  // flujo 3. pago abortado
  const isPaymentAborted = TBK_TOKEN && TBK_ID_SESION && TBK_ORDEN_COMPRA;

  if (isPaymentAborted) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: "Payment aborted",
        code: "PAYMENT_ABORTED",
      },
    });
    return;
  }

  // flujo 2. timeout
  const isPaymentRequestTimedOut = TBK_ID_SESION && TBK_ORDEN_COMPRA;

  if (isPaymentRequestTimedOut) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: "Payment timeout",
        code: "PAYMENT_TIMEOUT",
      },
    });
    return;
  }

  // flujo 1. pago exitoso o rechazado
  if (token_ws) {
    await handleFlow1({ response: res, token: token_ws });
    return;
  }

  res.status(HTTP_STATUS.BAD_REQUEST).json({
    error: {
      message: "Invalid request",
      code: "INVALID_REQUEST",
    },
  });
  return;
}
