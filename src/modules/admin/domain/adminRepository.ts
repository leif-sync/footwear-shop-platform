import { Email } from "../../shared/domain/email.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Admin } from "./admin.js";

/**
 * Abstract repository interface for managing Admin entities.
 * This interface defines the CRUD operations for Admins,
 */
export abstract class AdminRepository {
  abstract create(params: { admin: Admin }): Promise<void>;

  abstract find(params: { adminId: UUID }): Promise<Admin | null>;
  abstract find(params: { adminEmail: Email }): Promise<Admin | null>;

  /**
   * Updates an existing admin.
   * It uses the inner id of the admin to update the entity.
   * @param params - The parameters for updating the admin.
   * @param params.admin - The admin entity with updated fields.
   * 
   * @returns {Promise<void>} A promise that resolves when the admin is successfully updated.
   */
  abstract update(params: { admin: Admin }): Promise<void>;
}
