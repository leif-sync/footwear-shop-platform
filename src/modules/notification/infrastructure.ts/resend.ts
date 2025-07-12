import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { EmailSender } from "../domain/emailSender.js";
import { Resend } from "resend";

const resend = new Resend("re_123456789");

const emailFrom = "Acme <onboarding@resend.dev>";

export class ResendEmailSender implements EmailSender {
  async sendTransactionalEmail(params: {
    to: EmailAddress;
    subject: string;
    content: string;
  }): Promise<void> {
    const { to, subject, content } = params;

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: [to.getValue()],
      subject,
      html: content,
    });

    //TODO: register error in a log
    if (error) {
      return console.error({ error });
    }

    if (data) {
      return console.log({ data });
    }
  }
}
