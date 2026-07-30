import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rows = await prisma.congTy.findMany({ orderBy: { tenCongTy: 'asc' } })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const row = await prisma.congTy.create({ data: body })
  return NextResponse.json(row)
}
