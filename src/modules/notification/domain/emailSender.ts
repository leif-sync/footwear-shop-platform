import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { EmailProvider } from "./emailMessage.js";

/**
 * EmailSender is an abstract class that defines the contract for sending emails.
 */
export abstract class EmailSender {
  from!: EmailAddress;
  /**
   * Sends a transactional email.
   * @param params - The parameters for sending the email.
   * @param params.to - The recipient's email address.
   * @param params.subject - The subject of the email.
   * @param params.content - The content of the email.
   * @returns A promise that resolves when the email is sent.
   */
  abstract sendTransactionalEmail(params: {
    to: EmailAddress;
    subject: string;
    htmlContent: string;
  }): Promise<{
    providerMessageId?: string;
  }>;

  abstract getFrom(): EmailAddress;
  abstract getProvider(): EmailProvider;
}
