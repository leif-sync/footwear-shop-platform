import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { EmailProvider } from "../domain/emailMessage.js";
import { EmailSender } from "../domain/emailSender.js";
import { styleText } from "node:util";

export class DebugEmailSender implements EmailSender {
  from: EmailAddress;

  constructor(params: { from: EmailAddress }) {
    this.from = params.from;
  }

  async sendTransactionalEmail(params: {
    to: EmailAddress;
    subject: string;
    htmlContent: string;
  }): Promise<{
    providerMessageId?: string;
  }> {
    console.log();
    console.log(
      "Sending email to: ",
      styleText(["underline", "cyan"], params.to.getValue())
    );
    console.log(
      "Subject: ",
      styleText(["italic", "bold", "white"], params.subject)
    );
    console.log("Content: ", styleText(["white", "bold"], params.htmlContent));
    console.log();

    return {
      providerMessageId: undefined,
    };
  }

  getFrom(): EmailAddress {
    return this.from;
  }

  getProvider(): EmailProvider {
    return EmailProvider.create.DEBUG;
  }
}
