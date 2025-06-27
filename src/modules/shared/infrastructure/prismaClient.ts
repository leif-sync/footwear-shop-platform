import { PrismaClient } from "../../../../generated/prisma/index.js";

export const prismaConnection = new PrismaClient();
export type PrismaTransaction = Parameters<
  Parameters<typeof prismaConnection.$transaction>[0]
>[0];
export type PrismaConnection = typeof prismaConnection;
