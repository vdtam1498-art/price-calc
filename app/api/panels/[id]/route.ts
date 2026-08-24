import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    // Loại bỏ các field không được phép update trực tiếp
    const { id, donHangId, maDonGoc, donHang, panels, createdAt, updatedAt, ...panelData } = body
    const panel = await prisma.panel.update({
      where: { id: Number(params.id) },
      data: panelData,
    })
    const allPanels = await prisma.panel.findMany({ where: { donHangId: panel.donHangId } })
    const tongTien = allPanels.reduce((s, p) => s + p.allIn, 0)
    await prisma.donHang.update({ where: { id: panel.donHangId }, data: { tongTien } })
    return NextResponse.json(panel)
  } catch (err: any) {
    console.error('PUT /api/panels/[id] error:', err)
    return NextResponse.json({ error: err.message || 'Lỗi cập nhật panel' }, { status: 500 })
  }
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const panel = await prisma.panel.delete({ where: { id: Number(params.id) } })
  const allPanels = await prisma.panel.findMany({ where: { donHangId: panel.donHangId } })
  const tongTien = allPanels.reduce((s, p) => s + p.allIn, 0)
  await prisma.donHang.update({ where: { id: panel.donHangId }, data: { tongTien } })
  return NextResponse.json({ ok: true })
}
