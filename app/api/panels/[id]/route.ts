import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const panel = await prisma.panel.update({
    where: { id: Number(params.id) },
    data: body,
  })
  const allPanels = await prisma.panel.findMany({ where: { donHangId: panel.donHangId } })
  const tongTien = allPanels.reduce((s, p) => s + p.allIn, 0)
  await prisma.donHang.update({ where: { id: panel.donHangId }, data: { tongTien } })
  return NextResponse.json(panel)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const panel = await prisma.panel.delete({ where: { id: Number(params.id) } })
  const allPanels = await prisma.panel.findMany({ where: { donHangId: panel.donHangId } })
  const tongTien = allPanels.reduce((s, p) => s + p.allIn, 0)
  await prisma.donHang.update({ where: { id: panel.donHangId }, data: { tongTien } })
  return NextResponse.json({ ok: true })
}
