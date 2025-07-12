import {
  COMMERCE_NAME,
  SUPPORT_EMAIL,
  WHATSAPP_SUPPORT_CONTACT,
} from "../../../environmentVariables.js";
import {
  EmailMessage,
  EmailRelatedEntityType,
  EmailStatus,
  EmailType,
} from "../../notification/domain/emailMessage.js";
import { EmailRepository } from "../../notification/domain/emailRepository.js";
import { EmailSender } from "../../notification/domain/emailSender.js";
import { OrderRepository } from "../../order/domain/orderRepository.js";
import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { Phone } from "../../shared/domain/phone.js";
import { UUID } from "../../shared/domain/UUID.js";
import { logger } from "../../shared/infrastructure/setupDependencies.js";

const timeToShipment = "2 días hábiles.";
const subject = "¡Tu pedido esta listo para enviarse! 🎉";

async function fetchWithResult<T>(
  fn: () => Promise<T>
): Promise<{ data: T; error?: unknown } | { data?: null; error: unknown }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    return { error };
  }
}

export class PaymentOrderNotifier {
  private readonly emailSender: EmailSender;
  private readonly orderRepository: OrderRepository;
  private readonly emailRepository: EmailRepository;

  constructor(params: {
    emailSender: EmailSender;
    orderRepository: OrderRepository;
    emailRepository: EmailRepository;
  }) {
    this.emailRepository = params.emailRepository;
    this.emailSender = params.emailSender;
    this.orderRepository = params.orderRepository;
  }

  async sendPaymentConfirmationEmail(params: {
    orderId: UUID;
  }): Promise<boolean> {
    const { orderId } = params;

    const orderFull = await this.orderRepository.find({ orderId });

    if (!orderFull) {
      logger.error({
        message: "Order not found",
        meta: {
          orderId: orderId.toString(),
        },
      });
      return false;
    }

    const customerEmail = orderFull.getCustomerEmail();
    const emailTemplate = notifyOrderHasBeenPayTemplate({
      customerFullName: orderFull.getCustomerFullName(),
      orderId: orderFull.getOrderId(),
      totalAmount: orderFull.evaluateFinalAmount(),
      timeToShipment,
      supportEmail: SUPPORT_EMAIL,
      whatsAppSupportContact: WHATSAPP_SUPPORT_CONTACT,
    });

    try {
      const { data, error } = await fetchWithResult(
        async () =>
          await this.emailSender.sendTransactionalEmail({
            to: customerEmail,
            htmlContent: emailTemplate,
            subject,
          })
      );

      const emailMessage = new EmailMessage({
        from: this.emailSender.getFrom(),
        createdAt: new Date(),
        htmlContent: emailTemplate,
        emailId: UUID.generateRandomUUID(),
        maxRetries: new NonNegativeInteger(4),
        retryCount: new NonNegativeInteger(0),
        subject,
        to: customerEmail,
        updatedAt: new Date(),
        status: data ? EmailStatus.create.SENT : EmailStatus.create.FAILED,
        type: EmailType.create.PURCHASE_CONFIRMATION,
        provider: this.emailSender.getProvider(),
        providerMessageId: data?.providerMessageId,
        providerResponseJson: data
          ? JSON.stringify(data)
          : JSON.stringify(error),
        relatedEntityId: orderId,
        relatedEntityType: EmailRelatedEntityType.create.ORDER,
      });

      await this.emailRepository.create({ emailMessage });
      return true;
    } catch (error) {
      logger.error({
        message: "Error notifying order payment",
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
      return false;
    }
  }
}

//TODO: mejorar el template
function notifyOrderHasBeenPayTemplate(params: {
  customerFullName: string;
  orderId: UUID;
  totalAmount: NonNegativeInteger;
  timeToShipment: string;
  supportEmail: EmailAddress;
  whatsAppSupportContact: Phone;
}) {
  const orderId = params.orderId.getValue();
  const totalAmount = params.totalAmount.getValue();
  const supportEmail = params.supportEmail.getValue();
  const whatsAppSupportContact = params.whatsAppSupportContact.getValue();
  const { customerFullName, timeToShipment } = params;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        color: rgb(43, 43, 43);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        display: grid;
        place-content: center;
        line-height: 1;
      }
    </style>

  </head>
  <body>
    <header>
      <h1>¡Tu pedido esta listo para enviarse! 🎉</h1>
    </header>

    <main>
      <p>Hola ${customerFullName}</p>

      <div>
        <h2>Detalles del pedido</h2>
        <p>Número del pedido: <strong>${orderId}</strong></p>
        <p>Total: <strong>${totalAmount}</strong></p>
      </div>

      <p>Tu pedido será enviado en un plazo máximo de ${timeToShipment}.</p>
    </main>

    <footer>
      <p>
        ¿Tienes alguna duda? Contáctanos en <a href="mailto:${supportEmail}">${supportEmail}</a>
        o envíanos un mensaje a través de WhatsApp al <a href="tel:${whatsAppSupportContact}">${whatsAppSupportContact}</a>
      </p>
      <p>2025 - ${COMMERCE_NAME}</p>
    </footer>
  </body>
  </html>
  `;
}
