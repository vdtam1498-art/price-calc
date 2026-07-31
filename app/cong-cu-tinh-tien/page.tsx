'use client'
import { useEffect, useState } from 'react'
import { calculatePanel } from '@/lib/calculate'



const emptyPanel = (maDon?: string, soTam?: number) => ({
  tenTam: maDon && soTam !== undefined ? maDon + '-' + (soTam + 1) : '', vatLieu: '', doDay: '', x: '0', y: '0', soLuong: 1, maKhach: '',
  loNho: 0, loLon: 0, soLoTappu: 0, soLoSara: 0,
  pitchiSoLan: 0, pitchiChieuDai: 0, pitchiGio: 0, loaiGiaCong: 'Pitchi', cuonGio: 0, vatMm: 0,
  be: [{ soDuong: 1, daiMm: 0, donGia: 0 }]
})

export default function CongCuTinhTienPage() {
  const [donHang, setDonHang] = useState<any>(null)
  const [bangGia, setBangGia] = useState<any[]>([])
  const [congTyList, setCongTyList] = useState<any[]>([])
  const [form, setForm] = useState({ maDon: '', tenCongTy: '', ghiChu: '' })
  const [showCTDropdown, setShowCTDropdown] = useState(false)
  const [panel, setPanel] = useState<any>(emptyPanel())
  const [result, setResult] = useState<any>(null)
  const [modalPanel, setModalPanel] = useState<any>(null)
  const [editingPanelId, setEditingPanelId] = useState<number|null>(null)
  const [saving, setSaving] = useState(false)
  const [hesoGiaVL, setHesoGiaVL] = useState<any[]>([])
  const [hesoPitchiDB, setHesoPitchiDB] = useState<any[]>([])
  const [hesoGiaCongDB, setHesoGiaCongDB] = useState<any[]>([])
  const [hesoCuonDB, setHesoCuonDB] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/bang-gia').then(r => r.json()).then(setBangGia)
    fetch('/api/cong-ty').then(r => r.json()).then(setCongTyList)
    fetch('/api/heso-gia-vl').then(r => r.json()).then(setHesoGiaVL)
    fetch('/api/heso-cuon').then(r => r.json()).then(setHesoCuonDB)
    fetch('/api/heso-pitchi').then(r => r.json()).then(setHesoPitchiDB)
    fetch('/api/heso-gia-cong').then(r => r.json()).then(setHesoGiaCongDB)
  }, [])

  // Danh sách vật liệu unique từ database, nhóm theo loại
  const vatLieuList = Array.from(new Set(bangGia.map((r:any) => r.vatLieu)))
  const nhomThep = vatLieuList.filter((v:any) => !v.toUpperCase().includes('SUS') && !v.toUpperCase().startsWith('A'))
  const nhomInox = vatLieuList.filter((v:any) => v.toUpperCase().includes('SUS'))
  const nhomNhom = vatLieuList.filter((v:any) => v.toUpperCase().startsWith('A') && !v.toUpperCase().includes('SUS'))

  // Độ dày theo vật liệu đã chọn
  const doDayList = bangGia.filter((r:any) => r.vatLieu === panel.vatLieu).map((r:any) => r.doDay).sort((a:number,b:number) => a-b)

  const bgRow = bangGia.find(r => r.vatLieu === panel.vatLieu && r.doDay === Number(panel.doDay))
  const congTy = congTyList.find(c => c.tenCongTy === donHang?.tenCongTy)
  const isUuDai = congTy?.isUuDai || false
  const loQuyDoi = Number(panel.loNho) + Number(panel.loLon) * 1.5

  const heSoLabel = () => {
    if (!bgRow) return '—'
    const vl = panel.vatLieu.toUpperCase()
    const isSUS = vl.includes('SUS')
    const isHanwa = (donHang?.tenCongTy || '').toLowerCase().startsWith('hanwa')
    if (isUuDai) {
      const key = (isSUS && !isHanwa) ? 'Không ưu đãi SUS' : 'Ưu đãi'
      return '×' + (hesoGiaVL.find((h:any) => h.tenLoai === key)?.heSo || (isSUS && !isHanwa ? 1.15 : 1.1))
    }
    const key = isSUS ? 'Không ưu đãi SUS' : 'Không ưu đãi SS'
    return '×' + (hesoGiaVL.find((h:any) => h.tenLoai === key)?.heSo || 1.2)
  }

  useEffect(() => {
    if (!panel.vatLieu || !panel.doDay || !panel.x || !panel.y) { setResult(null); return }
    const beRows = panel.be.map((b: any) => ({ soDuong: Number(b.soDuong), daiMm: Number(b.daiMm), donGia: Number(b.donGia) }))
    // Tính hệ số VL từ hesoGiaVL
    const getHSVL = (tenLoai: string) => hesoGiaVL.find((h:any) => h.tenLoai === tenLoai)?.heSo || 1
    let heSoVL = 1
    const vl = panel.vatLieu.toUpperCase()
    const isSUS = vl.includes('SUS')
    const isHanwa = (donHang?.tenCongTy || '').toLowerCase().startsWith('hanwa')
    if (isUuDai) {
      // Inox không phải Hanwa → dùng hệ số KUĐ SUS dù là công ty ưu đãi
      heSoVL = (isSUS && !isHanwa) ? getHSVL('Không ưu đãi SUS') : getHSVL('Ưu đãi')
    } else {
      heSoVL = isSUS ? getHSVL('Không ưu đãi SUS') : getHSVL('Không ưu đãi SS')
    }

    const res = calculatePanel({
      vatLieu: panel.vatLieu, doDay: Number(panel.doDay),
      x: Number(panel.x), y: Number(panel.y), soLuong: Number(panel.soLuong),
      isUuDai, heSoVL,
      loNho: Number(panel.loNho), loLon: Number(panel.loLon),
      soLoTappu: Number(panel.soLoTappu), soLoSara: Number(panel.soLoSara),
      be: beRows.map((b:any) => ({...b, donGia: bgRow ? Number(bgRow.giaUon) : b.donGia})), tienPitchi: pitchiResult ? pitchiResult.thanhTien : 0, tienCuon: cuonResult ? cuonResult.thanhTien : 0,
      vatMm: Number(panel.vatMm), giaCongVatDonGia: Number(bgRow?.giaVat) || 1800,
    }, bangGia)
    setResult(res)
  }, [panel, bangGia, isUuDai, bgRow])

  async function taoDon() {
    if (!form.maDon) return alert('Vui lòng nhập mã đơn hàng')
    const res = await fetch('/api/don-hang', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (!res.ok) return alert('Mã đơn đã tồn tại hoặc có lỗi!')
    const dh = await res.json()
    setDonHang(dh)
    setPanel(emptyPanel(dh.maDon, 0))
  }

  async function luuTam() {
    if (!result || !donHang) return
    setSaving(true)
    const body = JSON.stringify({
        donHangId: donHang.id,
        tenTam: panel.tenTam || ('Tấm ' + (donHang.panels.length + 1)),
        soLuong: Number(panel.soLuong), vatLieu: panel.vatLieu,
        doDay: Number(panel.doDay), x: Number(panel.x), y: Number(panel.y),
        maKhach: panel.maKhach, loNho: Number(panel.loNho), loLon: Number(panel.loLon),
        soLoTappu: Number(panel.soLoTappu), soLoSara: Number(panel.soLoSara),
        be: panel.be, pitchiSoLan: Number(panel.pitchiSoLan), pitchiChieuDai: Number(panel.pitchiChieuDai), loaiGiaCong: panel.loaiGiaCong || 'Pitchi', pitchiGio: pitchiResult ? pitchiResult.thanhTien : 0, cuonGio: Number(panel.cuonGio),
        vatMm: Number(panel.vatMm),
        giaVL: result.tienVL, giaCat: result.tienCatLaser,
        giaCong: result.tongGiaCong, gia1Tam: result.gia1Tam, allIn: result.allIn,
    })
    if (editingPanelId) {
      await fetch('/api/panels/' + editingPanelId, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })
    } else {
      await fetch('/api/panels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    }
    const updated = await fetch('/api/don-hang/' + donHang.id).then(r => r.json())
    setDonHang(updated)
    setEditingPanelId(null)
    setPanel(emptyPanel(updated.maDon, updated.panels.length))
    setSaving(false)
  }

  const fmt = (n: number) => Math.round(n).toLocaleString()

  const inp = "w-full mt-1 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
  const inpRo = "w-full mt-1 border rounded px-2 py-1 text-xs bg-gray-50 text-gray-400"
  const inpGreen = "w-full mt-1 border rounded px-2 py-1 text-xs bg-green-50 text-green-700 font-mono"
  const thanhTien = "mt-auto pt-2"


  function getHeSoPitchi(klThucTe: number, chieuDaiMm: number) {
    const maxCD = Number(chieuDaiMm) / 1000
    const tlRows = hesoPitchiDB.filter((r:any) => r.loai === 'trong_luong').sort((a:any,b:any) => a.thuTu-b.thuTu)
    const cdRows = hesoPitchiDB.filter((r:any) => r.loai === 'chieu_dai').sort((a:any,b:any) => a.thuTu-b.thuTu)
    let hsTL = 2
    if (klThucTe < 20) hsTL = tlRows[0]?.heSo || 0.8
    else if (klThucTe < 40) hsTL = tlRows[1]?.heSo || 1
    else if (klThucTe < 100) hsTL = tlRows[2]?.heSo || 1.5
    else hsTL = tlRows[3]?.heSo || 2
    let hsCD = 2.5
    if (maxCD < 0.83) hsCD = cdRows[0]?.heSo || 0.75
    else if (maxCD < 1.66) hsCD = cdRows[1]?.heSo || 1
    else if (maxCD < 2.49) hsCD = cdRows[2]?.heSo || 1.25
    else if (maxCD < 3.32) hsCD = cdRows[3]?.heSo || 1.5
    else if (maxCD < 4.15) hsCD = cdRows[4]?.heSo || 1.75
    else if (maxCD < 4.98) hsCD = cdRows[5]?.heSo || 2
    else if (maxCD < 5.81) hsCD = cdRows[6]?.heSo || 2.25
    else hsCD = cdRows[7]?.heSo || 2.5
    return Math.max(hsTL, hsCD)
  }
  function getHeSoLoaiGC(loai: string) {
    return hesoGiaCongDB.find((r:any) => r.tenLoai === loai)?.heSo || 1
  }
  function tinhPitchi() {
    if (!result || Number(panel.pitchiSoLan) <= 0) return null
    const heTam = getHeSoPitchi(result.klThucTe, Number(panel.pitchiChieuDai))
    const heGC = getHeSoLoaiGC(panel.loaiGiaCong || 'Pitchi')
    const soLuong = Number(panel.soLuong)
    const soLanAn = Number(panel.pitchiSoLan)
    const thoiGianPhut = heTam * heGC * 1.5 * soLanAn
    const thoiGianGio = thoiGianPhut / 60
    const thanhTien = soLuong <= 5
      ? (1500 / soLuong) + 100 * thoiGianPhut
      : (1500 / 5) + 100 * thoiGianPhut
    return { thoiGian: thoiGianGio.toFixed(3), thanhTien: Math.round(thanhTien) }
  }
  const pitchiResult = tinhPitchi()


  function getHeSoCuon(klThucTe: number) {
    const rows = hesoCuonDB.sort((a:any,b:any) => a.heSo-b.heSo)
    if (klThucTe < 30) return rows[0]?.heSo || 0.4
    if (klThucTe < 50) return rows[1]?.heSo || 0.5
    if (klThucTe < 100) return rows[2]?.heSo || 0.75
    if (klThucTe < 200) return rows[3]?.heSo || 1
    if (klThucTe < 400) return rows[4]?.heSo || 1.5
    return rows[5]?.heSo || 2
  }
  function tinhCuon() {
    if (!result || Number(panel.cuonGio) <= 0) return null
    const heSo = getHeSoCuon(result.klThucTe)
    const thanhTien = heSo * 6000
    return { heSo, thanhTien: Math.round(thanhTien) }
  }
  const cuonResult = tinhCuon()

  if (!donHang) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800">Tạo đơn hàng mới</h2>
          <p className="text-gray-400 text-xs mt-1">Nhập thông tin đơn hàng để bắt đầu tính giá từng tấm</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Mã đơn hàng *</label>
            <input value={form.maDon} onChange={e => setForm(f => ({...f, maDon: e.target.value}))}
              onKeyDown={e => e.key === 'Enter' && taoDon()}
              placeholder="VD: 123456 hoặc 080605-1"
              className="w-full mt-1 border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Tên công ty</label>
            <div className="relative mt-1">
              <input value={form.tenCongTy}
                onChange={e => { setForm(f => ({...f, tenCongTy: e.target.value})); setShowCTDropdown(true) }}
                onFocus={() => setShowCTDropdown(true)}
                onBlur={() => setTimeout(() => setShowCTDropdown(false), 200)}
                placeholder="Nhập hoặc chọn công ty..."
                className="w-full border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {showCTDropdown ? (
                <div className="absolute z-50 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {congTyList.filter(ct =>
                    form.tenCongTy === '' ||
                    ct.tenCongTy.toLowerCase().includes(form.tenCongTy.toLowerCase()) ||
                    (ct.tiengNhat && ct.tiengNhat.includes(form.tenCongTy))
                  ).map((ct:any) => (
                    <div key={ct.id} onClick={() => { setForm(f => ({...f, tenCongTy: ct.tenCongTy})); setShowCTDropdown(false) }}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-0">
                      <p className="text-xs font-medium text-gray-800">{ct.tenCongTy}</p>
                      {ct.tiengNhat && <p className="text-xs text-gray-400">{ct.tiengNhat}</p>}
                      {ct.isUuDai && <span className="text-xs bg-green-100 text-green-600 px-1 rounded">Ưu đãi</span>}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Ghi chú đơn</label>
            <input value={form.ghiChu} onChange={e => setForm(f => ({...f, ghiChu: e.target.value}))}
              placeholder="Không có lưu ý"
              className="w-full mt-1 border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={taoDon} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            › Tạo đơn &amp; bắt đầu tính
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 text-xs">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* Header */}
        <div className="flex justify-between items-center">
  <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Công cụ tính tiền</span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-sm font-bold text-blue-600">{donHang.maDon}</span>
            {donHang.tenCongTy && <>
              <span className="text-xs text-gray-400">·</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-700 font-medium">{donHang.tenCongTy}</span>
                {congTy?.tiengNhat && <span className="text-xs text-gray-400">({congTy.tiengNhat})</span>}
                {congTy?.isUuDai && (() => {
                  const isSUS = panel.vatLieu.toUpperCase().includes('SUS')
                  const isHanwa = (donHang.tenCongTy || '').toLowerCase().startsWith('hanwa')
                  return <>
                    <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">Ưu đãi</span>
                    {isSUS && !isHanwa && <span className="bg-orange-100 text-orange-600 text-xs px-1.5 py-0.5 rounded">Không ưu đãi SUS</span>}
                  </>
                })()}
              </div>
            </>}
          </div>
          <div className="flex gap-2">
            <button onClick={async () => {
              if (donHang.panels.length > 0) {
                if (!confirm('Đơn đã có ' + donHang.panels.length + ' tấm. Huỷ sẽ xoá toàn bộ. Tiếp tục?')) return
              }
              await fetch('/api/don-hang/' + donHang.id, { method: 'DELETE' })
              setDonHang(null)
            }} className="border bg-white text-red-500 border-red-200 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50">✕ Huỷ đơn</button>
            <button onClick={() => setDonHang(null)} className="border bg-white px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50">🗂 Lưu đơn hàng</button>
            <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700">↓ Xuất Sheet</button>
          </div>
        </div>

        {/* THÔNG SỐ TẤM */}
        <div className="bg-white rounded-xl shadow-sm border p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 border-l-2 border-blue-500 pl-2">Thông số tấm</span>
            {panel.vatLieu && <span className="text-xs border border-orange-300 text-orange-600 px-2 py-0.5 rounded-full">Sắt thép — {panel.vatLieu}</span>}
          </div>
          <div className="grid grid-cols-6 gap-2 mb-2">
            <div className="col-span-1">
              <label className="text-xs text-gray-400">Tên tấm *</label>
              <input readOnly value={panel.tenTam} className={inp + ' bg-gray-50 cursor-not-allowed'} />
            </div>
            <div>
              <label className="text-xs text-gray-400">Vật liệu</label>
              <select value={panel.vatLieu} onChange={e => setPanel((p:any) => ({...p, vatLieu: e.target.value, doDay: ''}))} className={inp}>
                <option value="">-- Chọn --</option>
                {nhomThep.length > 0 && <optgroup label="⚙️ Thép">
                  {nhomThep.map((v:any) => <option key={v} value={v}>{v}</option>)}
                </optgroup>}
                {nhomInox.length > 0 && <optgroup label="✨ Inox">
                  {nhomInox.map((v:any) => <option key={v} value={v}>{v}</option>)}
                </optgroup>}
                {nhomNhom.length > 0 && <optgroup label="🔩 Nhôm">
                  {nhomNhom.map((v:any) => <option key={v} value={v}>{v}</option>)}
                </optgroup>}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400">Độ dày (MM)</label>
              <select value={panel.doDay} onChange={e => setPanel((p:any) => ({...p, doDay: e.target.value}))} className={inp}>
                <option value="">-- Chọn độ dày --</option>
                {doDayList.map((d:any) => (
                  <option key={d} value={d}>{Number(d).toFixed(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400">X — Dài (MM)</label>
              <input type="number" value={panel.x} onChange={e => setPanel((p:any) => ({...p, x: e.target.value}))} className={inp} />
            </div>
            <div>
              <label className="text-xs text-gray-400">Y — Rộng (MM)</label>
              <input type="number" value={panel.y} onChange={e => setPanel((p:any) => ({...p, y: e.target.value}))} className={inp} />
            </div>
            <div>
              <label className="text-xs text-gray-400">Số lượng</label>
              <input type="number" value={panel.soLuong} onChange={e => setPanel((p:any) => ({...p, soLuong: e.target.value}))} className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[
              { label: 'Tỷ trọng (G/CM³)', value: bgRow?.tyTrong || '7.85', cls: inpGreen },
              { label: 'Hệ số ưu đãi', value: heSoLabel(), cls: inpRo },
              { label: 'Đơn giá VL (¥/KG)', value: bgRow?.donGia > 0 ? bgRow.donGia + ' ¥/kg' : 'Đặt ngoài', cls: inpRo },
              { label: 'KL báo giá / tấm (KG)', value: result ? result.klBaoGia.toFixed(3) + ' kg' : '0.000 kg', cls: inpGreen },
              { label: 'KL thực tế / tấm (KG)', value: result ? result.klThucTe.toFixed(3) + ' kg' : '0.000 kg', cls: inpGreen },
              { label: 'KL tổng thực tế (KG)', value: result ? (result.klThucTe * Number(panel.soLuong)).toFixed(3) + ' kg' : '0.000 kg', cls: inpGreen },
              { label: 'Tiền vật liệu', value: result ? '¥ ' + fmt(result.tienVL) : '¥ 0', cls: inpGreen },
            ].map((f, i) => (
              <div key={i}>
                <label className="text-xs text-gray-400">{f.label}</label>
                <input readOnly value={f.value} className={f.cls} />
              </div>
            ))}
          </div>
        </div>

        {/* GIA CÔNG */}
        <div className="bg-white rounded-xl shadow-sm border p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500 border-l-2 border-blue-500 pl-2">Gia công</span>
            <span className="text-xs border border-orange-300 text-orange-600 px-2 py-0.5 rounded-full">GC: ¥ {result ? fmt(result.tongGiaCong) : 0}</span>
          </div>

          {/* Row 1: 4 card cùng chiều cao */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            {/* Lỗ cắt */}
            <div className="border rounded-lg p-2 flex flex-col">
              <p className="text-xs font-bold text-blue-600 mb-1.5">● LỖ CẮT</p>
              <label className="text-xs text-gray-400">Lỗ nhỏ (&lt;Ø30)</label>
              <input type="number" value={panel.loNho} onChange={e => setPanel((p:any) => ({...p, loNho: e.target.value}))} className={inp} />
              <label className="text-xs text-gray-400 mt-1.5">Lỗ lớn (≥Ø30)</label>
              <input type="number" value={panel.loLon} onChange={e => setPanel((p:any) => ({...p, loLon: e.target.value}))} className={inp} />
              <label className="text-xs text-gray-400 mt-1.5">Lỗ quy đổi</label>
              <input readOnly value={loQuyDoi || ''} className={inpRo} />
              <label className="text-xs text-gray-400 mt-1.5">Đơn giá (¥/lỗ)</label>
              <input readOnly value={bgRow ? bgRow.giaMoLo + " ¥/lỗ" : "— theo độ dày"} className={inpRo} />
              <div className={thanhTien}>
                <p className="text-xs text-gray-400">Thành tiền</p>
                <div className="bg-orange-50 rounded px-2 py-1 font-mono text-orange-600 font-semibold">¥ {result ? fmt(result.tienLoCat) : 0}</div>
              </div>
            </div>

            {/* Tappu */}
            <div className="border rounded-lg p-2 flex flex-col">
              <p className="text-xs font-bold text-blue-600 mb-1.5">● LỖ TAPPU</p>
              <label className="text-xs text-gray-400">Số lỗ</label>
              <input type="number" value={panel.soLoTappu} onChange={e => setPanel((p:any) => ({...p, soLoTappu: e.target.value}))} className={inp} />
              <label className="text-xs text-gray-400 mt-1.5">Đơn giá (¥/lỗ)</label>
              <input readOnly value={bgRow ? bgRow.giaTappu + " ¥/lỗ" : "— theo độ dày"} className={inpRo} />
              <div className={thanhTien}>
                <p className="text-xs text-gray-400">Thành tiền</p>
                <div className="bg-orange-50 rounded px-2 py-1 font-mono text-orange-600 font-semibold">¥ {result ? fmt(result.tienTappu) : 0}</div>
              </div>
            </div>

            {/* Sara */}
            <div className="border rounded-lg p-2 flex flex-col">
              <p className="text-xs font-bold text-blue-600 mb-1.5">● LỖ SARA</p>
              <label className="text-xs text-gray-400">Số lỗ</label>
              <input type="number" value={panel.soLoSara} onChange={e => setPanel((p:any) => ({...p, soLoSara: e.target.value}))} className={inp} />
              <label className="text-xs text-gray-400 mt-1.5">Đơn giá (¥/lỗ)</label>
              <input readOnly value={bgRow ? bgRow.giaTappu + " ¥/lỗ" : "— theo độ dày"} className={inpRo} />
              <div className={thanhTien}>
                <p className="text-xs text-gray-400">Thành tiền</p>
                <div className="bg-orange-50 rounded px-2 py-1 font-mono text-orange-600 font-semibold">¥ {result ? fmt(result.tienSara) : 0}</div>
              </div>
            </div>

            {/* Cắt Laser */}
            <div className="border rounded-lg p-2 flex flex-col">
              <p className="text-xs font-bold text-blue-600 mb-1.5">● CẮT LASER / CNC</p>
              <label className="text-xs text-gray-400">Đơn giá cắt (¥/M)</label>
              <input readOnly value={bgRow ? bgRow.giaCat : '— theo bảng giá'} className={inpRo} />
              <div className={thanhTien}>
                <p className="text-xs text-gray-400">Thành tiền cắt</p>
                <div className="bg-orange-50 rounded px-2 py-1 font-mono text-orange-600 font-semibold">¥ {result ? fmt(result.tienCatLaser) : 0}</div>
              </div>
            </div>
          </div>

          {/* Row 2: Bẻ/Uốn + Pitchi + Cuộn + Gia công vát cùng 1 hàng */}
          <div className="grid grid-cols-4 gap-2">
            {/* Bẻ/Uốn */}
            <div className="border rounded-lg p-2 flex flex-col">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-xs font-bold text-blue-600">● BẺ / UỐN</p>
                <button onClick={() => setPanel((p:any) => ({...p, be: [...p.be, { soDuong: 1, daiMm: 0, donGia: 0 }]}))}
                  className="text-xs text-blue-500 border border-blue-300 px-1.5 py-0.5 rounded hover:bg-blue-50">+ Thêm</button>
              </div>
              <div className="grid grid-cols-4 gap-1 mb-1">
                <p className="text-xs text-gray-400">Số đường</p>
                <p className="text-xs text-gray-400">Dài (MM)</p>
                <p className="text-xs text-gray-400">ĐG (¥/M)</p>
                <p className="text-xs text-gray-400">Hệ số</p>
              </div>
              {panel.be.map((b:any, i:number) => (
                <div key={i} className="grid grid-cols-4 gap-1 mb-1 items-center">
                  <input type="number" value={b.soDuong}
                    onChange={e => setPanel((p:any) => { const be=[...p.be]; be[i].soDuong=Number(e.target.value); return {...p,be} })}
                    className="border rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                  <input type="number" value={b.daiMm}
                    onChange={e => setPanel((p:any) => { const be=[...p.be]; be[i].daiMm=Number(e.target.value); return {...p,be} })}
                    className="border rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                  <div className="flex gap-0.5 items-center">
                    <input readOnly value={bgRow ? bgRow.giaUon : 0}
                      
                      className="border rounded px-1 py-1 text-xs w-full bg-gray-50 text-gray-400 cursor-not-allowed" />
                    {panel.be.length > 1 && (
                      <button onClick={() => setPanel((p:any) => ({...p, be: p.be.filter((_:any,j:number)=>j!==i)}))}
                        className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    )}
                  </div>
                  <span className="text-xs text-orange-500 font-mono font-semibold">
                    {(() => { const m=b.daiMm/1000; const hsCD=m<3?1:m<4?2.5:m<5?3:m<6?3.5:4.5; const klT=result?.klThucTe||0; const hsKL=klT<40?1:klT<100?1.5:2; return Math.max(hsKL,hsCD) })()}
                  </span>
                </div>
              ))}
              <div className={thanhTien}>
                <p className="text-xs text-gray-400">Tổng tiền bẻ</p>
                <div className="bg-orange-50 rounded px-2 py-1 font-mono text-orange-600 font-semibold">¥ {result ? fmt(result.tienBe) : 0}</div>
              </div>
            </div>

            {/* Pitchi */}
            <div className="border rounded-lg p-2 flex flex-col">
              <p className="text-xs font-bold text-blue-600 mb-1.5">● PITCHI</p>
              <label className="text-xs text-gray-400">Loại gia công</label>
              <select value={panel.loaiGiaCong} onChange={e => setPanel((p:any) => ({...p, loaiGiaCong: e.target.value}))} className={inp}>
                {hesoGiaCongDB.map((r:any) => <option key={r.id} value={r.tenLoai}>{r.tenLoai} (×{r.heSo})</option>)}
              </select>
              <div className="grid grid-cols-2 gap-1 mt-1.5">
                <div>
                  <label className="text-xs text-gray-400">Số lần ấn (N)</label>
                  <input type="number" value={panel.pitchiSoLan} onChange={e => setPanel((p:any) => ({...p, pitchiSoLan: e.target.value}))} className={inp} />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Chiều dài ấn (mm)</label>
                  <input type="number" value={panel.pitchiChieuDai} onChange={e => setPanel((p:any) => ({...p, pitchiChieuDai: e.target.value}))} className={inp} />
                </div>
              </div>
              <label className="text-xs text-gray-400 mt-1.5">Thời gian (H)</label>
              <input readOnly value={pitchiResult ? pitchiResult.thoiGian : '0'} className={inpRo} />
              <div className={thanhTien}>
                <p className="text-xs text-gray-400">Thành tiền</p>
                <div className="bg-orange-50 rounded px-2 py-1 font-mono text-orange-600 font-semibold">¥ {pitchiResult ? fmt(pitchiResult.thanhTien) : 0}</div>
              </div>
            </div>

            {/* Cuộn */}
            <div className="border rounded-lg p-2 flex flex-col">
              <p className="text-xs font-bold text-blue-600 mb-1.5">● CUỘN</p>
              <label className="text-xs text-gray-400">Loại gia công</label>
              <select value={Number(panel.cuonGio) > 0 ? '1' : '0'}
                onChange={e => setPanel((p:any) => ({...p, cuonGio: e.target.value === '1' ? 1 : 0}))}
                className={inp}>
                <option value="0">Không gia công cuộn</option>
                <option value="1">Có gia công cuộn</option>
              </select>
              <label className="text-xs text-gray-400 mt-1.5">Thời gian (H)</label>
              <input readOnly value={cuonResult ? cuonResult.heSo : '0'} className={inpRo} />
              <label className="text-xs text-gray-400 mt-1.5">Đơn giá (¥/giờ)</label>
              <input readOnly value="6000" className={inpRo} />
              <div className={thanhTien}>
                <p className="text-xs text-gray-400">Thành tiền (× SL)</p>
                <div className="bg-orange-50 rounded px-2 py-1 font-mono text-orange-600 font-semibold">¥ {cuonResult ? fmt(cuonResult.thanhTien) : 0}</div>
              </div>
            </div>

            {/* Gia công vát */}
            <div className="border rounded-lg p-2 flex flex-col">
              <p className="text-xs font-bold text-blue-600 mb-1.5">● GIA CÔNG VÁT</p>
              <label className="text-xs text-gray-400">Chiều dài vát (MM)</label>
              <input type="number" value={panel.vatMm} onChange={e => setPanel((p:any) => ({...p, vatMm: e.target.value}))} className={inp} />
              <label className="text-xs text-gray-400 mt-1.5">Đơn giá vát (¥/M)</label>
              <input readOnly value={bgRow ? bgRow.giaVat + ' ¥/m' : '— theo bảng giá'} className={inpRo} />
              <div className={thanhTien}>
                <p className="text-xs text-gray-400">Thành tiền vát</p>
                <div className="bg-orange-50 rounded px-2 py-1 font-mono text-orange-600 font-semibold">¥ {result ? fmt(result.tienVat) : 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-80 border-l bg-white flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto border-b">
          <div className="flex justify-between items-center px-3 py-2 border-b">
            <span className="text-xs font-bold text-gray-500 border-l-2 border-blue-500 pl-2">Các tấm đã nhập</span>
            <span className="text-xs font-mono bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded">
              ¥ {fmt(donHang.panels.reduce((s:number,p:any)=>s+p.allIn,0))}
            </span>
          </div>
          {donHang.panels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-300">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/>
              </svg>
              <p className="text-xs mt-2">Chưa có tấm nào</p>
            </div>
          ) : (
            <div className="p-2">
              {donHang.panels.map((p:any, i:number) => (
                <div key={p.id} onClick={() => {
                  setEditingPanelId(p.id)
                  setPanel({
                    tenTam: p.tenTam, vatLieu: p.vatLieu, doDay: String(p.doDay),
                    x: String(p.x), y: String(p.y), soLuong: p.soLuong,
                    maKhach: p.maKhach || '', loNho: p.loNho, loLon: p.loLon,
                    soLoTappu: p.soLoTappu, soLoSara: p.soLoSara,
                    be: p.be && p.be.length ? p.be : [{ soDuong: 1, daiMm: 0, donGia: 0 }],
                    pitchiSoLan: p.pitchiSoLan || 0, pitchiChieuDai: p.pitchiChieuDai || 0,
                    pitchiGio: p.pitchiGio || 0, loaiGiaCong: p.loaiGiaCong || 'Pitchi',
                    cuonGio: p.cuonGio, vatMm: p.vatMm,
                  })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }} className={editingPanelId === p.id ? 'flex justify-between items-center px-2 py-1 rounded border-b last:border-0 cursor-pointer bg-blue-50 border-l-2 border-l-blue-500' : 'flex justify-between items-center px-2 py-1 rounded border-b last:border-0 cursor-pointer hover:bg-gray-50'}>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{p.tenTam || 'Tấm '+(i+1)}</p>
                    <p className="text-xs text-gray-400">{p.vatLieu} {p.doDay}mm · ×{p.soLuong}</p>
                  </div>
                  <span className="text-xs font-mono text-red-500 font-semibold">¥{fmt(p.allIn)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal xem/sửa tấm */}
        {modalPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModalPanel(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div>
                  <p className="font-bold text-gray-800">{modalPanel.tenTam}</p>
                  <p className="text-xs text-gray-400">{modalPanel.vatLieu} · {modalPanel.doDay}mm · ×{modalPanel.soLuong}</p>
                </div>
                <button onClick={() => setModalPanel(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
              </div>
              <div className="px-5 py-4 space-y-2 max-h-[60vh] overflow-y-auto text-sm">
                {[
                  ['Tên tấm', modalPanel.tenTam],
                  ['Vật liệu', modalPanel.vatLieu],
                  ['Độ dày', modalPanel.doDay + ' mm'],
                  ['X — Dài', modalPanel.x + ' mm'],
                  ['Y — Rộng', modalPanel.y + ' mm'],
                  ['Số lượng', modalPanel.soLuong],
                  ['Mã khách', modalPanel.maKhach || '—'],
                  ['Lỗ nhỏ', modalPanel.loNho],
                  ['Lỗ lớn', modalPanel.loLon],
                  ['Số lỗ Tappu', modalPanel.soLoTappu],
                  ['Số lỗ Sara', modalPanel.soLoSara],
                  ['Chiều dài vát (mm)', modalPanel.vatMm],
                  ['Có cuộn', modalPanel.cuonGio > 0 ? 'Có' : 'Không'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-medium text-gray-700">{val}</span>
                  </div>
                ))}
                {modalPanel.be?.length > 0 && (
                  <div className="pt-1">
                    <p className="text-gray-400 mb-1">Bẻ / Uốn</p>
                    {modalPanel.be.map((b:any, i:number) => (
                      <div key={i} className="flex justify-between text-xs py-0.5 text-gray-600">
                        <span>Đường {i+1}</span>
                        <span>{b.soDuong} đường · {b.daiMm}mm</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t space-y-1">
                  {[
                    ['Giá VL', modalPanel.giaVL],
                    ['Giá cắt', modalPanel.giaCat],
                    ['Gia công', modalPanel.giaCong],
                    ['Giá 1 tấm', modalPanel.gia1Tam],
                    ['ALL-IN (×SL)', modalPanel.allIn],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-400 text-xs">{label}</span>
                      <span className="font-mono text-xs font-semibold text-red-500">¥ {fmt(Number(val))}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-5 py-3 border-t flex gap-2 justify-end">
                <button onClick={() => setModalPanel(null)} className="text-xs px-4 py-2 rounded-lg border text-gray-500 hover:bg-gray-50">Đóng</button>
                <button onClick={() => {
                  setPanel({
                    tenTam: modalPanel.tenTam, vatLieu: modalPanel.vatLieu, doDay: String(modalPanel.doDay),
                    x: String(modalPanel.x), y: String(modalPanel.y), soLuong: modalPanel.soLuong,
                    maKhach: modalPanel.maKhach || '', loNho: modalPanel.loNho, loLon: modalPanel.loLon,
                    soLoTappu: modalPanel.soLoTappu, soLoSara: modalPanel.soLoSara,
                    be: modalPanel.be || [{ soDuong: 1, daiMm: 0, donGia: 0 }],
                    pitchiSoLan: modalPanel.pitchiSoLan || 0, pitchiChieuDai: modalPanel.pitchiChieuDai || 0,
                    pitchiGio: modalPanel.pitchiGio || 0, loaiGiaCong: modalPanel.loaiGiaCong || 'Pitchi',
                    cuonGio: modalPanel.cuonGio, vatMm: modalPanel.vatMm,
                  })
                  setModalPanel(null)
                }} className="text-xs px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">✏️ Chỉnh sửa</button>
              </div>
            </div>
          </div>
        )}
        <div className="p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500">Tổng kết tấm này</span>
            <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">SL = {panel.soLuong}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <div className="bg-gray-50 rounded p-1.5">
              <p className="text-xs font-bold text-blue-600">GIÁ VL</p>
              <p className="font-mono font-bold text-xs">¥ {result ? fmt(result.tienVL) : 0}</p>
            </div>
            <div className="bg-gray-50 rounded p-1.5">
              <p className="text-xs font-bold text-blue-600">GIÁ CẮT</p>
              <p className="font-mono font-bold text-xs">¥ {result ? fmt(result.tienCatLaser) : 0}</p>
              
            </div>
            <div className="bg-gray-50 rounded p-1.5">
              <p className="text-xs font-bold text-blue-600">GIA CÔNG</p>
              <p className="font-mono font-bold text-xs">¥ {result ? fmt(result.tongGiaCong) : 0}</p>
              
            </div>
            <div className="bg-gray-50 rounded p-1.5">
              <p className="text-xs font-bold text-blue-600">GIÁ 1 TẤM</p>
              <p className="font-mono font-bold text-xs">¥ {result ? fmt(result.gia1Tam) : 0}</p>
            </div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-2 mb-2 text-center">
            <p className="text-xs text-gray-400">Tổng tiền</p>
            <p className="text-xl font-bold text-red-500 font-mono">¥ {result ? fmt(result.allIn) : 0}</p>
            
          </div>
          <button onClick={luuTam} disabled={!result || saving}
            className="w-full bg-green-500 text-white py-2 rounded-xl text-xs font-semibold hover:bg-green-600 disabled:opacity-40 transition">
            {saving ? '⏳ Đang lưu...' : '✓ Lưu tấm & tính tiếp'}
          </button>
        </div>
      </div>
    </div>
  )
}
