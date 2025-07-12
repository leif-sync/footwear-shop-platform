-- CreateEnum
CREATE TYPE "EmailProvider" AS ENUM ('RESEND', 'DEBUG');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('PURCHASE_CONFIRMATION');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "RelatedEntityType" AS ENUM ('ORDER');

-- CreateTable
CREATE TABLE "EmailMessage" (
    "emailId" UUID NOT NULL,
    "fromEmailAddress" TEXT NOT NULL,
    "toEmailAddress" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "contentHtml" TEXT NOT NULL,
    "provider" "EmailProvider" NOT NULL,
    "type" "EmailType" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "status" "EmailStatus" NOT NULL,
    "retryCount" INTEGER NOT NULL,
    "maxRetries" INTEGER NOT NULL,
    "relatedEntityId" UUID,
    "providerMessageId" TEXT,
    "relatedEntityType" "RelatedEntityType",
    "providerResponseJson" JSONB,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("emailId")
);
