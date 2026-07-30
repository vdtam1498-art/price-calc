-- CreateTable
CREATE TABLE "HeSoGiaVL" (
    "id" SERIAL NOT NULL,
    "tenLoai" TEXT NOT NULL,
    "heSo" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HeSoGiaVL_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeSoGiaVL_tenLoai_key" ON "HeSoGiaVL"("tenLoai");
