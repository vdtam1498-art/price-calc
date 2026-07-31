
export interface BangGiaRow {
  id: number; vatLieu: string; doDay: number; donGia: number
  giaUon: number; giaCat: number; giaMoLo: number
  giaTappu: number; giaVat: number; tyTrong: number
}
export interface BeRow { soDuong: number; daiMm: number; donGia: number }
export interface PanelInput {
  vatLieu: string; doDay: number; x: number; y: number; soLuong: number
  isUuDai: boolean; heSoVL: number
  loNho: number; loLon: number; soLoTappu: number; soLoSara: number
  be: BeRow[]; tienPitchi: number; tienCuon: number; vatMm: number; giaCongVatDonGia: number
}
export interface PanelResult {
  tyTrong: number; klBaoGia: number; klThucTe: number; donGiaVLFinal: number
  tienVL: number; tienCatLaser: number; tienLoCat: number; tienTappu: number
  tienSara: number; tienBe: number; tienPitchi: number; tienCuon: number
  tienVat: number; tongGiaCong: number; gia1Tam: number; allIn: number
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
  const { x, y, doDay, soLuong, heSoVL } = input
  const ty = r.tyTrong
  const klBaoGia = (x * y * doDay * ty) / 1_000_000
  const klThucTe = ((x + 10) * (y + 10) * doDay * ty) / 1_000_000
  const donGiaVLFinal = r.donGia > 0 ? r.donGia * heSoVL : 0
  const tienVL = donGiaVLFinal > 0 ? klThucTe * donGiaVLFinal : 0
  const tienCatLaser = r.giaCat > 0 ? r.giaCat * input.doDay * ((x + y) / 1000) * 2 : 0
  const tienLoCat = (input.loNho + input.loLon * 1.5) * (r.giaMoLo || 0)
  const tienTappu = input.soLoTappu * (r.giaTappu || 0)
  const tienSara = input.soLoSara * (r.giaTappu || 0)
  const hsKL = heSoKL(klThucTe)
  const MIN_GIA_BE = 300
  let tienBe = 0
  for (const be of input.be) {
    if (be.daiMm <= 0 || be.donGia <= 0) continue
    const giaMot = (be.daiMm / 1000) * be.donGia * Math.max(hsKL, heSoCD(be.daiMm))
    const giaThucTe = Math.max(giaMot, MIN_GIA_BE)
    tienBe += be.soDuong * giaThucTe
  }
  const tienPitchi = input.tienPitchi
  const tienCuon = input.tienCuon
  const tienVat = (input.vatMm / 1000) * input.giaCongVatDonGia
  const tongGiaCong = tienLoCat + tienTappu + tienSara + tienBe + tienPitchi + tienCuon + tienVat
  const gia1Tam = tienVL + tienCatLaser + tongGiaCong
  const allIn = gia1Tam * soLuong
  return { tyTrong: ty, klBaoGia, klThucTe, donGiaVLFinal, tienVL, tienCatLaser,
    tienLoCat, tienTappu, tienSara, tienBe, tienPitchi, tienCuon, tienVat,
    tongGiaCong, gia1Tam, allIn }
}
