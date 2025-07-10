import { EmailSender } from "../../notification/domain/emailSender.js";
import { DebugEmailSender } from "../../notification/infrastructure.ts/debugEmailSender.js";

export enum EmailSenderOptions {
  DEBUG = "DEBUG",
}

export const EmailSenderProviders: Record<EmailSenderOptions, EmailSender> = {
  [EmailSenderOptions.DEBUG]: new DebugEmailSender(),
};
