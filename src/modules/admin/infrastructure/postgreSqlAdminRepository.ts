import { Admin } from "../domain/admin.js";
import { AdminRepository } from "../domain/adminRepository.js";
import {
  prismaConnection,
  PrismaTransaction,
} from "../../shared/infrastructure/prismaClient.js";
import { Email } from "../../shared/domain/email.js";
import { UUID } from "../../shared/domain/UUID.js";
import { AdminFirstName } from "../domain/adminFirstName.js";
import { AdminLastName } from "../domain/adminLastName.js";
import { AdminPermission } from "../domain/adminPermission.js";
import { Phone } from "../../shared/domain/phone.js";

export class PostgreSqlAdminRepository implements AdminRepository {
  private readonly transactionContext?: PrismaTransaction;
  private readonly isWithTransactionContext: boolean;

  constructor(params: { transactionContext?: PrismaTransaction } = {}) {
    this.transactionContext = params.transactionContext;
    this.isWithTransactionContext = Boolean(this.transactionContext);
  }

  async create(params: { admin: Admin }): Promise<void> {
    const {
      adminId,
      createdAt,
      email,
      firstName,
      lastName,
      permissions,
      phoneNumber,
      updatedAt,
    } = params.admin.toPrimitives();

    const connection = this.transactionContext ?? prismaConnection;

    await connection.admin.create({
      data: {
        adminId,
        createdAt,
        email,
        firstName,
        lastName,
        phoneNumber,
        updatedAt,
        permissions: permissions
      },
    });
  }

  async find(params: { adminId: UUID }): Promise<Admin | null>;
  async find(params: { adminEmail: Email }): Promise<Admin | null>;
  async find(
    params: { adminId: UUID } | { adminEmail: Email }
  ): Promise<Admin | null> {
    const isAdminId = "adminId" in params;

    const connection = this.transactionContext ?? prismaConnection;

    if (isAdminId) {
      const admin = await connection.admin.findUnique({
        where: { adminId: params.adminId.getValue() },
      });

      if (!admin) return null;

      return new Admin({
        adminId: new UUID(admin.adminId),
        createdAt: admin.createdAt,
        email: new Email(admin.email),
        firstName: new AdminFirstName(admin.firstName),
        lastName: new AdminLastName(admin.lastName),
        permissions: admin.permissions.map((permission) =>
          AdminPermission.from(permission)
        ),
        phoneNumber: new Phone(admin.phoneNumber),
        updatedAt: admin.updatedAt,
      });
    }

    const admin = await connection.admin.findUnique({
      where: { email: params.adminEmail.getValue() },
    });

    if (!admin) return null;

    return new Admin({
      adminId: new UUID(admin.adminId),
      createdAt: admin.createdAt,
      email: new Email(admin.email),
      firstName: new AdminFirstName(admin.firstName),
      lastName: new AdminLastName(admin.lastName),
      permissions: admin.permissions.map((permission) =>
        AdminPermission.from(permission)
      ),
      phoneNumber: new Phone(admin.phoneNumber),
      updatedAt: admin.updatedAt,
    });
  }

  async update(params: { admin: Admin }): Promise<void> {
    const {
      adminId,
      createdAt,
      email,
      firstName,
      lastName,
      permissions,
      phoneNumber,
      updatedAt,
    } = params.admin.toPrimitives();

    const connection = this.transactionContext ?? prismaConnection;

    await connection.admin.update({
      where: { adminId },
      data: {
        createdAt,
        email,
        firstName,
        lastName,
        phoneNumber,
        updatedAt,
        permissions
      },
    });
  }
}
