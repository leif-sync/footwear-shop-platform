import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { UUID } from "../../shared/domain/UUID.js";
import {
  EmailMessage,
  EmailProviderOptions,
  EmailStatusOptions,
  EmailTypeOptions,
  EmailRelatedEntityTypeOptions,
} from "./emailMessage.js";

export type EmailSearchOptions = {
  emailId: UUID;
};

export interface EmailCriteria {
  emailId?: UUID;
  from?: EmailAddress;
  to?: EmailAddress;
  provider?: EmailProviderOptions;
  type?: EmailTypeOptions;
  status?: EmailStatusOptions;
  providerMessageId?: string;
  relatedEntityId?: UUID;
  relatedEntityType?: EmailRelatedEntityTypeOptions;
}

export abstract class EmailRepository {
  abstract create(params: { emailMessage: EmailMessage }): Promise<void>;
  abstract find(params: {
    searchOption: EmailSearchOptions;
  }): Promise<EmailMessage | null>;
  abstract list(params: { criteria: EmailCriteria }): Promise<EmailMessage[]>;
  abstract delete(params: { searchOption: EmailSearchOptions }): Promise<void>;
  abstract deleteMany(params: { criteria: EmailCriteria }): Promise<void>;
}
