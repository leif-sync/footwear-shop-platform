// * definición de los tipos de datos de webpay utilizando la definición de api que se encuentra en el siguiente enlace:
// * https://www.transbankdevelopers.cl/referencia/webpay
// * se crea este helper porque los tipos de datos de webpay no están definidos completamente, se utiliza la referencia api de webpay.

import transBank from "transbank-sdk";

const testWebpayTransaction = new transBank.WebpayPlus.Transaction(
  new transBank.Options(
    transBank.IntegrationCommerceCodes.WEBPAY_PLUS,
    transBank.IntegrationApiKeys.WEBPAY,
    transBank.Environment.Integration
  )
);

export enum webpayPlusPaymentTypeOptions {
  /** venta débito */
  DEBIT_SALE = "VD",
  /** venta normal */
  NORMAL_SALE = "VN",
  /** venta en cuotas */
  INSTALLMENT_SALE = "VC",
  /** 3 cuotas sin interés */
  THREE_INSTALLMENTS_NO_INTEREST = "SI",
  /** 2 cuotas sin interés */
  TWO_INSTALLMENTS_NO_INTEREST = "S2",
  /** N cuotas sin interés */
  N_INSTALLMENTS_NO_INTEREST = "NC",
  /** venta Prepago */
  PREPAID_SALE = "VP",
}

export enum webPayPlusVciOptions {
  /** autenticación exitosa*/
  SUCCESSFUL_AUTHENTICATION = "TSY",
  /** autenticación rechazada */
  REJECTED_AUTHENTICATION = "TSN",
  /** no participa */
  NOT_PARTICIPATING = "NP",
  /**  falla de conexión, autenticación rechazada */
  CONNECTION_FAILURE_REJECTED_AUTHENTICATION = "U3",
  /** datos inválidos */
  INVALID_DATA = "INV",
  /** intentó */
  ATTEMPTED = "A",
  /** comercio no participa */
  MERCHANT_NOT_PARTICIPATING = "CNP1",
  /** error operacional */
  OPERATIONAL_ERROR = "EOP",
  /** bin no adherido */
  BIN_NOT_ADHERED = "BNA",
  /** emisor no adherido */
  ISSUER_NOT_ADHERED = "ENA",
}

export enum webpayPlusStatusOptions {
  INITIALIZED = "INITIALIZED",
  AUTHORIZED = "AUTHORIZED",
  REVERSED = "REVERSED",
  FAILED = "FAILED",
  NULLIFIED = "NULLIFIED",
  PARTIALLY_NULLIFIED = "PARTIALLY_NULLIFIED",
  CAPTURED = "CAPTURED",
}

export enum webpayPlusResponseCodeOptions {
  /** transacción aprobada */
  APPROVED = 0,
  /** rechazo de transacción por error en el ingreso de datos */
  REJECTED_INVALID_DATA = -1,
  /** rechazo de transacción por error en los parámetros de la tarjeta o cuenta asociada */
  REJECTED_INVALID_CARD = -2,
  /** rechazo de transacción por error en la transacción */
  REJECTED_TRANSACTION = -3,
  /** rechazo de transacción por parte del emisor (Banco) */
  REJECTED_BY_BANK = -4,
  /** rechazo por error de posible fraude. */
  REJECTED_POSSIBLE_FRAUD = -5,
}

export enum webpayPlusRefundTypeOptions {
  REVERSED = "REVERSED",
  NULLIFIED = "NULLIFIED",
}

export type commit = {
  vci: webPayPlusVciOptions;
  amount: number;
  status: webpayPlusStatusOptions;
  buy_order: string;
  session_id: string;
  card_detail: {
    card_number: string;
  };
  accounting_date: string;
  transaction_date: string;
  authorization_code: string;
  payment_type_code: webpayPlusPaymentTypeOptions;
  response_code: webpayPlusResponseCodeOptions;
  installments_number: number;
  installments_amount?: number;
  balance?: number;
};

