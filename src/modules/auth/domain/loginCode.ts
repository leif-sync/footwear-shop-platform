import { randomBytes } from "node:crypto";
import { Email } from "../../shared/domain/email.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";

export const loginCodeConstraints = {
  length: 6,
};

function generateLoginCode() {
  const code = randomBytes(Math.round(loginCodeConstraints.length / 2))
    .toString("hex")
    .toUpperCase();
  return code;
}

export class LoginCode {
  private readonly code: string;
  private readonly createdAt: Date;
  private readonly expiresInSeconds: NonNegativeInteger;
  private readonly notificationEmail: Email;
  private isUsed: boolean;

  constructor(params: {
    code: string;
    createdAt: Date;
    expiresInSeconds: NonNegativeInteger;
    notificationEmail: Email;
    isUsed: boolean;
  }) {
    this.code = params.code;
    this.createdAt = new Date(params.createdAt);
    this.expiresInSeconds = NonNegativeInteger.clone(params.expiresInSeconds);
    this.notificationEmail = Email.clone(params.notificationEmail);
    this.isUsed = params.isUsed;

    if (this.code.length !== loginCodeConstraints.length) {
      throw new Error(
        `Login code must be ${loginCodeConstraints.length} characters long`
      );
    }
  }

  static generate(): string {
    return generateLoginCode();
  }

  static create(params: {
    notificationEmail: Email;
    expiresInSeconds: NonNegativeInteger;
  }): LoginCode {
    const code = this.generate();
    const createdAt = new Date();

    return new LoginCode({
      code,
      createdAt,
      expiresInSeconds: params.expiresInSeconds,
      notificationEmail: params.notificationEmail,
      isUsed: false,
    });
  }

  static clone(loginCode: LoginCode): LoginCode {
    return new LoginCode({
      code: loginCode.getCode(),
      createdAt: loginCode.createdAt,
      expiresInSeconds: loginCode.expiresInSeconds,
      notificationEmail: loginCode.notificationEmail,
      isUsed: loginCode.isUsed,
    });
  }

  getCode(): string {
    return this.code;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getNotificationEmail(): string {
    return this.notificationEmail.getValue();
  }

  isCodeUsed(): boolean {
    return this.isUsed;
  }

  markAsUsed() {
    this.isUsed = true;
  }

  getExpiresInSeconds(): NonNegativeInteger {
    return this.expiresInSeconds;
  }

  getExpiresAt(): Date {
    const expiresAt = new Date(this.createdAt);
    expiresAt.setSeconds(
      this.createdAt.getSeconds() + this.expiresInSeconds.getValue()
    );
    return expiresAt;
  }

  isExpired(): boolean {
    const now = new Date();
    return now > this.getExpiresAt();
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isUsed;
  }
}
