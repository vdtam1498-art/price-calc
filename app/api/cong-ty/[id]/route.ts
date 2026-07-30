import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const row = await prisma.congTy.update({ where: { id: Number(params.id) }, data: body })
  return NextResponse.json(row)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.congTy.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
