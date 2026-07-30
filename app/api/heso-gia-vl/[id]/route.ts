import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json(await prisma.heSoGiaVL.update({ where: { id: Number(params.id) }, data: await req.json() }))
}
