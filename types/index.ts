export interface DonHangType {
  id: number
  maDon: string
  tenCongTy: string
  ghiChu: string
  ngayTao: string
  tongTien: number
  panels: PanelType[]
}

export interface PanelType {
  id: number
  donHangId: number
  tenTam: string
  soLuong: number
  vatLieu: string
  doDay: number
  x: number
  y: number
  maKhach: string
  loNho: number
  loLon: number
  soLoTappu: number
  soLoSara: number
  be: BeRowType[]
  pitchiGio: number
  cuonGio: number
  vatMm: number
  giaVL: number
  giaCat: number
  giaCong: number
  gia1Tam: number
  allIn: number
}

export interface BeRowType {
  soDuong: number
  daiMm: number
  donGia: number
}

export interface BangGiaType {
  id: number
  vatLieu: string
  doDay: number
  donGiaVL: number
  tienBe: number
  giaCat: number
  donGiaLo: number
  donGiaLoTappu: number
  giaVat: number
  tyTrong: number
}

export interface CongTyType {
  id: number
  tenCongTy: string
  tiengNhat: string
  heSo_4_5mm: number
  heSo_duoi4_5mm: number
  isUuDai: boolean
}
