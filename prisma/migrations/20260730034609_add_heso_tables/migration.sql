-- CreateTable
CREATE TABLE "HeSoBe" (
    "id" SERIAL NOT NULL,
    "loai" TEXT NOT NULL,
    "heSo" DOUBLE PRECISION NOT NULL,
    "dieuKien" TEXT NOT NULL,
    "thuTu" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HeSoBe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeSoGiaCong" (
    "id" SERIAL NOT NULL,
    "tenLoai" TEXT NOT NULL,
    "heSo" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HeSoGiaCong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeSoCuon" (
    "id" SERIAL NOT NULL,
    "tenLoai" TEXT NOT NULL,
    "heSo" DOUBLE PRECISION NOT NULL,
    "dieuKien" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "HeSoCuon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeSoPitchiKakumaru" (
    "id" SERIAL NOT NULL,
    "loai" TEXT NOT NULL,
    "heSo" DOUBLE PRECISION NOT NULL,
    "dieuKien" TEXT NOT NULL,
    "thuTu" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HeSoPitchiKakumaru_pkey" PRIMARY KEY ("id")
);
