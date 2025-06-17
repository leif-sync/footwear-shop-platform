import {
  COMMERCE_NAME,
  SUPPORT_EMAIL,
  WHATSAPP_SUPPORT_CONTACT,
} from "../../../environmentVariables.js";
import { EmailSender } from "../../notification/domain/emailSender.js";
import { OrderRepository } from "../../order/domain/orderRepository.js";
import { Email } from "../../shared/domain/email.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { Phone } from "../../shared/domain/phone.js";
import { UUID } from "../../shared/domain/UUID.js";
import { logger } from "../../shared/infrastructure/logger.js";

// TODO: move to a configuration file
const commerceName = COMMERCE_NAME;
const timeToShipment = "2 días hábiles.";
const supportEmail = new Email(SUPPORT_EMAIL);
const whatsAppSupportContact = new Phone(WHATSAPP_SUPPORT_CONTACT);
const subject = "¡Tu pedido esta listo para enviarse! 🎉";

export class PaymentOrderNotifier {
  private readonly emailSender: EmailSender;
  private readonly orderRepository: OrderRepository;

  constructor(params: {
    emailSender: EmailSender;
    orderRepository: OrderRepository;
  }) {
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
      supportEmail,
      whatsAppSupportContact,
    });

    try {
      await this.emailSender.sendTransactionalEmail({
        to: customerEmail,
        content: emailTemplate,
        subject,
      });
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
  supportEmail: Email;
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
      <p>2025 - ${commerceName}</p>
    </footer>
  </body>
  </html>
  `;
}
