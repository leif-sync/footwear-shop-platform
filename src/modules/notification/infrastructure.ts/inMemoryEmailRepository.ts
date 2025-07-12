import { EmailMessage } from "../domain/emailMessage.js";
import {
  EmailCriteria,
  EmailRepository,
  EmailSearchOptions,
} from "../domain/emailRepository.js";

type emailId = string;
export class InMemoryEmailRepository implements EmailRepository {
  private emails: Map<emailId, EmailMessage> = new Map();

  async create(params: { emailMessage: EmailMessage }): Promise<void> {
    const { emailMessage } = params;
    const emailId = emailMessage.getEmailId().getValue();
    const existingEmail = this.emails.get(emailId);
    if (existingEmail) {
      throw new Error(`Email with ID ${emailId} already exists.`);
    }
    this.emails.set(emailId, emailMessage);
  }

  async find(params: {
    searchOption: EmailSearchOptions;
  }): Promise<EmailMessage | null> {
    const { searchOption } = params;

    if ("emailId" in searchOption) {
      const emailId = searchOption.emailId.getValue();
      return this.emails.get(emailId) ?? null;
    }

    throw new Error("Invalid search option provided.");
  }

  async delete(params: { searchOption: EmailSearchOptions }): Promise<void> {
    const { searchOption } = params;

    if ("emailId" in searchOption) {
      const emailId = searchOption.emailId.getValue();
      if (!this.emails.has(emailId)) {
        throw new Error(`Email with ID ${emailId} does not exist.`);
      }
      this.emails.delete(emailId);
      return;
    }

    throw new Error("Invalid search option provided.");
  }

  async list(params: { criteria: EmailCriteria }): Promise<EmailMessage[]> {
    const { criteria } = params;

    const filteredEmails = Array.from(this.emails.values()).filter(
      (emailMessage) => {
        return this.matchesEmailCriteria(criteria, emailMessage);
      }
    );

    return filteredEmails.map(EmailMessage.clone);
  }

  async deleteMany(params: { criteria: EmailCriteria }): Promise<void> {
    const { criteria } = params;

    const emailsToDelete = Array.from(this.emails.values()).filter(
      (emailMessage) => {
        return this.matchesEmailCriteria(criteria, emailMessage);
      }
    );

    for (const email of emailsToDelete) {
      this.emails.delete(email.getEmailId().getValue());
    }
  }

  private matchesEmailCriteria(
    criteria: EmailCriteria,
    emailMessage: EmailMessage
  ) {
    let matches = true;

    if (
      matches &&
      criteria.emailId &&
      emailMessage.getEmailId().getValue() !== criteria.emailId.getValue()
    ) {
      matches = false;
    }

    if (
      matches &&
      criteria.from &&
      emailMessage.getFrom().getValue() !== criteria.from.getValue()
    ) {
      matches = false;
    }

    if (
      matches &&
      criteria.to &&
      emailMessage.getTo().getValue() !== criteria.to.getValue()
    ) {
      matches = false;
    }

    if (
      matches &&
      criteria.provider &&
      emailMessage.getProvider().getValue() !== criteria.provider
    ) {
      matches = false;
    }

    if (
      matches &&
      criteria.type &&
      emailMessage.getType().getValue() !== criteria.type
    ) {
      matches = false;
    }

    if (
      matches &&
      criteria.status &&
      emailMessage.getStatus().getValue() !== criteria.status
    ) {
      matches = false;
    }

    if (
      matches &&
      criteria.providerMessageId &&
      emailMessage.getProviderMessageId() !== criteria.providerMessageId
    ) {
      matches = false;
    }

    if (
      matches &&
      criteria.relatedEntityId &&
      emailMessage.getRelatedEntityId()?.getValue() !==
        criteria.relatedEntityId.getValue()
    ) {
      matches = false;
    }

    if (
      matches &&
      criteria.relatedEntityType &&
      emailMessage.getRelatedEntityType()?.getValue() !==
        criteria.relatedEntityType
    ) {
      matches = false;
    }

    return matches;
  }
}