export type status =
  | {
      amount: number;
      status: webpayPlusStatusOptions.INITIALIZED;
      buy_order: string;
      session_id: string;
      accounting_date: string;
      transaction_date: string;
      installments_number: number;
    }
  | commit;

type WebpayRefund =
  | {
      type: webpayPlusRefundTypeOptions.REVERSED;
    }
  | {
      type: webpayPlusRefundTypeOptions.NULLIFIED;
      authorization_code: string;
      authorization_date: string;
      balance: number;
      nullified_amount: number;
      response_code: webpayPlusResponseCodeOptions;
    };

export class WebpaySdkHelper {
  private webpayTransaction: typeof testWebpayTransaction;

  constructor(params: { apiKey: string }) {
    this.webpayTransaction = new transBank.WebpayPlus.Transaction(
      new transBank.Options(
        transBank.IntegrationCommerceCodes.WEBPAY_PLUS,
        params.apiKey,
        transBank.Environment.Production
      )
    );
  }

  static createIntegrationInstance() {
    const wp = new WebpaySdkHelper({
      apiKey: transBank.IntegrationApiKeys.WEBPAY,
    });

    wp.webpayTransaction = testWebpayTransaction;

    return wp;
  }

  /**
   * Crea el link de pago para que el usuario pueda realizar el pago.
   * El link de pago es una URL que redirige al usuario a la página de pago de Transbank.
   */
  async createLinkPaymentGateway(paymentParams: {
    sessionId: string;
    buyOrder: string;
    amount: number;
    returnUrl: string;
  }): Promise<{ url: string; token: string }> {
    const response = (await this.webpayTransaction.create(
      paymentParams.buyOrder,
      paymentParams.sessionId,
      paymentParams.amount,
      paymentParams.returnUrl
    )) as { url: string; token: string };

    return { url: response.url, token: response.token };
  }

  /**
   * En este paso es importante confirmar la transacción para notificar a Transbank
   * que hemos recibido exitosamente los detalles de la transacción.
   * Es importante destacar que **si la confirmación no se realiza, la transacción será caducada.**
   */
  async commitTransaction(params: { token: string }) {
    const transaction = (await this.webpayTransaction.commit(
      params.token
    )) as commit;

    return transaction;
  }

  /**
   * Puedes solicitar el estado de una transacción hasta **7 días** después de su realización.
   * No hay límite de solicitudes de este tipo durante ese período.
   * Sin embargo, una vez pasados los 7 días, ya no podrás revisar su estado.
   */
  async statusTransaction(params: { token: string }) {
    const transaction = (await this.webpayTransaction.status(
      params.token
    )) as status;

    return transaction;
  }

  /**
   * # Reembolso de Transacciones
   * En esta etapa, tienes la opción de solicitar el reembolso del monto al titular de la tarjeta.
   * Dependiendo del monto y el tiempo transcurrido desde la transacción, este proceso podría resultar
   * en una Reversa o Anulación, dependiendo de ciertas condiciones (Reversa en las primeras 3 horas de
   * la autorización, anulación posterior a eso), o una Anulación parcial si el monto es menor al total.
   * Las anulaciones parciales para tarjetas débito y Prepago no están soportadas.
   *
   * ## Petición
   * Para llevar a cabo el reembolso, necesitas proporcionar el token de la transacción y el monto que
   * deseas reversar. Si anulas el monto total, podría ser una Reversa o Anulación, dependiendo de ciertas
   * condiciones (Reversa en las primeras 3 horas de la autorización, anulación posterior a eso), o una
   * Anulación Parcial si el monto es menor al total. Algunas consideraciones a tener en cuenta:
   * - No es posible realizar Anulaciones Parciales en pagos con cuotas.
   *
   * En este [link](https://transbankdevelopers.cl/producto/webpay#anulaciones-y-reversas)
   * podrás ver mayor información sobre las condiciones y casos para anular o reversar transacciones.
   */
  async refundTransaction(params: { token: string; amount: number }) {
    const refund = (await this.webpayTransaction.refund(
      params.token,
      params.amount
    )) as WebpayRefund;

    return refund;
  }
}
