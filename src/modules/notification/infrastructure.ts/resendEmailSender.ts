import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { EmailProvider } from "../domain/emailMessage.js";
import {
  EmailSender,
  InvalidEmailAddressError,
} from "../domain/emailSender.js";
import { Resend } from "resend";

export class ResendEmailSender implements EmailSender {
  from: EmailAddress;
  resendClient: Resend;

  constructor(params: { apiKey: string; from: EmailAddress }) {
    this.resendClient = new Resend(params.apiKey);
    this.from = params.from;
  }

  async sendTransactionalEmail(params: {
    to: EmailAddress;
    subject: string;
    htmlContent: string;
  }): Promise<{
    providerMessageId?: string;
  }> {
    const { to, subject, htmlContent } = params;

    const { data, error } = await this.resendClient.emails.send({
      from: this.from.getValue(),
      to: [to.getValue()],
      subject,
      html: htmlContent,
    });

    if (error) {
      if (error.name === "validation_error") {
        throw new InvalidEmailAddressError({ emailAddress: to });
      }

      throw error;
    }

    if (!data || !data.id) {
      throw new Error("No message ID returned from Resend.");
    }

    return {
      providerMessageId: data.id,
    };
  }

  getFrom(): EmailAddress {
    return this.from;
  }

  getProvider(): EmailProvider {
    return EmailProvider.create.RESEND;
  }
}
