/*
  Warnings:

  - Made the column `passwordHash` on table `Admin` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AdminOTP" DROP CONSTRAINT "AdminOTP_adminId_fkey";

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "passwordHash" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "AdminOTP" ADD CONSTRAINT "AdminOTP_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
