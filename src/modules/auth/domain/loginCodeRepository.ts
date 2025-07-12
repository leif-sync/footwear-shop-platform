import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { LoginCode } from "./loginCode.js";

export abstract class LoginCodeRepository {
  abstract create(params: { loginCode: LoginCode }): Promise<void>;

  abstract find(params: {
    notificationEmail: EmailAddress;
  }): Promise<LoginCode | null>;

  abstract find(params: {
    code: string;
    notificationEmail: EmailAddress;
  }): Promise<LoginCode | null>;

  abstract delete(params: {
    code: string;
    notificationEmail: EmailAddress;
  }): Promise<void>;
}
