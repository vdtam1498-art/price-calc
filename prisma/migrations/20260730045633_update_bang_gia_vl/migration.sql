/*
  Warnings:

  - You are about to drop the column `donGiaLo` on the `BangGiaVL` table. All the data in the column will be lost.
  - You are about to drop the column `donGiaLoTappu` on the `BangGiaVL` table. All the data in the column will be lost.
  - You are about to drop the column `donGiaVL` on the `BangGiaVL` table. All the data in the column will be lost.
  - You are about to drop the column `tienBe` on the `BangGiaVL` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BangGiaVL" DROP COLUMN "donGiaLo",
DROP COLUMN "donGiaLoTappu",
DROP COLUMN "donGiaVL",
DROP COLUMN "tienBe",
ADD COLUMN     "datNgoai" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "donGia" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "giaMoLo" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "giaTappu" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "giaUon" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "khongUuDai" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "uuDai" DOUBLE PRECISION NOT NULL DEFAULT 0;
