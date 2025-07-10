/*
  Warnings:

  - You are about to drop the `Permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AdminToPermissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "validPermissionOptions" AS ENUM ('CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'CREATE_VARIANT', 'UPDATE_VARIANT', 'DELETE_VARIANT', 'CREATE_CATEGORY', 'DELETE_CATEGORY', 'VIEW_CATEGORY', 'CREATE_DETAIL', 'VIEW_DETAIL', 'DELETE_DETAIL', 'UPDATE_ORDER', 'VIEW_ORDER', 'CREATE_SIZE', 'DELETE_SIZE', 'VIEW_SIZE', 'CREATE_TAG', 'DELETE_TAG', 'VIEW_TAG', 'UPDATE_PROFILE', 'VIEW_PAYMENT');

-- DropForeignKey
ALTER TABLE "_AdminToPermissions" DROP CONSTRAINT "_AdminToPermissions_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToPermissions" DROP CONSTRAINT "_AdminToPermissions_B_fkey";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "permissions" "validPermissionOptions"[];

-- DropTable
DROP TABLE "Permissions";

-- DropTable
DROP TABLE "_AdminToPermissions";
