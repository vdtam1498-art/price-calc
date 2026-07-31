import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const tuNgay = searchParams.get('tuNgay')
  const denNgay = searchParams.get('denNgay')

  const where: any = {}
  if (search) {
    where.OR = [
      { maDon: { contains: search, mode: 'insensitive' } },
      { tenCongTy: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (tuNgay) where.ngayTao = { ...where.ngayTao, gte: new Date(tuNgay) }
  if (denNgay) where.ngayTao = { ...where.ngayTao, lte: new Date(denNgay) }

  const donHangs = await prisma.donHang.findMany({
    where,
    include: { panels: true },
    orderBy: { ngayTao: 'desc' },
  })
  return NextResponse.json(donHangs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { maDon, tenCongTy, ghiChu, loaiDon } = body
  const donHang = await prisma.donHang.create({
    data: { maDon, tenCongTy: tenCongTy || '', ghiChu: ghiChu || '', loaiDon: loaiDon || 'bao_gia' },
    include: { panels: true },
  })
  return NextResponse.json(donHang)
}
