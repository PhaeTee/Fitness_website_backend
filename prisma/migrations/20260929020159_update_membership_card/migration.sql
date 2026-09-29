/*
  Warnings:

  - You are about to drop the column `cardNumber` on the `MembershipCard` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accessId]` on the table `MembershipCard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessId` to the `MembershipCard` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MembershipCard_cardNumber_key";

-- AlterTable
ALTER TABLE "MembershipCard" DROP COLUMN "cardNumber",
ADD COLUMN     "accessId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MembershipCard_accessId_key" ON "MembershipCard"("accessId");
