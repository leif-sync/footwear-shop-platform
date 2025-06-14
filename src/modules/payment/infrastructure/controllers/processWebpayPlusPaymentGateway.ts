import { Request, Response } from "express";
import { processWebpayPlusPaymentGatewaySchema } from "../schemas/webpayPlus.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import {
  commit,
  webpayPlusRefundTypeOptions,
  webpayPlusResponseCodeOptions,
  webpayPlusStatusOptions,
  WebpaySdkHelper,
} from "../webpaySdkHelper.js";
import { InvalidOrderError } from "../../domain/errors/invalidOrderError.js";
import { PaymentDeadlineExceededError } from "../../domain/errors/paymentDeadlineExceededError.js";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { paymentTransactionRepository } from "../../../shared/infrastructure/serviceContainer.js";
import { PaymentTransaction } from "../../domain/paymentTransaction.js";
import { PositiveInteger } from "../../../shared/domain/positiveInteger.js";
import { Currency, CurrencyOptions } from "../../domain/currency.js";
import {
  PaymentProcessor,
  PaymentProcessorOptions,
} from "../../domain/paymentProcessor.js";
import { UUID } from "../../../shared/domain/UUID.js";
import { TransactionType } from "../../domain/transactionType.js";
import { PaymentTransactionStatus } from "../../domain/paymentTransactionStatus.js";
import { PaymentAlreadyMadeError } from "../../domain/errors/paymentAlreadyMadeError.js";
import { COMMERCE_NAME } from "../../../../environmentVariables.js";

// * Todos los flujos de webpay-plus se encuentran en el siguiente enlace:
// * https://www.transbankdevelopers.cl/documentacion/webpay-plus#resumen-de-flujos

const commerceName = COMMERCE_NAME;

