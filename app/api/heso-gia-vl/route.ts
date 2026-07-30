import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() {
  return NextResponse.json(await prisma.heSoGiaVL.findMany({ orderBy: { id: 'asc' } }))
}
export async function POST(req: NextRequest) {
  return NextResponse.json(await prisma.heSoGiaVL.create({ data: await req.json() }))
}
