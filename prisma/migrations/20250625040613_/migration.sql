/*
  Warnings:

  - A unique constraint covering the columns `[notificationEmail]` on the table `LoginCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LoginCode_notificationEmail_key" ON "LoginCode"("notificationEmail");
