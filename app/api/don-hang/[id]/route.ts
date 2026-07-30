import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const donHang = await prisma.donHang.findUnique({
    where: { id: Number(params.id) },
    include: { panels: true },
  })
  if (!donHang) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(donHang)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const donHang = await prisma.donHang.update({
    where: { id: Number(params.id) },
    data: body,
    include: { panels: true },
  })
  return NextResponse.json(donHang)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.donHang.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
