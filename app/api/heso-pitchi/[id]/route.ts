import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json(await prisma.heSoPitchiKakumaru.update({ where: { id: Number(params.id) }, data: await req.json() }))
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.heSoPitchiKakumaru.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
