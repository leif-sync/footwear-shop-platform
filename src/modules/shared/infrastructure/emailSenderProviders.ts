import { EmailProviderOptions } from "../../notification/domain/emailMessage.js";
import { EmailSender } from "../../notification/domain/emailSender.js";
import { DebugEmailSender } from "../../notification/infrastructure.ts/debugEmailSender.js";
import { ResendEmailSender } from "../../notification/infrastructure.ts/resendEmailSender.js";
import { EmailAddress } from "../domain/emailAddress.js";

export abstract class EmailSenderProviders {
  static getEmailSender(params: {
    apiKey?: string;
    provider: EmailProviderOptions;
    from: EmailAddress;
  }): EmailSender {
    const formatErrorMessage = (provider: EmailProviderOptions): string => {
      return `API key is required for ${provider} email provider.`;
    };

    if (params.provider === EmailProviderOptions.DEBUG) {
      return new DebugEmailSender({ from: params.from });
    }

    if (params.provider === EmailProviderOptions.RESEND) {
      if (!params.apiKey) throw new Error(formatErrorMessage(params.provider));

      return new ResendEmailSender({
        apiKey: params.apiKey,
        from: params.from,
      });
    }

    throw new Error(
      `Unsupported email provider: ${params.provider}. Supported providers are: ${Object.values(
        EmailProviderOptions
      ).join(", ")}`
    );
  }
}
