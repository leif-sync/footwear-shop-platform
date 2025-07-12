import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { UUID } from "../../shared/domain/UUID.js";

export enum EmailProviderOptions {
  RESEND = "RESEND",
  DEBUG = "DEBUG",
}

export class EmailProvider {
  private readonly provider: EmailProviderOptions;

  constructor(provider: EmailProviderOptions) {
    this.provider = provider;
  }

  getValue(): EmailProviderOptions {
    return this.provider;
  }

  static create: Record<EmailProviderOptions, EmailProvider> = {
    [EmailProviderOptions.RESEND]: new EmailProvider(EmailProviderOptions.RESEND),
    [EmailProviderOptions.DEBUG]: new EmailProvider(EmailProviderOptions.DEBUG),
  };

  static from(provider: string): EmailProvider {
    return new EmailProvider(provider as EmailProviderOptions);
  }
}

export enum EmailTypeOptions {
  PURCHASE_CONFIRMATION = "PURCHASE_CONFIRMATION",
}

export class EmailType {
  private readonly type: EmailTypeOptions;

  constructor(type: EmailTypeOptions) {
    this.type = type;
  }

  getValue(): EmailTypeOptions {
    return this.type;
  }

  static create: Record<EmailTypeOptions, EmailType> = {
    [EmailTypeOptions.PURCHASE_CONFIRMATION]: new EmailType(
      EmailTypeOptions.PURCHASE_CONFIRMATION
    ),
  };

  static from(type: string): EmailType {
    return new EmailType(type as EmailTypeOptions);
  }
}

export enum EmailRelatedEntityTypeOptions {
  ORDER = "ORDER",
}

export class EmailRelatedEntityType {
  private readonly type: EmailRelatedEntityTypeOptions;

  constructor(type: EmailRelatedEntityTypeOptions) {
    this.type = type;
  }

  getValue(): EmailRelatedEntityTypeOptions {
    return this.type;
  }

  static create: Record<EmailRelatedEntityTypeOptions, EmailRelatedEntityType> = {
    [EmailRelatedEntityTypeOptions.ORDER]: new EmailRelatedEntityType(
      EmailRelatedEntityTypeOptions.ORDER
    ),
  };

  static from(type: string): EmailRelatedEntityType {
    return new EmailRelatedEntityType(type as EmailRelatedEntityTypeOptions);
  }
}

export enum EmailStatusOptions {
  PENDING = "PENDING",
  SENT = "SENT",
  FAILED = "FAILED",
}

export class EmailStatus {
  private readonly status: EmailStatusOptions;

  constructor(status: EmailStatusOptions) {
    this.status = status;
  }

  getValue(): EmailStatusOptions {
    return this.status;
  }

  static create: Record<EmailStatusOptions, EmailStatus> = {
    [EmailStatusOptions.PENDING]: new EmailStatus(EmailStatusOptions.PENDING),
    [EmailStatusOptions.SENT]: new EmailStatus(EmailStatusOptions.SENT),
    [EmailStatusOptions.FAILED]: new EmailStatus(EmailStatusOptions.FAILED),
  };

  static from(status: string): EmailStatus {
    return new EmailStatus(status as EmailStatusOptions);
  }
}

export interface EmailMessagePrimitive {
  from: string;
  to: string;
  subject: string;
  htmlContent: string;
  provider: EmailProviderOptions;
  emailId: string;
  type: EmailTypeOptions;
  createdAt: Date;
  updatedAt: Date;
  status: EmailStatusOptions;
  retryCount: number;
  maxRetries: number;
  relatedEntityId?: string;
  providerMessageId?: string;
  relatedEntityType?: EmailRelatedEntityTypeOptions;
  providerResponseJson?: string;
}

export class EmailMessage {
  private readonly from: EmailAddress;
  private readonly to: EmailAddress;
  private readonly subject: string;
  private readonly htmlContent: string;
  private readonly provider: EmailProvider;
  private readonly emailId: UUID;
  private readonly type: EmailType;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;
  private readonly status: EmailStatus;
  private readonly retryCount: NonNegativeInteger;
  private readonly maxRetries: NonNegativeInteger;
  private readonly relatedEntityId?: UUID;
  private readonly providerMessageId?: string;
  private readonly relatedEntityType?: EmailRelatedEntityType;
  private readonly providerResponseJson?: string;

