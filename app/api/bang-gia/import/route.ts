import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const rows = body.rows as any[]
  
  let inserted = 0, skipped = 0, errors = 0
  
  for (const row of rows) {
    try {
      await prisma.bangGiaVL.upsert({
        where: { vatLieu_doDay: { vatLieu: row.vatLieu, doDay: Number(row.doDay) } },
        update: {
          donGia: Number(row.donGia) || 0,
          giaUon: Number(row.giaUon) || 0,
          giaCat: Number(row.giaCat) || 0,
          giaMoLo: Number(row.giaMoLo) || 0,
          giaTappu: Number(row.giaTappu) || 0,
          giaVat: Number(row.giaVat) || 0,
          tyTrong: Number(row.tyTrong) || 7.85,
        },
        create: {
          vatLieu: row.vatLieu,
          doDay: Number(row.doDay),
          donGia: Number(row.donGia) || 0,
          giaUon: Number(row.giaUon) || 0,
          giaCat: Number(row.giaCat) || 0,
          giaMoLo: Number(row.giaMoLo) || 0,
          giaTappu: Number(row.giaTappu) || 0,
          giaVat: Number(row.giaVat) || 0,
          tyTrong: Number(row.tyTrong) || 7.85,
        }
      })
      inserted++
    } catch(e) {
      errors++
    }
  }
  
  return NextResponse.json({ inserted, skipped, errors })
}
