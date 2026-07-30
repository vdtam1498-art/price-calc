/*
  Warnings:

  - You are about to drop the column `datNgoai` on the `BangGiaVL` table. All the data in the column will be lost.
  - You are about to drop the column `khongUuDai` on the `BangGiaVL` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BangGiaVL" DROP COLUMN "datNgoai",
DROP COLUMN "khongUuDai",
ADD COLUMN     "datNgoaiSS" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "datNgoaiSUS" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "khongUuDaiSS" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "khongUuDaiSUS" DOUBLE PRECISION NOT NULL DEFAULT 0;
