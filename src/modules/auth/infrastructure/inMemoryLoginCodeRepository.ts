import { LoginCodeRepository } from "../domain/loginCodeRepository.js";
import { LoginCode } from "../domain/loginCode.js";
import { EmailAddress } from "../../shared/domain/emailAddress.js";

export class InMemoryLoginCodeRepository implements LoginCodeRepository {
  private loginCodes: LoginCode[] = [];

  async create(params: { loginCode: LoginCode }): Promise<void> {
    this.loginCodes.push(params.loginCode);
  }

  async find(params: {
    notificationEmail: EmailAddress;
  }): Promise<LoginCode | null>;
  async find(params: {
    code: string;
    notificationEmail: EmailAddress;
  }): Promise<LoginCode | null>;

  async find(params: {
    code?: string;
    notificationEmail: EmailAddress;
  }): Promise<LoginCode | null> {
    const { code, notificationEmail } = params;

    if (code) {
      return (
        this.loginCodes.find(
          (loginCode) =>
            loginCode.getCode() === code &&
            notificationEmail.equals(loginCode.getNotificationEmail())
        ) ?? null
      );
    }

    return (
      this.loginCodes.find((loginCode) =>
        notificationEmail.equals(loginCode.getNotificationEmail())
      ) ?? null
    );
  }

  async delete(params: {
    code: string;
    notificationEmail: EmailAddress;
  }): Promise<void> {
    const { code, notificationEmail } = params;
    this.loginCodes = this.loginCodes.filter(
      (loginCode) =>
        !(
          loginCode.getCode() === code &&
          notificationEmail.equals(loginCode.getNotificationEmail())
        )
    );
  }
}
