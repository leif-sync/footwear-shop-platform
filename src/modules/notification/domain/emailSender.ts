import { Email } from "../../shared/domain/email.js";

export abstract class EmailSender {
  abstract sendTransactionalEmail(params: {
    to: Email;
    subject: string;
    content: string;
  }): Promise<void>;
}

