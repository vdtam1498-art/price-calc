
export interface BangGiaRow {
  id: number; vatLieu: string; doDay: number; donGiaVL: number
  tienBe: number; giaCat: number; donGiaLo: number
  donGiaLoTappu: number; giaVat: number; tyTrong: number
}
export interface BeRow { soDuong: number; daiMm: number; donGia: number }
export interface PanelInput {
  vatLieu: string; doDay: number; x: number; y: number; soLuong: number
  isUuDai: boolean; loNho: number; loLon: number; soLoTappu: number; soLoSara: number
  be: BeRow[]; pitchiGio: number; cuonGio: number; vatMm: number; giaCongVatDonGia: number
}
export interface PanelResult {
  tyTrong: number; klBaoGia: number; klThucTe: number; donGiaVLFinal: number
  tienVL: number; tienCatLaser: number; tienLoCat: number; tienTappu: number
  tienSara: number; tienBe: number; tienPitchi: number; tienCuon: number
  tienVat: number; tongGiaCong: number; gia1Tam: number; allIn: number
}
function getHeSoVL(vatLieu: string, isUuDai: boolean): number {
  const vl = vatLieu.toUpperCase()
  const isSat = ['SPCC','SPHC','SS400','SECC','SGCC'].some(v => vl.includes(v))
  if (isSat) return isUuDai ? 1.1 : 1.2
  if (vl.includes('304') && isUuDai) return 1.1
  return 1.15
}
function heSoKL(kg: number): number {
  if (kg < 40) return 1
  if (kg < 100) return 1.5
  return 2
}
function heSoCD(daiMm: number): number {
  const m = daiMm / 1000
  if (m < 3) return 1
  if (m < 4) return 2.5
  if (m < 5) return 3
  if (m < 6) return 3.5
  return 4.5
}
export function calculatePanel(input: PanelInput, bangGia: BangGiaRow[]): PanelResult | null {
  const found = bangGia.find(r => r.vatLieu === input.vatLieu && r.doDay === input.doDay)
  if (found === undefined) return null
  const r = found
  const { x, y, doDay, soLuong, isUuDai, vatLieu } = input
  const ty = r.tyTrong
  const klBaoGia = (x * y * doDay * ty) / 1_000_000
  const klThucTe = ((x + 10) * (y + 10) * doDay * ty) / 1_000_000
  const donGiaVLFinal = r.donGiaVL * getHeSoVL(vatLieu, isUuDai)
  const tienVL = klThucTe * donGiaVLFinal
  const tienCatLaser = r.giaCat * doDay * ((x + y) / 1000) * 2
  const tienLoCat = (input.loNho + input.loLon * 1.5) * r.donGiaLo
  const tienTappu = input.soLoTappu * r.donGiaLoTappu
  const tienSara = input.soLoSara * r.donGiaLoTappu
  const hsKL = heSoKL(klThucTe)
  let tienBe = 0
  for (const be of input.be) {
    tienBe += be.soDuong * (be.daiMm / 1000) * be.donGia * Math.max(hsKL, heSoCD(be.daiMm))
  }
  const tienPitchi = input.pitchiGio * 6000
  const tienCuon = input.cuonGio * 6000
  const tienVat = (input.vatMm / 1000) * input.giaCongVatDonGia
  const tongGiaCong = tienLoCat + tienTappu + tienSara + tienBe + tienPitchi + tienCuon + tienVat
  const gia1Tam = tienVL + tienCatLaser + tongGiaCong
  const allIn = gia1Tam * soLuong
  return { tyTrong: ty, klBaoGia, klThucTe, donGiaVLFinal, tienVL, tienCatLaser,
    tienLoCat, tienTappu, tienSara, tienBe, tienPitchi, tienCuon, tienVat,
    tongGiaCong, gia1Tam, allIn }
}
