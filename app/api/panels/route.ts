import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { donHangId, maDonGoc, ...panelData } = body
    let targetDonHangId = Number(donHangId)
    // Kiểm tra đơn hàng còn tồn tại không
    const donHang = await prisma.donHang.findUnique({ where: { id: targetDonHangId } })
    if (!donHang) {
      // Tạo lại đơn hàng mới, dùng maDonGoc nếu có
      const newDon = await prisma.donHang.create({
        data: { maDon: maDonGoc || String(targetDonHangId), tongTien: 0, loaiDon: 'bao_gia' }
      })
      targetDonHangId = newDon.id
    }
    const panel = await prisma.panel.create({
      data: { donHangId: targetDonHangId, ...panelData },
    })
    // Cập nhật tongTien
    const allPanels = await prisma.panel.findMany({ where: { donHangId: targetDonHangId } })
    const tongTien = allPanels.reduce((s, p) => s + p.allIn, 0)
    await prisma.donHang.update({ where: { id: targetDonHangId }, data: { tongTien } })
    return NextResponse.json({ ...panel, donHangId: targetDonHangId })
  } catch (err: any) {
    console.error('POST /api/panels error:', err)
    return NextResponse.json({ error: err.message || 'Lỗi lưu panel' }, { status: 500 })
  }
}
