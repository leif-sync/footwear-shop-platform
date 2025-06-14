import { Email } from "../../shared/domain/email.js";
import { LoginCode } from "./loginCode.js";

export abstract class LoginCodeRepository {
  abstract create(params: { loginCode: LoginCode }): Promise<void>;

  abstract find(params: {
    notificationEmail: Email;
  }): Promise<LoginCode | null>;
  
  abstract find(params: {
    code: string;
    notificationEmail: Email;
  }): Promise<LoginCode | null>;

  abstract delete(params: {
    code: string;
    notificationEmail: Email;
  }): Promise<void>;
}
