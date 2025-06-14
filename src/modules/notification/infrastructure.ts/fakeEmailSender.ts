import { Email } from "../../shared/domain/email.js";
import { EmailSender } from "../domain/emailSender.js";
import { styleText } from "node:util";

export class FakeEmailSender implements EmailSender {
  async sendTransactionalEmail(params: {
    to: Email;
    subject: string;
    content: string;
  }): Promise<void> {
    console.log();
    console.log(
      "Sending email to: ",
      styleText(["underline", "cyan"], params.to.getValue())
    );
    console.log(
      "Subject: ",
      styleText(["italic", "bold", "white"], params.subject)
    );
    console.log("Content: ", styleText(["white", "bold"], params.content));
    console.log();
  }
}
