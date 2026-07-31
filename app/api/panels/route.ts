import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { donHangId, donGiaVL, klThucTe, ...panelData } = body
  const panel = await prisma.panel.create({
    data: { donHangId: Number(donHangId), ...panelData },
  })
  // Cập nhật tongTien
  const allPanels = await prisma.panel.findMany({ where: { donHangId: Number(donHangId) } })
  const tongTien = allPanels.reduce((s, p) => s + p.allIn, 0)
  await prisma.donHang.update({ where: { id: Number(donHangId) }, data: { tongTien } })
  return NextResponse.json(panel)
}
