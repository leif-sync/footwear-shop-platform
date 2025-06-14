import { Email } from "../../shared/domain/email.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Admin } from "./admin.js";

export abstract class AdminRepository {
  abstract create(params: { admin: Admin }): Promise<void>;

  abstract find(params: { adminId: UUID }): Promise<Admin | null>;
  abstract find(params: { adminEmail: Email }): Promise<Admin | null>;

  abstract update(params: { admin: Admin }): Promise<void>;
}
