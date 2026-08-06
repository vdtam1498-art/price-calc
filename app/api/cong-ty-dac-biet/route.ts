import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() {
  try {
    const data = await prisma.congTyDacBiet.findMany({ orderBy: { id: 'asc' } })
    return NextResponse.json(data)
  } catch(e: any) {
    console.error('CTDB error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await prisma.congTyDacBiet.create({ data: {
    tenCongTy: body.tenCongTy,
    donGiaTamDon: Number(body.donGiaTamDon) || 0,
    donGiaTamGiaCong: Number(body.donGiaTamGiaCong) || 0,
  }})
  return NextResponse.json(item)
}
