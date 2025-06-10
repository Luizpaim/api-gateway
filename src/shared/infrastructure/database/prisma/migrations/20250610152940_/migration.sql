/*
  Warnings:

  - You are about to drop the column `maxVisits` on the `shortened_url` table. All the data in the column will be lost.
  - You are about to drop the column `validSince` on the `shortened_url` table. All the data in the column will be lost.
  - You are about to drop the column `validUntil` on the `shortened_url` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "shortened_url" DROP COLUMN "maxVisits",
DROP COLUMN "validSince",
DROP COLUMN "validUntil";
