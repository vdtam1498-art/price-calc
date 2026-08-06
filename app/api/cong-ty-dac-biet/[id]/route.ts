import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const item = await prisma.congTyDacBiet.update({
    where: { id: Number(params.id) },
    data: { tenCongTy: body.tenCongTy, donGiaTamDon: Number(body.donGiaTamDon) || 0, donGiaTamGiaCong: Number(body.donGiaTamGiaCong) || 0 }
  })
  return NextResponse.json(item)
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.congTyDacBiet.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
