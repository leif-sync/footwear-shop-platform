import { randomUUID } from "node:crypto";
import { z } from "zod";

const idSchema = z.string().uuid();

export class UUIDError extends Error {
  constructor(params: { invalidUUID: string }) {
    super(`Invalid UUID: ${params.invalidUUID}`);
    this.name = "UUIDError";
  }
}

export class UUID {
  private readonly value: string;

  constructor(value: string) {
    const parsed = idSchema.safeParse(value);
    if (!parsed.success) {
      throw new UUIDError({ invalidUUID: value });
    }
    this.value = value;
  }

  static from(value: string): UUID {
    const parsed = idSchema.safeParse(value);
    if (!parsed.success) {
      throw new UUIDError({ invalidUUID: value });
    }
    return new UUID(parsed.data as string);
  }

  static generateRandomUUID(): UUID {
    return new UUID(randomUUID());
  }

  static clone(uuid: UUID): UUID {
    return new UUID(uuid.value);
  }

  clone(): UUID {
    return UUID.clone(this);
  }

  equals(id: UUID | string): boolean {
    if (id instanceof UUID) return this.value === id.value;
    return this.value === id;
  }

  getValue(): string {
    return this.value;
  }

  isValid(data: string): boolean {
    return idSchema.safeParse(data).success;
  }

  toString(): string {
    return this.value;
  }
}