  constructor(params: {
    from: EmailAddress;
    to: EmailAddress;
    subject: string;
    htmlContent: string;
    provider: EmailProvider;
    emailId: UUID;
    type: EmailType;
    createdAt: Date;
    updatedAt: Date;
    status: EmailStatus;
    retryCount: NonNegativeInteger;
    maxRetries: NonNegativeInteger;
    relatedEntityId?: UUID;
    providerMessageId?: string;
    relatedEntityType?: EmailRelatedEntityType;
    providerResponseJson?: string;
  }) {
    this.from = params.from;
    this.to = params.to;
    this.subject = params.subject;
    this.htmlContent = params.htmlContent;
    this.provider = params.provider;
    this.emailId = params.emailId;
    this.type = params.type;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.status = params.status;
    this.retryCount = params.retryCount;
    this.maxRetries = params.maxRetries;
    this.relatedEntityId = params.relatedEntityId;
    this.providerMessageId = params.providerMessageId;
    this.relatedEntityType = params.relatedEntityType;
    this.providerResponseJson = params.providerResponseJson;
  }

  getEmailId(): UUID {
    return this.emailId;
  }

  getFrom(): EmailAddress {
    return this.from;
  }

  getTo(): EmailAddress {
    return this.to;
  }

  getSubject(): string {
    return this.subject;
  }

  getHtmlContent(): string {
    return this.htmlContent;
  }

  getProvider(): EmailProvider {
    return this.provider;
  }

  getType(): EmailType {
    return this.type;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getStatus(): EmailStatus {
    return this.status;
  }

  getRetryCount(): NonNegativeInteger {
    return this.retryCount;
  }

  getMaxRetries(): NonNegativeInteger {
    return this.maxRetries;
  }

  getRelatedEntityId(): UUID | undefined {
    return this.relatedEntityId;
  }

  getProviderMessageId(): string | undefined {
    return this.providerMessageId;
  }

  getRelatedEntityType(): EmailRelatedEntityType | undefined {
    return this.relatedEntityType;
  }

  getProviderResponseJson(): string | undefined {
    return this.providerResponseJson;
  }

  toPrimitives(): EmailMessagePrimitive {
    return {
      from: this.from.getValue(),
      to: this.to.getValue(),
      subject: this.subject,
      htmlContent: this.htmlContent,
      provider: this.provider.getValue(),
      emailId: this.emailId.getValue(),
      type: this.type.getValue(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      status: this.status.getValue(),
      retryCount: this.retryCount.getValue(),
      maxRetries: this.maxRetries.getValue(),
      relatedEntityId: this.relatedEntityId?.getValue(),
      providerMessageId: this.providerMessageId,
      relatedEntityType: this.relatedEntityType?.getValue(),
      providerResponseJson: this.providerResponseJson,
    };
  }

  static clone(emailMessage: EmailMessage): EmailMessage {
    return new EmailMessage({
      from: emailMessage.getFrom(),
      to: emailMessage.getTo(),
      subject: emailMessage.getSubject(),
      htmlContent: emailMessage.getHtmlContent(),
      provider: emailMessage.getProvider(),
      emailId: emailMessage.getEmailId(),
      type: emailMessage.type,
      createdAt: new Date(emailMessage.createdAt),
      updatedAt: new Date(emailMessage.updatedAt),
      status: emailMessage.status,
      retryCount: new NonNegativeInteger(emailMessage.retryCount.getValue()),
      maxRetries: new NonNegativeInteger(emailMessage.maxRetries.getValue()),
      relatedEntityId: emailMessage.relatedEntityId,
      providerMessageId: emailMessage.providerMessageId,
      relatedEntityType: emailMessage.relatedEntityType,
      providerResponseJson: emailMessage.providerResponseJson,
    });
  }

  clone(): EmailMessage {
    return EmailMessage.clone(this);
  }

  static from(params: EmailMessagePrimitive): EmailMessage {
    return new EmailMessage({
      from: new EmailAddress(params.from),
      to: new EmailAddress(params.to),
      subject: params.subject,
      htmlContent: params.htmlContent,
      provider: EmailProvider.from(params.provider),
      emailId: new UUID(params.emailId),
      type: EmailType.from(params.type),
      createdAt: new Date(params.createdAt),
      updatedAt: new Date(params.updatedAt),
      status: EmailStatus.from(params.status),
      retryCount: new NonNegativeInteger(params.retryCount),
      maxRetries: new NonNegativeInteger(params.maxRetries),
      relatedEntityId: params.relatedEntityId
        ? new UUID(params.relatedEntityId)
        : undefined,
      providerMessageId: params.providerMessageId,
      relatedEntityType: params.relatedEntityType
        ? EmailRelatedEntityType.from(params.relatedEntityType)
        : undefined,
      providerResponseJson: params.providerResponseJson,
    });
  }
}