async function handlePaymentSuccessErrors(params: {
  webpayResponse: commit;
  error: unknown;
  response: Response;
  token: string;
}) {
  const { error, response, webpayResponse, token } = params;
  try {
    // * como el usuario podría volver a recargar la página de el resultado de la orden
    // * es posible que el caso de uso lance el error de "payment already made" pero esto
    // * no necesariamente significaría que el usuario pago 2 veces, sino que esta consultando
    // * el estado de la orden que ya fue pagada con el mismo token de webpay entonces si
    // * hacemos una reversa de la transacción, el usuario podría ver que su orden fue
    // * reembolsada pero la orden tendría un estado de pagado lo cual es inconsistente
    if (error instanceof PaymentAlreadyMadeError) {
      response.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Payment already made",
      });
      return;
    }

    const isRefundApplicable =
      error instanceof InvalidOrderError ||
      error instanceof PaymentDeadlineExceededError;

    if (!isRefundApplicable) throw error;

    const webpayRefundResult = await WebpaySdkHelper.refundTransaction({
      token,
      amount: webpayResponse.amount,
    });

    const refundStatus =
      webpayRefundResult.type === webpayPlusRefundTypeOptions.REVERSED
        ? PaymentTransactionStatus.create.approved()
        : webpayRefundResult.response_code ===
            webpayPlusResponseCodeOptions.APPROVED
          ? PaymentTransactionStatus.create.approved()
          : PaymentTransactionStatus.create.declined();

    const webpayRefundTransaction = new PaymentTransaction({
      amount: new PositiveInteger(webpayResponse.amount),
      currency: new Currency(CurrencyOptions.CLP),
      createdAt: new Date(),
      orderId: new UUID(webpayResponse.session_id),
      paymentProcessor: new PaymentProcessor(PaymentProcessorOptions.WEBPAY),
      transactionId: UUID.generateRandomUUID(),
      transactionType: TransactionType.create.refund(),
      transactionStatus: refundStatus,
      updatedAt: new Date(),
      rawResponse: JSON.stringify(webpayRefundResult),
    });

    await paymentTransactionRepository.create({
      paymentTransaction: webpayRefundTransaction,
    });

    response.status(HTTP_STATUS.BAD_REQUEST).json({
      message:
        error instanceof InvalidOrderError
          ? "Invalid order, payment has been refunded"
          : "Payment deadline exceeded, payment has been refunded",
    });
  } catch (error) {
    const isTransactionAlreadyBeenReversed =
      error instanceof Error &&
      error.name === "TransbankError" &&
      error.message.includes("Transaction already REVERSED");

    if (isTransactionAlreadyBeenReversed) {
      response.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Transaction already reversed",
      });
      return;
    }

    throw error;
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

  const isRefund =
    webpayTransactionResult.status === webpayPlusStatusOptions.REVERSED ||
    webpayTransactionResult.status === webpayPlusStatusOptions.NULLIFIED ||
    webpayTransactionResult.status ===
      webpayPlusStatusOptions.PARTIALLY_NULLIFIED;

  const isPaymentSuccessFull = isPaymentAPProved && isPaymentAuthorized;

  const currency = new Currency(CurrencyOptions.CLP);

  const transactionDetail = new PaymentTransaction({
    transactionId: UUID.generateRandomUUID(),
    orderId: new UUID(webpayTransactionResult.session_id),
    currency,
    amount: new PositiveInteger(webpayTransactionResult.amount),
    transactionType: TransactionType.create.payment(),
    transactionStatus: isPaymentSuccessFull
      ? PaymentTransactionStatus.create.approved()
      : PaymentTransactionStatus.create.declined(),
    createdAt: new Date(),
    updatedAt: new Date(),
    paymentProcessor: new PaymentProcessor(PaymentProcessorOptions.WEBPAY),
    rawResponse: JSON.stringify(webpayTransactionResult),
  });

  if (isRefund) {
    response.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Payment has been refunded or reversed",
    });

    return;
  }

  await paymentTransactionRepository.create({
    paymentTransaction: transactionDetail,
  });

  if (!isPaymentSuccessFull) {
    response.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Payment rejected",
    });
    return;
  }

  try {
    await ServiceContainer.payment.paymentGatewaySuccessHandler.run({
      orderId: new UUID(webpayTransactionResult.session_id),
    });

    const isCreditCard = webpayTransactionResult.installments_amount;

    // * la respuesta es según los requerimientos de la pasarela de pago
    // * https://www.transbankdevelopers.cl/documentacion/como_empezar#requerimientos-de-pagina-de-resultado

    const apiResponse: {
      commerceName: string;
      currency: string;
      totalAmount: number;
      authorizationCode: string;
      transactionDate: string;
      last4CardDigits: string;
      paymentType: "CREDIT" | "DEBIT";
      installmentsNumber?: number;
      installmentsAmount?: number;
    } = {
      commerceName,
      currency: currency.getValue(),
      totalAmount: webpayTransactionResult.amount,
      authorizationCode: webpayTransactionResult.authorization_code,
      transactionDate: webpayTransactionResult.transaction_date,
      last4CardDigits: webpayTransactionResult.card_detail.card_number,
      paymentType: isCreditCard ? "CREDIT" : "DEBIT",
    };

    if (isCreditCard) {
      apiResponse.installmentsNumber =
        webpayTransactionResult.installments_number;

      apiResponse.installmentsAmount =
        webpayTransactionResult.installments_amount;
    }

    response.status(HTTP_STATUS.OK).json(apiResponse);
    return;
  } catch (error) {
    await handlePaymentSuccessErrors({
      webpayResponse: webpayTransactionResult,
      error,
      response,
      token,
    });
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
      message: "Invalid request",
      errors: resultParse.error.issues,
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
      message: "An error occurred in the payment form",
    });
    return;
  }

  // flujo 3. pago abortado
  const isPaymentAborted = TBK_TOKEN && TBK_ID_SESION && TBK_ORDEN_COMPRA;

  if (isPaymentAborted) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Payment aborted",
    });
    return;
  }

  // flujo 2. timeout
  const isPaymentRequestTimedOut = TBK_ID_SESION && TBK_ORDEN_COMPRA;

  if (isPaymentRequestTimedOut) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Payment timeout",
    });
    return;
  }

  // flujo 1. pago exitoso o rechazado
  if (token_ws) {
    await handleFlow1({ response: res, token: token_ws });
    return;
  }

  res.status(HTTP_STATUS.BAD_REQUEST).json({
    message: "Invalid request",
  });
  return;
}
