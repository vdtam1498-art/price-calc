import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() {
  return NextResponse.json(await prisma.heSoCuon.findMany({ orderBy: { id: 'asc' } }))
}
export async function POST(req: NextRequest) {
  return NextResponse.json(await prisma.heSoCuon.create({ data: await req.json() }))
}
