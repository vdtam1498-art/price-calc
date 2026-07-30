import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() {
  return NextResponse.json(await prisma.heSoPitchiKakumaru.findMany({ orderBy: [{ loai: 'asc' }, { thuTu: 'asc' }] }))
}
export async function POST(req: NextRequest) {
  return NextResponse.json(await prisma.heSoPitchiKakumaru.create({ data: await req.json() }))
}
