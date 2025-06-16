import { EmailSender } from "../../notification/domain/emailSender.js";
import { Email } from "../../shared/domain/email.js";
import { Admin } from "./admin.js";
import { COMMERCE_NAME } from "../../../environmentVariables.js";

/**
 * This class is responsible for notifying admins about updates to their details.
 * It sends an email to the admin with their updated information.
 */
export class AdminNotifier {
  private readonly emailSender: EmailSender;

  constructor(params: { emailSender: EmailSender }) {
    this.emailSender = params.emailSender;
  }

  async notifyAdminUpdate(params: { admin: Admin }) {
    const { admin } = params;

    const emailSubject = "Admin Updated";
    const emailBody = `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Updated</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
          }
          header {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-align: center;
          }
          main {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          footer {
            text-align: center;
            margin-top: 20px;
            font-size: 0.9em;
            color: #555;
          }
          ul {
            list-style-type: none;
            padding: 0;
          }
          li {
            margin: 5px 0;
          }
          p {
            line-height: 1.6;
          }
          
        </style>

        <header>
          <h1>${COMMERCE_NAME} - Admin Updated</h1>
        </header>

        <main>
          <p>Hello ${admin.getFirstName()} ${admin.getLastName()},</p>
          <p>Your admin details have been updated successfully.</p>
          <p>Here are your updated details:</p>
          <ul>
            <li>Email: ${admin.getEmail()}</li>
            <li>First Name: ${admin.getFirstName()}</li>
            <li>Last Name: ${admin.getLastName()}</li>
            <li>Phone Number: ${admin.getPhoneNumber()}</li>
            <li>Permissions: ${admin.getPermissions().join(", ")}</li>
            <li>Updated At: ${admin.getUpdatedAt().toISOString()}</li>
            <li>Created At: ${admin.getCreatedAt().toISOString()}</li>
          </ul>
          <p>If you did not make this change, please contact support immediately.</p>
        </main>

        <footer>
          <p>Thank you for being a part of ${COMMERCE_NAME}!</p>
          <p>If you have any questions, feel free to reach out to us.</p>
          <p>Best regards,</p>
          <p>The ${COMMERCE_NAME} Team</p>
        </footer>
    `;
    const adminEmail = new Email(admin.getEmail());

    await this.emailSender.sendTransactionalEmail({
      to: adminEmail,
      subject: emailSubject,
      content: emailBody,
    });
  }
}
