import { randomUUID } from "node:crypto";
import { z } from "zod";

const idSchema = z.string().uuid();

export class UUID {
  private readonly value: string;

  constructor(value: string) {
    const isValid = this.isValid(value);
    if (!isValid) {
      throw new TypeError(
        `Invalid UUID: ${value}. Expected a valid UUID string.`
      );
    }

    this.value = value;
  }

  static generateRandomUUID() {
    return new UUID(randomUUID());
  }

  static clone(uuid: UUID): UUID {
    return new UUID(uuid.value);
  }

  equals(id: UUID | string): boolean {
    if (id instanceof UUID) return this.value === id.value;
    return this.value === id;
  }

  getValue() {
    return this.value;
  }

  isValid(data: string): boolean {
    return idSchema.safeParse(data).success;
  }
}
