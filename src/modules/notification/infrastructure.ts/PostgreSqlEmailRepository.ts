import {
  EmailCriteria,
  EmailRepository,
  EmailSearchOptions,
} from "../domain/emailRepository.js";
import { prismaConnection } from "../../shared/infrastructure/prismaClient.js";
import {
  EmailMessage,
  EmailProvider,
  EmailRelatedEntityType,
  EmailStatus,
  EmailType,
} from "../domain/emailMessage.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { EmailAddress } from "../../shared/domain/emailAddress.js";

export class PostgreSqlEmailRepository extends EmailRepository {
  async create(params: { emailMessage: EmailMessage }): Promise<void> {
    const emailPrimitives = params.emailMessage.toPrimitives();
    await prismaConnection.emailMessage.create({
      data: {
        emailId: emailPrimitives.emailId,
        fromEmailAddress: emailPrimitives.from,
        toEmailAddress: emailPrimitives.to,
        subject: emailPrimitives.subject,
        contentHtml: emailPrimitives.htmlContent,
        provider: emailPrimitives.provider,
        type: emailPrimitives.type,
        createdAt: emailPrimitives.createdAt,
        updatedAt: emailPrimitives.updatedAt,
        status: emailPrimitives.status,
        retryCount: emailPrimitives.retryCount,
        maxRetries: emailPrimitives.maxRetries,
        relatedEntityId: emailPrimitives.relatedEntityId,
        providerMessageId: emailPrimitives.providerMessageId,
        relatedEntityType: emailPrimitives.relatedEntityType,
        providerResponseJson: emailPrimitives.providerResponseJson,
      },
    });
  }

  async find(params: {
    searchOption: EmailSearchOptions;
  }): Promise<EmailMessage | null> {
    const { searchOption } = params;
    const emailId = searchOption.emailId.getValue();

    const emailRecord = await prismaConnection.emailMessage.findUnique({
      where: { emailId },
    });

    if (!emailRecord) return null;

    return new EmailMessage({
      from: new EmailAddress(emailRecord.fromEmailAddress),
      to: new EmailAddress(emailRecord.toEmailAddress),
      subject: emailRecord.subject,
      htmlContent: emailRecord.contentHtml,
      provider: EmailProvider.from(emailRecord.provider),
      emailId: new UUID(emailRecord.emailId),
      type: EmailType.from(emailRecord.type),
      createdAt: emailRecord.createdAt,
      updatedAt: emailRecord.updatedAt,
      status: EmailStatus.from(emailRecord.status),
      retryCount: new NonNegativeInteger(emailRecord.retryCount),
      maxRetries: new NonNegativeInteger(emailRecord.maxRetries),
      relatedEntityId: emailRecord.relatedEntityId
        ? new UUID(emailRecord.relatedEntityId)
        : undefined,
      providerMessageId: emailRecord.providerMessageId ?? undefined,
      relatedEntityType: emailRecord.relatedEntityType
        ? EmailRelatedEntityType.from(emailRecord.relatedEntityType)
        : undefined,
      providerResponseJson: JSON.stringify(emailRecord.providerResponseJson),
    });
  }

  async list(params: { criteria: EmailCriteria }): Promise<EmailMessage[]> {
    const emails = await prismaConnection.emailMessage.findMany({
      where: {
        emailId: params.criteria.emailId?.getValue(),
        fromEmailAddress: params.criteria.from?.getValue(),
        toEmailAddress: params.criteria.to?.getValue(),
        provider: params.criteria.provider,
        type: params.criteria.type,
        status: params.criteria.status,
        providerMessageId: params.criteria.providerMessageId,
        relatedEntityId: params.criteria.relatedEntityId?.getValue(),
        relatedEntityType: params.criteria.relatedEntityType,
      },
    });

    return emails.map((emailRecord) => {
      return new EmailMessage({
        from: new EmailAddress(emailRecord.fromEmailAddress),
        to: new EmailAddress(emailRecord.toEmailAddress),
        subject: emailRecord.subject,
        htmlContent: emailRecord.contentHtml,
        provider: EmailProvider.from(emailRecord.provider),
        emailId: new UUID(emailRecord.emailId),
        type: EmailType.from(emailRecord.type),
        createdAt: emailRecord.createdAt,
        updatedAt: emailRecord.updatedAt,
        status: EmailStatus.from(emailRecord.status),
        retryCount: new NonNegativeInteger(emailRecord.retryCount),
        maxRetries: new NonNegativeInteger(emailRecord.maxRetries),
        relatedEntityId: emailRecord.relatedEntityId
          ? new UUID(emailRecord.relatedEntityId)
          : undefined,
        providerMessageId: emailRecord.providerMessageId ?? undefined,
        relatedEntityType: emailRecord.relatedEntityType
          ? EmailRelatedEntityType.from(emailRecord.relatedEntityType)
          : undefined,
        providerResponseJson: JSON.stringify(emailRecord.providerResponseJson),
      });
    });
  }

  async delete(params: { searchOption: EmailSearchOptions }): Promise<void> {
    const { searchOption } = params;
    const emailId = searchOption.emailId.getValue();

    await prismaConnection.emailMessage.delete({
      where: { emailId },
    });
  }

  async deleteMany(params: { criteria: EmailCriteria }): Promise<void> {
    const { criteria } = params;

    await prismaConnection.emailMessage.deleteMany({
      where: {
        emailId: criteria.emailId?.getValue(),
        fromEmailAddress: criteria.from?.getValue(),
        toEmailAddress: criteria.to?.getValue(),
        provider: criteria.provider,
        type: criteria.type,
        status: criteria.status,
        providerMessageId: criteria.providerMessageId,
        relatedEntityId: criteria.relatedEntityId?.getValue(),
        relatedEntityType: criteria.relatedEntityType,
      },
    });
  }
}
