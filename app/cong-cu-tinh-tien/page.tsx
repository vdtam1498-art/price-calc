'use client'
import React, { useEffect, useState, useRef } from 'react'
import { calculatePanel } from '@/lib/calculate'



const emptyPanel = (maDon?: string, nextNum?: number) => ({
  tenTam: maDon && nextNum !== undefined ? maDon + '-' + nextNum : '', vatLieu: '', doDay: '', x: '0', y: '0', soLuong: 1, maKhach: '',
  loNho: 0, loLon: 0, soLoTappu: 0, soLoSara: 0,
  pitchiSoLan: 0, pitchiChieuDai: 0, pitchiGio: 0, loaiGiaCong: 'Pitchi', cuonGio: 0, vatMm: 0,
  be: [{ soDuong: 1, daiMm: 0, donGia: 0 }], lamTron250: false
})

function sortPanels(dh: any) {
  if (!dh?.panels) return dh
  return { ...dh, panels: [...dh.panels].sort((a: any, b: any) => a.id - b.id) }
}
export default function CongCuTinhTienPage() {
  const [donHang, setDonHang] = useState<any>(null)
  const [bangGia, setBangGia] = useState<any[]>([])
  const [congTyList, setCongTyList] = useState<any[]>([])
  const [congTyDacBietList, setCongTyDacBietList] = useState<any[]>([])
  const [form, setForm] = useState({ maDon: '', tenCongTy: '', ghiChu: '', loaiDon: 'bao_gia' })
  const [showCTDropdown, setShowCTDropdown] = useState(false)
  const [showEditCTDropdown, setShowEditCTDropdown] = useState(false)
  const [loaiTinh, setLoaiTinh] = useState('binh_thuong')
  const [noteList, setNoteList] = useState<any[]>([])
  const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([])
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [editingNote, setEditingNote] = useState<any>(null)
  const [noteForm, setNoteForm] = useState({ tiengViet: '', tiengNhat: '' })
  const [copiedNote, setCopiedNote] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [noteSearch, setNoteSearch] = useState('')
  const [panel, setPanel] = useState<any>(emptyPanel())
  const [result, setResult] = useState<any>(null)
  const [modalPanel, setModalPanel] = useState<any>(null)
  const [editingPanelId, setEditingPanelId] = useState<number|null>(null)
  const [donGiaDatNgoai, setDonGiaDatNgoai] = useState<number>(0)
  const skipDatNgoaiDetect = React.useRef(false)
  const [showModalDatNgoai, setShowModalDatNgoai] = useState(false)
  const [inputDatNgoai, setInputDatNgoai] = useState('')
  const [importing, setImporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [editMaDon, setEditMaDon] = useState('')
  const [editTenCongTy, setEditTenCongTy] = useState('')
  const [editingHeader, setEditingHeader] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const [ngayGiao, setNgayGiao] = useState('3-4')
  const [tuVanNgay, setTuVanNgay] = useState(false)
  const [isFax, setIsFax] = useState(false)
  const [copyingImg, setCopyingImg] = useState(false)
  const [showModalHuy, setShowModalHuy] = useState(false)
  const [xoaTamId, setXoaTamId] = useState<number|null>(null)
  const [importResult, setImportResult] = useState<number|null>(null)
  const [saving, setSaving] = useState(false)
  const [hesoGiaVL, setHesoGiaVL] = useState<any[]>([])
  const [hesoPitchiDB, setHesoPitchiDB] = useState<any[]>([])
  const [hesoGiaCongDB, setHesoGiaCongDB] = useState<any[]>([])
  const [hesoCuonDB, setHesoCuonDB] = useState<any[]>([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const donId = params.get('donId')
    if (donId) {
      fetch('/api/don-hang/' + donId).then(r => r.json()).then(dh => {
        if (dh?.id) setDonHang(sortPanels(dh))
      })
    }
  }, [])

  useEffect(() => {
    fetch('/api/bang-gia').then(r => r.json()).then(setBangGia)
    fetch('/api/cong-ty').then(r => r.json()).then(setCongTyList)
    fetch('/api/cong-ty-dac-biet').then(r => r.json()).then(setCongTyDacBietList)
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
  // Detect đặt ngoài khi chọn doDay
  useEffect(() => {
    if (!panel.vatLieu || !panel.doDay) return
    const row = bangGia.find((r:any) => r.vatLieu === panel.vatLieu && r.doDay === Number(panel.doDay))
    if (skipDatNgoaiDetect.current) { skipDatNgoaiDetect.current = false; return }
    if (row && row.donGia === 0) {
      setDonGiaDatNgoai(0)
      setInputDatNgoai('')
      setShowModalDatNgoai(true)
    } else {
      setShowModalDatNgoai(false)
      setDonGiaDatNgoai(0)
    }
  }, [panel.vatLieu, panel.doDay, bangGia])

  const doDayList = bangGia.filter((r:any) => r.vatLieu === panel.vatLieu).map((r:any) => r.doDay).sort((a:number,b:number) => a-b)

  const bgRow = bangGia.find(r => r.vatLieu === panel.vatLieu && r.doDay === Number(panel.doDay))
  const congTy = congTyList.find(c => c.tenCongTy === donHang?.tenCongTy)
  const isUuDai = congTy?.isUuDai || false
  const congTyDB = congTyDacBietList.find(c => c.tenCongTy === donHang?.tenCongTy)
  const isDacBiet = !!congTyDB
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
    const isDatNgoai = bgRow?.donGia === 0
    if (isDacBiet) {
      // Công ty đặc biệt: tính riêng bên dưới, heSoVL không dùng
      heSoVL = 1
    } else if (isDatNgoai && donGiaDatNgoai > 0) {
      // Đặt ngoài: hệ số cố định theo nhóm VL
      heSoVL = (isSUS || panel.vatLieu.toUpperCase().startsWith('A')) ? 1.2 : 1.3
    } else if (isUuDai) {
      heSoVL = (isSUS && !isHanwa) ? getHSVL('Không ưu đãi SUS') : getHSVL('Ưu đãi')
    } else {
      heSoVL = isSUS ? getHSVL('Không ưu đãi SUS') : getHSVL('Không ưu đãi SS')
    }

    // Tính KL đặc biệt (+6 thay +10) cho công ty đặc biệt
    const hasGiaCong = (panel.be && panel.be.some((b:any) => b.daiMm > 0)) ||
      Number(panel.pitchiSoLan) > 0 || Number(panel.soLoTappu) > 0 ||
      Number(panel.soLoSara) > 0 || Number(panel.cuonGio) > 0

    const bangGiaOverride2 = isDacBiet && bgRow ? (() => {
      const donGiaDB = hasGiaCong ? congTyDB.donGiaTamGiaCong : congTyDB.donGiaTamDon
      const klDB = ((Number(panel.x)+6)*(Number(panel.y)+6)*Number(panel.doDay)*(bgRow.tyTrong||7.85))/1_000_000
      // Tạo fake bgRow với donGia = donGiaDB/klDB để calculatePanel tính đúng
      return bangGia.map((r:any) => r.vatLieu === panel.vatLieu && r.doDay === Number(panel.doDay)
        ? {...r, donGia: donGiaDB} : r)
    })() : null

    // Override bangGia nếu đặt ngoài và đã nhập giá
    const bangGiaOverride = bangGiaOverride2 || ((bgRow?.donGia === 0 && donGiaDatNgoai > 0))
      ? bangGia.map((r:any) => r.vatLieu === panel.vatLieu && r.doDay === Number(panel.doDay) ? {...r, donGia: donGiaDatNgoai} : r)
      : bangGia
    const res = calculatePanel({
      vatLieu: panel.vatLieu, doDay: Number(panel.doDay),
      x: Number(panel.x), y: Number(panel.y), soLuong: Number(panel.soLuong),
      isUuDai, heSoVL,
      loNho: Number(panel.loNho), loLon: Number(panel.loLon),
      soLoTappu: Number(panel.soLoTappu), soLoSara: Number(panel.soLoSara),
      be: beRows.map((b:any) => ({...b, donGia: bgRow ? Number(bgRow.giaUon) : b.donGia})),
      tienPitchi: (() => {
        if (Number(panel.pitchiSoLan) <= 0) return 0
        const klThucTe = ((Number(panel.x)+10)*(Number(panel.y)+10)*Number(panel.doDay)*7.85)/1_000_000
        const tlRows = hesoPitchiDB.filter((r:any)=>r.loai==='trong_luong').sort((a:any,b:any)=>a.thuTu-b.thuTu)
        const cdRows = hesoPitchiDB.filter((r:any)=>r.loai==='chieu_dai').sort((a:any,b:any)=>a.thuTu-b.thuTu)
        let hsTL=2
        if(klThucTe<20) hsTL=tlRows[0]?.heSo||0.8
        else if(klThucTe<40) hsTL=tlRows[1]?.heSo||1
        else if(klThucTe<100) hsTL=tlRows[2]?.heSo||1.5
        else hsTL=tlRows[3]?.heSo||2
        const maxCD=Number(panel.pitchiChieuDai)/1000
        let hsCD=2.5
        if(maxCD<0.83) hsCD=cdRows[0]?.heSo||0.75
        else if(maxCD<1.66) hsCD=cdRows[1]?.heSo||1
        else if(maxCD<2.49) hsCD=cdRows[2]?.heSo||1.25
        else if(maxCD<3.32) hsCD=cdRows[3]?.heSo||1.5
        else if(maxCD<4.15) hsCD=cdRows[4]?.heSo||1.75
        else if(maxCD<4.98) hsCD=cdRows[5]?.heSo||2
        else if(maxCD<5.81) hsCD=cdRows[6]?.heSo||2.25
        else hsCD=cdRows[7]?.heSo||2.5
        const heTam=Math.max(hsTL,hsCD)
        const heGC=hesoGiaCongDB.find((r:any)=>r.tenLoai===(panel.loaiGiaCong||'Pitchi'))?.heSo||1
        const soLanAn=Number(panel.pitchiSoLan)
        const soLuong=Number(panel.soLuong)
        const thoiGianPhut=heTam*heGC*2*soLanAn
        return Math.round(soLuong<=5 ? (1500/soLuong)+100*thoiGianPhut : (1500/5)+100*thoiGianPhut)
      })(),
      tienCuon: (() => {
        if (Number(panel.cuonGio) <= 0) return 0
        const klThucTe = ((Number(panel.x)+10)*(Number(panel.y)+10)*Number(panel.doDay)*7.85)/1_000_000
        const rows = hesoCuonDB.sort((a:any,b:any)=>a.heSo-b.heSo)
        let heSo=2
        if(klThucTe<30) heSo=rows[0]?.heSo||0.4
        else if(klThucTe<50) heSo=rows[1]?.heSo||0.5
        else if(klThucTe<100) heSo=rows[2]?.heSo||0.75
        else if(klThucTe<200) heSo=rows[3]?.heSo||1
        else if(klThucTe<400) heSo=rows[4]?.heSo||1.5
        return Math.round(heSo*(Number(panel.cuonGio)||6000))
      })(),
      vatMm: Number(panel.vatMm), giaCongVatDonGia: Number(bgRow?.giaVat) || 1800,
    }, bangGiaOverride2 || bangGiaOverride)

    // Nếu công ty đặc biệt: override tienVL với KL+6
    if (isDacBiet && bgRow && res) {
      const donGiaDB = hasGiaCong ? congTyDB.donGiaTamGiaCong : congTyDB.donGiaTamDon
      const klDB = ((Number(panel.x)+6)*(Number(panel.y)+6)*Number(panel.doDay)*(bgRow.tyTrong||7.85))/1_000_000
      const tienVLDB = donGiaDB * klDB
      const gia1TamDB = tienVLDB + res.tienCatLaser + res.tongGiaCong
      res.tienVL = tienVLDB
      res.klThucTe = klDB
      res.donGiaVLFinal = donGiaDB
      res.gia1Tam = Math.round(gia1TamDB / 10) * 10
      res.allIn = (Math.round(gia1TamDB / 10) * 10) * Number(panel.soLuong)
    }
    // Luu gia goc + ap lam tron 250 neu duoc chon
    if (res) {
      res.gia1TamGoc = res.gia1Tam
      if (panel.lamTron250 && res.gia1Tam < 250) {
        res.gia1Tam = 250
        res.allIn = 250 * Number(panel.soLuong)
      }
    }
    setResult(res)
  }, [panel, bangGia, isUuDai, bgRow, donGiaDatNgoai, isDacBiet, congTyDB])

  // Tự xóa đơn trống sau 1 phút
  useEffect(() => {
    if (!donHang?.id) return
    if (donHang.panels?.length > 0) return
    const timer = setTimeout(async () => {
      // Kiểm tra lại xem đơn vẫn còn trống không
      const check = await fetch('/api/don-hang/' + donHang.id).then(r => r.json()).catch(() => null)
      if (check && check.panels?.length === 0) {
        await fetch('/api/don-hang/' + donHang.id, { method: 'DELETE' }).catch(() => {})
        console.log('Auto deleted empty order:', donHang.maDon)
      }
    }, 60000) // 1 phút
    return () => clearTimeout(timer)
  }, [donHang?.id, donHang?.panels?.length])

  async function taoDon() {
    if (!form.maDon) return alert('Vui lòng nhập mã đơn hàng')
    const res = await fetch('/api/don-hang', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (!res.ok) return alert('Mã đơn đã tồn tại hoặc có lỗi!')
    const dh = await res.json()
    setDonHang(sortPanels(dh))
    setPanel(emptyPanel(dh.maDon, 1))
  }

  async function luuTam() {
    if (!result || !donHang) return
    setSaving(true)
    const body = JSON.stringify({
        donHangId: donHang.id,
        maDonGoc: donHang.maDon,
        tenTam: panel.tenTam || ('Tấm ' + (donHang.panels.length + 1)),
        soLuong: Number(panel.soLuong), vatLieu: panel.vatLieu,
        doDay: Number(panel.doDay), x: Number(panel.x), y: Number(panel.y),
        maKhach: panel.maKhach, loNho: Number(panel.loNho), loLon: Number(panel.loLon),
        soLoTappu: Number(panel.soLoTappu), soLoSara: Number(panel.soLoSara),
        be: panel.be, pitchiSoLan: Number(panel.pitchiSoLan), pitchiChieuDai: Number(panel.pitchiChieuDai), loaiGiaCong: panel.loaiGiaCong || 'Pitchi', pitchiGio: pitchiResult ? pitchiResult.thanhTien : 0, cuonGio: Number(panel.cuonGio), donGiaDatNgoai: donGiaDatNgoai || 0,
        vatMm: Number(panel.vatMm),
        giaVL: result.tienVL, giaCat: result.tienCatLaser, donGiaVL: result.donGiaVLFinal || 0, klThucTe: result.klThucTe || 0,
        giaCong: result.tongGiaCong, gia1Tam: result.gia1Tam, allIn: result.allIn, lamTron250: !!panel.lamTron250,
    })
    if (editingPanelId) {
      const putRes = await fetch('/api/panels/' + editingPanelId, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })
      if (!putRes.ok) { alert('Lỗi lưu tấm, vui lòng thử lại!'); setSaving(false); return }
    } else {
      const postRes = await fetch('/api/panels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
      if (!postRes.ok) { alert('Lỗi lưu tấm, vui lòng thử lại!'); setSaving(false); return }
      const postData = await postRes.json()
      if (postData.donHangId && postData.donHangId !== donHang.id) {
        donHang.id = postData.donHangId
      }
    }
    const updated = await fetch('/api/don-hang/' + donHang.id).then(r => r.json())
    setDonHang(sortPanels(updated))
    setEditingPanelId(null)
    setPanel(emptyPanel(updated.maDon, updated.panels.length === 0 ? 1 : Math.max(...updated.panels.map((p:any) => { const n = parseInt(p.tenTam?.split('-').pop()); return isNaN(n) ? 0 : n })) + 1))
    setSaving(false)
  }

  useEffect(() => {
    if (!showExportMenu) return
    function handleClick(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showExportMenu])

  function exportCSVInline(dh: any) {
    if (!dh || !dh.panels || dh.panels.length === 0) return
    const header = ['エクスポート用','数量','材質','板厚','noと安全','曲げ','X','Y','','単価']
    const rows = dh.panels.map((p: any) => {
      const gcList = []
      if (p.cuonGio > 0) gcList.push('r')
      if ((p.pitchiGio || 0) > 0 || (p.be && p.be.some((b:any) => b.daiMm > 0))) gcList.push('m')
      if (p.soLoTappu > 0) gcList.push('t')
      if (p.soLoSara > 0) gcList.push('s')
      const gcStr = gcList.length >= 2 ? '*' : gcList.join('')
      return [p.tenTam, p.soLuong, p.vatLieu, p.doDay, dh.maDon + '-', gcStr, p.x, p.y, '', Math.round(p.gia1Tam)]
    })
    const csv = [header, ...rows].map((r: any) => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = dh.maDon + '.csv'; a.click()
  }
  async function saveHeader() {
    if (!donHang) return
    await fetch('/api/don-hang/' + donHang.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maDon: editMaDon || donHang.maDon, tenCongTy: editTenCongTy })
    })
    const updated = await fetch('/api/don-hang/' + donHang.id).then(r => r.json())
    setDonHang(sortPanels(updated))
    setEditingHeader(false)
  }
  function downloadTemplate() {
    const headers = ['Tên tấm','Vật liệu','Độ dày','X (mm)','Y (mm)','Số lượng','Lỗ nhỏ','Lỗ lớn','Lỗ Tappu','Lỗ Sara','Pitchi - Số lần','Pitchi - Chiều dài (mm)','Loại gia công','Có cuộn (1/0)','Vát (mm)','Bẻ1 - Số đường','Bẻ1 - Dài (mm)','Bẻ2 - Số đường','Bẻ2 - Dài (mm)','Bẻ3 - Số đường','Bẻ3 - Dài (mm)']
    const example = [donHang?.maDon+'-1','SPCC','1.2','500','300','1','0','0','0','0','0','0','Pitchi','0','0','1','500','0','0','0','0']
    const csv = [headers.join(','), example.join(',')].join('\n')
    const blob = new Blob(['﻿'+csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = 'template_nhap_tam.csv'; a.click()
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !donHang) return
    setImporting(true)
    const XLSX = await import('xlsx')
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })
    const rows = raw.slice(1).filter(r => r[0])
    for (const r of rows) {
      const beArr = []
      for (let i = 15; i < r.length; i += 2) {
        const soDuong = Number(r[i]) || 0
        const daiMm = Number(r[i+1]) || 0
        if (soDuong > 0 || daiMm > 0) beArr.push({ soDuong, daiMm, donGia: 0 })
      }
      if (beArr.length === 0) beArr.push({ soDuong: 1, daiMm: 0, donGia: 0 })
      const vatLieu = String(r[1] || '')
      const doDay = Number(r[2]) || 0
      const x = Number(r[3]) || 0
      const y = Number(r[4]) || 0
      const soLuong = Number(r[5]) || 1
      const loNho = Number(r[6]) || 0
      const loLon = Number(r[7]) || 0
      const soLoTappu = Number(r[8]) || 0
      const soLoSara = Number(r[9]) || 0
      const pitchiSoLan = Number(r[10]) || 0
      const pitchiChieuDai = Number(r[11]) || 0
      const loaiGiaCong = String(r[12] || 'Pitchi')
      const cuonGio = Number(r[13]) || 0
      const vatMm = Number(r[14]) || 0

      // Tính heSoVL
      const isSUS = vatLieu.toUpperCase().includes('SUS')
      const isHanwa = (donHang.tenCongTy || '').toLowerCase().startsWith('hanwa')
      const getHSVL2 = (ten: string) => hesoGiaVL.find((h:any) => h.tenLoai === ten)?.heSo || 1
      let heSoVL2 = 1
      if (isUuDai) {
        heSoVL2 = (isSUS && !isHanwa) ? getHSVL2('Không ưu đãi SUS') : getHSVL2('Ưu đãi')
      } else {
        heSoVL2 = isSUS ? getHSVL2('Không ưu đãi SUS') : getHSVL2('Không ưu đãi SS')
      }

      // Tính beArr với donGia từ bangGia
      const bgR = bangGia.find((bg:any) => bg.vatLieu === vatLieu && bg.doDay === doDay)
      const beArrFinal = beArr.map((b:any) => ({...b, donGia: bgR ? Number(bgR.giaUon) : 0}))

      // Tính pitchi
      let tienPitchi2 = 0
      if (pitchiSoLan > 0 && bgR) {
        const klThucTe2 = ((x+10)*(y+10)*doDay*(bgR.tyTrong||7.85))/1_000_000
        const tlRows2 = hesoPitchiDB.filter((h:any)=>h.loai==='trong_luong').sort((a:any,b:any)=>a.thuTu-b.thuTu)
        const cdRows2 = hesoPitchiDB.filter((h:any)=>h.loai==='chieu_dai').sort((a:any,b:any)=>a.thuTu-b.thuTu)
        let hsTL2=2
        if(klThucTe2<20) hsTL2=tlRows2[0]?.heSo||0.8
        else if(klThucTe2<40) hsTL2=tlRows2[1]?.heSo||1
        else if(klThucTe2<100) hsTL2=tlRows2[2]?.heSo||1.5
        else hsTL2=tlRows2[3]?.heSo||2
        const maxCD2=pitchiChieuDai/1000
        let hsCD2=2.5
        if(maxCD2<0.83) hsCD2=cdRows2[0]?.heSo||0.75
        else if(maxCD2<1.66) hsCD2=cdRows2[1]?.heSo||1
        else if(maxCD2<2.49) hsCD2=cdRows2[2]?.heSo||1.25
        else if(maxCD2<3.32) hsCD2=cdRows2[3]?.heSo||1.5
        else if(maxCD2<4.15) hsCD2=cdRows2[4]?.heSo||1.75
        else if(maxCD2<4.98) hsCD2=cdRows2[5]?.heSo||2
        else if(maxCD2<5.81) hsCD2=cdRows2[6]?.heSo||2.25
        else hsCD2=cdRows2[7]?.heSo||2.5
        const heGC2=hesoGiaCongDB.find((h:any)=>h.tenLoai===loaiGiaCong)?.heSo||1
        const phut2=Math.max(hsTL2,hsCD2)*heGC2*2*pitchiSoLan
        tienPitchi2=Math.round(soLuong<=5?(1500/soLuong)+100*phut2:(1500/5)+100*phut2)
      }

      // Tính cuon
      let tienCuon2 = 0
      if (cuonGio > 0 && bgR) {
        const klThucTe2 = ((x+10)*(y+10)*doDay*(bgR.tyTrong||7.85))/1_000_000
        const cuonRows = hesoCuonDB.sort((a:any,b:any)=>a.heSo-b.heSo)
        let hsCuon=2
        if(klThucTe2<30) hsCuon=cuonRows[0]?.heSo||0.4
        else if(klThucTe2<50) hsCuon=cuonRows[1]?.heSo||0.5
        else if(klThucTe2<100) hsCuon=cuonRows[2]?.heSo||0.75
        else if(klThucTe2<200) hsCuon=cuonRows[3]?.heSo||1
        else if(klThucTe2<400) hsCuon=cuonRows[4]?.heSo||1.5
        const donGiaCuon2 = Number(r[13]) || 6000
        tienCuon2=Math.round(hsCuon*donGiaCuon2)
      }

      const calcRes = bgR ? calculatePanel({
        vatLieu, doDay, x, y, soLuong, isUuDai, heSoVL: heSoVL2,
        loNho, loLon, soLoTappu, soLoSara,
        be: beArrFinal, tienPitchi: tienPitchi2, tienCuon: tienCuon2,
        vatMm, giaCongVatDonGia: bgR.giaVat || 1800,
      }, bangGia) : null

      const body = {
        donHangId: donHang.id,
        maDonGoc: donHang.maDon,
        tenTam: String(r[0] || ''),
        vatLieu, doDay, x, y, soLuong,
        maKhach: '', loNho, loLon, soLoTappu, soLoSara,
        pitchiSoLan, pitchiChieuDai, loaiGiaCong,
        cuonGio, vatMm, be: beArr,
        giaVL: calcRes?.tienVL || 0,
        giaCat: calcRes?.tienCatLaser || 0,
        giaCong: calcRes?.tongGiaCong || 0,
        gia1Tam: calcRes?.gia1Tam || 0,
        allIn: calcRes?.allIn || 0,
        pitchiGio: tienPitchi2, donGiaDatNgoai: 0,
        donGiaVL: calcRes?.donGiaVLFinal || 0, klThucTe: calcRes?.klThucTe || 0,
      }
      const impRes = await fetch('/api/panels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (impRes.ok) {
        const impData = await impRes.json()
        if (impData.donHangId && impData.donHangId !== donHang.id) {
          donHang.id = impData.donHangId
        }
      }
    }
    const updated = await fetch('/api/don-hang/' + donHang.id).then(r => r.json())
    // Giữ đúng thứ tự Excel
    const tenTamOrder = rows.map((r: any) => String(r[0] || ''))
    const sortedPanels = [...(updated.panels || [])].sort((a: any, b: any) => {
      const ia = tenTamOrder.indexOf(a.tenTam)
      const ib = tenTamOrder.indexOf(b.tenTam)
      if (ia === -1 && ib === -1) return 0
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
    setDonHang({ ...updated, panels: sortedPanels })
    setPanel(emptyPanel(updated.maDon, updated.panels.length === 0 ? 1 : Math.max(...updated.panels.map((p:any) => { const n = parseInt(p.tenTam?.split('-').pop()); return isNaN(n) ? 0 : n })) + 1))
    setImporting(false)
    e.target.value = ''
    setImportResult(rows.length)
  }

  async function xoaTam(id: number) {
    await fetch('/api/panels/' + id, { method: 'DELETE' })
    const updated = await fetch('/api/don-hang/' + donHang.id).then(r => r.json())
    setDonHang(sortPanels(updated))
    if (editingPanelId === id) {
      setEditingPanelId(null)
      setPanel(emptyPanel(updated.maDon, updated.panels.length === 0 ? 1 : Math.max(...updated.panels.map((p:any) => { const n = parseInt(p.tenTam?.split('-').pop()); return isNaN(n) ? 0 : n })) + 1))
    }
  }
  async function copyDauBaoGia() {
    const el = document.getElementById('dau-bao-gia')
    if (!el) return
    setCopyingImg(true)
    try {
      const h2c = (await import('html2canvas')).default
      const canvas = await h2c(el, { scale: 3, backgroundColor: '#ffffff', useCORS: true })
      canvas.toBlob(async (blob) => {
        if (!blob) return
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        } catch {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a'); a.href = url
          a.download = 'dau-bao-gia.png'; a.click()
        }
        setCopyingImg(false)
      }, 'image/png')
    } catch { setCopyingImg(false) }
  }
  useEffect(() => { fetchNotes() }, [])
  function fetchNotes() {
    fetch('/api/note').then(r => r.json()).then(setNoteList).catch(() => {})
  }
  function toggleNote(id: number) {
    setSelectedNoteIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function openAddNote() {
    setEditingNote(null); setNoteForm({ tiengViet: '', tiengNhat: '' }); setShowNoteModal(true)
  }
  function openEditNote(n: any) {
    setEditingNote(n); setNoteForm({ tiengViet: n.tiengViet, tiengNhat: n.tiengNhat }); setShowNoteModal(true)
  }
  async function saveNote() {
    if (!noteForm.tiengViet.trim() && !noteForm.tiengNhat.trim()) return
    if (editingNote) {
      await fetch('/api/note/' + editingNote.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(noteForm) })
    } else {
      await fetch('/api/note', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...noteForm, thuTu: noteList.length }) })
    }
    setShowNoteModal(false); fetchNotes()
  }
  async function deleteNote(id: number) {
    if (!confirm('Xoá note này?')) return
    await fetch('/api/note/' + id, { method: 'DELETE' })
    setSelectedNoteIds(prev => prev.filter(x => x !== id)); fetchNotes()
  }
  function copyNoteJapanese() {
    const text = noteList.filter(n => selectedNoteIds.includes(n.id)).map(n => n.tiengNhat).join('\n')
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    })
    setCopiedNote(true); setTimeout(() => setCopiedNote(false), 1500)
  }
  function copyDauBaoGiaText() {
    const text = buildTamText({ ...panel, gia1Tam: result?.gia1Tam || 0 })
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    })
    setCopiedText(true); setTimeout(() => setCopiedText(false), 1500)
  }
  function buildTamText(p: any) {
    const gia1Tam = Math.round(p.gia1Tam)
    const hang1 = `@${gia1Tam.toLocaleString()} x${p.soLuong}枚`
    const gc2 = []
    if (p.be && p.be.some((b:any) => b.daiMm > 0)) gc2.push('曲げ')
    if ((p.pitchiGio || 0) > 0) gc2.push('ピッチ')
    if (p.cuonGio > 0) gc2.push('ロール')
    const hang2 = gc2.length > 0 ? gc2.join('+') + '(材料＋加工)' : '切板(材料,レーザー)'
    const gc3 = []
    if (p.soLoTappu > 0) gc3.push('タップ')
    if (p.soLoSara > 0) gc3.push('皿加工')
    if (p.vatMm > 0) gc3.push('開先加工')
    const hang3 = gc3.length > 0 ? gc3.join('+') : ''
    const hang4 = `${p.vatLieu}   PL${p.doDay}`
    return [p.tenTam || '', hang1, hang2, hang3, hang4].filter(l => l !== '').join('\n')
  }
  function copyTam(p: any, donHang: any) {
    const gia1Tam = Math.round(p.gia1Tam)
    const soLuong = p.soLuong
    const vatLieu = p.vatLieu
    const doDay = p.doDay

    // Hàng 1
    const hang1 = `@${gia1Tam.toLocaleString()}	x${soLuong}枚`

    // Hàng 2: bẻ + pitchi + cuộn
    const gc2 = []
    if (p.be && p.be.some((b:any) => b.daiMm > 0)) gc2.push('曲げ')
    if ((p.pitchiGio || 0) > 0) gc2.push('ピッチ')
    if (p.cuonGio > 0) gc2.push('ロール')
    const hang2 = gc2.length > 0 ? gc2.join('+') + '(材料＋加工)' : '切板(材料,レーザー)'

    // Hàng 3: tappu + sara + vát
    const gc3 = []
    if (p.soLoTappu > 0) gc3.push('タップ')
    if (p.soLoSara > 0) gc3.push('皿加工')
    if (p.vatMm > 0) gc3.push('開先加工')
    const hang3 = gc3.length > 0 ? gc3.join('+') : ''

    // Hàng 4
    const hang4 = `${vatLieu}	PL${doDay}`

    const lines = [p.tenTam || '', hang1, hang2, hang3, hang4].filter(l => l !== '')
    const text = lines.join('\n')

    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = text; document.body.appendChild(ta)
      ta.select(); document.execCommand('copy')
      document.body.removeChild(ta)
    })
  }
  const sortPanels = (dh: any) => {
    if (!dh?.panels) return dh
    return { ...dh, panels: [...dh.panels].sort((a: any, b: any) => {
      const na = parseInt(a.tenTam?.split('-').pop()) || 0
      const nb = parseInt(b.tenTam?.split('-').pop()) || 0
      return na - nb
    })}
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
    const thoiGianPhut = heTam * heGC * 2 * soLanAn
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
    const donGiaCuon = Number(panel.cuonGio) || 6000
    const thanhTien = heSo * donGiaCuon
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
            <label className="text-xs text-gray-500 mb-2 block">Loại đơn</label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center justify-center gap-2 border rounded-lg px-3 py-2.5 cursor-pointer text-sm transition-colors ${form.loaiDon === 'bao_gia' ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="loaiDon" value="bao_gia" checked={form.loaiDon === 'bao_gia'}
                  onChange={e => setForm(f => ({...f, loaiDon: e.target.value}))} className="accent-blue-600" />
                📄 Báo giá
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 border rounded-lg px-3 py-2.5 cursor-pointer text-sm transition-colors ${form.loaiDon === 'trien_khai' ? 'bg-orange-50 border-orange-400 text-orange-700 font-medium' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="loaiDon" value="trien_khai" checked={form.loaiDon === 'trien_khai'}
                  onChange={e => setForm(f => ({...f, loaiDon: e.target.value}))} className="accent-orange-500" />
                📦 Triển khai
              </label>
            </div>
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
            {editingHeader ? (
              <>
                <input autoFocus value={editMaDon} onChange={e => setEditMaDon(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && saveHeader()}
                  className="text-sm font-bold text-blue-600 border-b border-blue-400 outline-none bg-transparent w-28" />
                <span className="relative inline-block ml-2">
                  <input value={editTenCongTy}
                    onChange={e => { setEditTenCongTy(e.target.value); setShowEditCTDropdown(true) }}
                    onFocus={() => setShowEditCTDropdown(true)}
                    onBlur={() => setTimeout(() => setShowEditCTDropdown(false), 200)}
                    onKeyDown={e => e.key==='Enter' && saveHeader()}
                    placeholder="Tên công ty..."
                    className="text-xs text-gray-700 border-b border-gray-400 outline-none bg-transparent w-36" />
                  {showEditCTDropdown ? (
                    <div className="absolute z-50 w-56 bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {congTyList.filter(ct =>
                        editTenCongTy === '' ||
                        ct.tenCongTy.toLowerCase().includes(editTenCongTy.toLowerCase()) ||
                        (ct.tiengNhat && ct.tiengNhat.includes(editTenCongTy))
                      ).map((ct:any) => (
                        <div key={ct.id} onClick={() => { setEditTenCongTy(ct.tenCongTy); setShowEditCTDropdown(false) }}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-0">
                          <p className="text-xs font-medium text-gray-800">{ct.tenCongTy}</p>
                          {ct.tiengNhat && <p className="text-xs text-gray-400">{ct.tiengNhat}</p>}
                          {ct.isUuDai && <span className="text-xs bg-green-100 text-green-600 px-1 rounded">Ưu đãi</span>}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </span>
                <button onClick={saveHeader} className="text-xs text-blue-600 hover:text-blue-800 ml-1">✓</button>
                <button onClick={() => setEditingHeader(false)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
              </>
            ) : (
              <span className="text-sm font-bold text-blue-600 cursor-pointer hover:underline"
                onClick={() => { setEditMaDon(donHang.maDon); setEditTenCongTy(donHang.tenCongTy||''); setEditingHeader(true) }}
                title="Click để sửa mã đơn / tên công ty">{donHang.maDon} ✎</span>
            )}
            {donHang.tenCongTy && !editingHeader && <>
              <span className="text-xs text-gray-400">·</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-700 font-medium">{donHang.tenCongTy}</span>
                {congTy?.tiengNhat && <span className="text-xs text-gray-400">({congTy.tiengNhat})</span>}
                {isDacBiet && <>
                  <span className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded">⭐ Công ty đặc biệt</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">Tính theo khối lượng</span>
                  <span className="bg-blue-50 text-blue-600 text-xs px-1.5 py-0.5 rounded">Tấm đơn: ¥{congTyDB?.donGiaTamDon}/kg</span>
                  <span className="bg-orange-50 text-orange-600 text-xs px-1.5 py-0.5 rounded">Tấm bẻ: ¥{congTyDB?.donGiaTamGiaCong}/kg</span>
                </>}
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
            <button onClick={() => setShowModalHuy(true)}
              className="hidden">✕ Huỷ đơn</button>
            <button onClick={() => setDonHang(null)} className="border bg-white px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50">🗂 Lưu đơn hàng</button>
            <div className="relative" ref={exportMenuRef}>
              <button onClick={() => setShowExportMenu(v => !v)} className="border bg-white text-green-600 border-green-200 px-3 py-1.5 rounded-lg text-xs hover:bg-green-50">📊 Export ▾</button>
              {showExportMenu && (
                <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[170px]">
                  <button onClick={() => { exportCSVInline(donHang); setShowExportMenu(false) }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b">📊 Export Excel</button>
                  <button onClick={() => { alert('Mẫu vận chuyển sẽ được cung cấp sau!'); setShowExportMenu(false) }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-400">🚚 Export Vận chuyển <span className="text-gray-300">(sắp có)</span></button>
                </div>
              )}
            </div>
            <div className="relative flex">
              <label className={`text-xs px-3 py-1.5 rounded-l-lg cursor-pointer border-y border-l ${importing ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'}`}>
                {importing ? '⏳ Đang import...' : '↑ Import Excel'}
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportExcel} disabled={importing} />
              </label>
              <button onClick={downloadTemplate} className="text-xs px-2 py-1.5 rounded-r-lg border border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 border-l-0" title="Tải template">📋</button>
            </div>
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
              { label: 'Hệ số ưu đãi', value: (bgRow?.donGia === 0 && donGiaDatNgoai > 0) ? '×' + ((panel.vatLieu.toUpperCase().includes('SUS') || panel.vatLieu.toUpperCase().startsWith('A')) ? '1.2' : '1.3') + ' (đặt ngoài)' : heSoLabel(), cls: inpRo },
              { label: 'Đơn giá VL (¥/KG)', value: bgRow?.donGia > 0 ? bgRow.donGia + ' ¥/kg' : (donGiaDatNgoai > 0 ? donGiaDatNgoai + ' ¥/kg' : 'Đặt ngoài — chưa nhập giá'), cls: inpRo },
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
            <div className={`border rounded-lg p-2 flex flex-col transition-colors ${result && result.tienLoCat > 0 ? "bg-blue-50 border-blue-300" : ""}`}>
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
            <div className={`border rounded-lg p-2 flex flex-col transition-colors ${result && result.tienTappu > 0 ? "bg-blue-50 border-blue-300" : ""}`}>
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
            <div className={`border rounded-lg p-2 flex flex-col transition-colors ${result && result.tienSara > 0 ? "bg-blue-50 border-blue-300" : ""}`}>
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
            <div className={`border rounded-lg p-2 flex flex-col transition-colors ${result && result.tienCatLaser > 0 ? "bg-blue-50 border-blue-300" : ""}`}>
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
            <div className={`border rounded-lg p-2 flex flex-col transition-colors ${result && result.tienBe > 0 ? "bg-blue-50 border-blue-300" : ""}`}>
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
            <div className={`border rounded-lg p-2 flex flex-col transition-colors ${pitchiResult && pitchiResult.thanhTien > 0 ? "bg-blue-50 border-blue-300" : ""}`}>
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
            <div className={`border rounded-lg p-2 flex flex-col transition-colors ${cuonResult && cuonResult.thanhTien > 0 ? "bg-blue-50 border-blue-300" : ""}`}>
              <p className="text-xs font-bold text-blue-600 mb-1.5">● CUỘN</p>
              <label className="text-xs text-gray-400">Loại gia công</label>
              <select value={String(panel.cuonGio)}
                onChange={e => setPanel((p:any) => ({...p, cuonGio: Number(e.target.value)}))}
                className={inp}>
                <option value="0">Không gia công cuộn</option>
                <option value="6000">Gia công cuộn nửa hình</option>
                <option value="12000">Gia công cuộn cả hình</option>
              </select>
              <label className="text-xs text-gray-400 mt-1.5">Thời gian (H)</label>
              <input readOnly value={cuonResult ? cuonResult.heSo : '0'} className={inpRo} />
              <label className="text-xs text-gray-400 mt-1.5">Đơn giá (¥/giờ)</label>
              <input readOnly value={Number(panel.cuonGio) > 0 ? Number(panel.cuonGio).toLocaleString() : "6000"} className={inpRo} />
              <div className={thanhTien}>
                <p className="text-xs text-gray-400">Thành tiền (× SL)</p>
                <div className="bg-orange-50 rounded px-2 py-1 font-mono text-orange-600 font-semibold">¥ {cuonResult ? fmt(cuonResult.thanhTien) : 0}</div>
              </div>
            </div>

            {/* Gia công vát */}
            <div className={`border rounded-lg p-2 flex flex-col transition-colors ${result && result.tienVat > 0 ? "bg-blue-50 border-blue-300" : ""}`}>
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

        {/* Dau bao gia */}
        <div className="flex items-start gap-3">
        <div id="dau-bao-gia" className="bg-white rounded-xl shadow-sm border-2 border-red-500 p-4 text-sm font-medium w-[460px] flex-shrink-0">
          <div className="space-y-2 text-[15px] leading-relaxed">
            {!isFax && <p><span className="text-red-600 font-bold">{congTy?.tiengNhat || donHang.tenCongTy}</span><span className="ml-1">&#40;&#x682a;&#41;&#12288;&#24481;&#20013;</span></p>}
            {!isFax && <p>&#12356;&#12388;&#12418;&#12362;&#19990;&#35441;&#12395;&#12394;&#12387;&#12390;&#12362;&#12426;&#12414;&#12377;&#12290;</p>}
            <div className="flex items-center justify-between">
              <p>&#32435;&#26399;&#23455;&#20064;&#12288;
                {tuVanNgay
                  ? <span className="ml-1">&#30456;&#35611;&#24517;&#35201;</span>
                  : <><span style={{display:"inline-block",minWidth:"2.5rem",borderBottom:"1px solid #9ca3af",textAlign:"center",marginLeft:"4px",marginRight:"4px",fontSize:"15px"}}><input value={ngayGiao} onChange={e => setNgayGiao(e.target.value)} style={{width:"2.5rem",border:"none",outline:"none",background:"transparent",textAlign:"center",fontSize:"15px",fontFamily:"inherit",color:"inherit"}} /></span>
                    &#12288;&#26085;&#12411;&#12393;</>
                }
              </p>

            </div>
            <p>&#24403;&#22238;&#31572;&#37329;&#39069;&#12398;&#26377;&#21177;&#26399;&#38480;&#12399;2&#36913;&#38291;&#12414;&#12391;&#12392;&#12394;&#12426;&#12414;&#12377;&#12290;</p>
            <p>&#12362;&#21839;&#12356;&#21512;&#12431;&#12379;&#12289;&#12372;&#27880;&#25991;&#12398;&#38555;&#12395;&#12399;&#19979;&#35352;&#30058;&#21495;&#12434;&#12362;&#30693;&#12425;&#12379;&#12367;&#12384;&#12373;&#12356;&#12290;</p>
            <p className="mt-3">&#12300;&#12458;&#12458;&#12479;&#35211;&#31296;&#12418;&#12426;No.&#12288;&#12301;&#12288;<span className="text-red-600 font-bold text-base">{donHang.maDon}</span></p>
            <div className="flex gap-3 mt-3">
              {['松林','藤本'].map(name => (
                <div key={name} style={{width:"48px",height:"48px",borderRadius:"50%",border:"2px solid #ef4444",color:"#ef4444",fontWeight:"bold",fontSize:"14px",position:"relative",display:"inline-block"}}><span style={{position:"absolute",top:"35%",left:"50%",transform:"translate(-50%,-50%)",lineHeight:1,whiteSpace:"nowrap"}}>{name}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
        <div className="pt-1">
          <p className="text-xs text-gray-400 mb-1.5">Xem trước nội dung copy</p>
          <div className="border rounded-lg p-3 bg-gray-50 inline-block min-w-[200px]">
            <pre className="text-xs font-mono whitespace-pre-wrap text-gray-700 leading-relaxed">{buildTamText({ ...panel, gia1Tam: result?.gia1Tam || 0 })}</pre>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <button onClick={copyDauBaoGiaText}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 whitespace-nowrap">
            {copiedText ? '✓ Đã copy' : '📝 Copy chữ'}
          </button>
          <button onClick={copyDauBaoGia} disabled={copyingImg}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap">
            {copyingImg ? '⏳' : '📋 Copy ảnh'}
          </button>
          <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer whitespace-nowrap">
            <input type="checkbox" checked={tuVanNgay} onChange={e => setTuVanNgay(e.target.checked)} className="accent-red-500" />
            Cần trao đổi thời gian giao
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer whitespace-nowrap">
            <input type="checkbox" checked={isFax} onChange={e => setIsFax(e.target.checked)} className="accent-red-500" />
            Fax
          </label>
        </div>
        </div>
        <div className="pt-1 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-xs text-gray-400 whitespace-nowrap">Xem trước nội dung note</p>
            <input value={noteSearch} onChange={e => setNoteSearch(e.target.value)}
              placeholder="🔍 Tìm note..."
              className="flex-1 border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={openAddNote} className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-1.5 py-0.5 hover:bg-blue-50 whitespace-nowrap">+ Thêm</button>
          </div>
          <div className="border rounded-lg p-2 max-h-40 overflow-y-auto flex flex-col gap-1 mb-2">
            {noteList.length === 0 ? (
              <p className="text-xs text-gray-300">Chưa có note nào</p>
            ) : noteList.filter((n:any) => noteSearch === '' || n.tiengViet.toLowerCase().includes(noteSearch.toLowerCase()) || (n.tiengNhat && n.tiengNhat.includes(noteSearch))).map((n:any) => (
              <div key={n.id} className="flex items-start gap-1.5 group">
                <input type="checkbox" checked={selectedNoteIds.includes(n.id)} onChange={() => toggleNote(n.id)} className="accent-blue-600 mt-0.5" />
                <label onClick={() => toggleNote(n.id)} className="flex-1 cursor-pointer">
                  <p className="text-xs text-gray-700">{n.tiengViet}</p>
                </label>
                <button onClick={() => openEditNote(n)} className="text-xs text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100">✏️</button>
                <button onClick={() => deleteNote(n.id)} className="text-xs text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100">✕</button>
              </div>
            ))}
          </div>
          {selectedNoteIds.length > 0 && (
            <div className="border rounded-lg p-2 bg-gray-50">
              {noteList.filter(n => selectedNoteIds.includes(n.id)).map((n:any) => (
                <div key={n.id} className="mb-1.5 last:mb-0">
                  <p className="text-xs text-gray-500">{n.tiengViet}</p>
                  <p className="text-xs font-medium text-gray-800">{n.tiengNhat}</p>
                </div>
              ))}
              <button onClick={copyNoteJapanese} className="mt-1 w-full text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                {copiedNote ? '✓ Đã copy' : '📋 Copy note (tiếng Nhật)'}
              </button>
            </div>
          )}
        </div>
        <div className="pt-1 ml-auto">
          <div className="border rounded-lg p-2 flex flex-col gap-1.5">
            <span className="text-xs text-gray-400 font-medium">Options</span>
            <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer whitespace-nowrap">
              <input type="radio" name="loaiTinh" value="binh_thuong" checked={loaiTinh === 'binh_thuong'} onChange={e => setLoaiTinh(e.target.value)} className="accent-blue-600" />
              Bình thường
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer whitespace-nowrap">
              <input type="radio" name="loaiTinh" value="chi_gia_cong" checked={loaiTinh === 'chi_gia_cong'} onChange={e => setLoaiTinh(e.target.value)} className="accent-blue-600" />
              Chỉ gia công (Không Laze)
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer whitespace-nowrap">
              <input type="radio" name="loaiTinh" value="vat_lieu_khach_cap" checked={loaiTinh === 'vat_lieu_khach_cap'} onChange={e => setLoaiTinh(e.target.value)} className="accent-blue-600" />
              Vật liệu khách cấp
            </label>
          </div>
        </div>
        </div>
      </div>

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowNoteModal(false)}>
          <div className="bg-white rounded-xl p-4 w-[400px]" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-bold text-gray-700 mb-3">{editingNote ? 'Sửa note' : 'Thêm note'}</p>
            <label className="text-xs text-gray-500">Tiếng Việt</label>
            <textarea value={noteForm.tiengViet} onChange={e => setNoteForm(f => ({ ...f, tiengViet: e.target.value }))}
              className="w-full border rounded-lg px-2 py-1 text-xs mb-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
            <label className="text-xs text-gray-500">Tiếng Nhật</label>
            <textarea value={noteForm.tiengNhat} onChange={e => setNoteForm(f => ({ ...f, tiengNhat: e.target.value }))}
              className="w-full border rounded-lg px-2 py-1 text-xs mb-3 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNoteModal(false)} className="text-xs px-3 py-1.5 rounded-lg border text-gray-500 hover:bg-gray-50">Huỷ</button>
              <button onClick={saveNote} className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
            </div>
          </div>
        </div>
      )}
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
                    cuonGio: p.cuonGio, vatMm: p.vatMm, lamTron250: !!p.lamTron250,
                  })
                  if (p.donGiaDatNgoai > 0) {
                    skipDatNgoaiDetect.current = true
                    setDonGiaDatNgoai(p.donGiaDatNgoai)
                    setInputDatNgoai(String(p.donGiaDatNgoai))
                    setShowModalDatNgoai(false)
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  copyTam(p, donHang)
                }} className={editingPanelId === p.id ? 'flex justify-between items-center px-2 py-1 rounded border-b last:border-0 cursor-pointer bg-blue-50 border-l-2 border-l-blue-500' : 'flex justify-between items-center px-2 py-1 rounded border-b last:border-0 cursor-pointer hover:bg-gray-50'}>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{p.tenTam || 'Tấm '+(i+1)}</p>
                    <p className="text-xs text-gray-400">{p.vatLieu} {p.doDay}mm · ×{p.soLuong}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-red-500 font-semibold">¥{fmt(p.gia1Tam)}</span>
                    <button onClick={e => { e.stopPropagation(); setXoaTamId(p.id) }}
                      className="text-gray-300 hover:text-red-500 transition-colors text-sm leading-none">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Import thành công */}
        {importResult !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <p className="font-bold text-gray-800 text-lg mb-1">Import thành công!</p>
              <p className="text-sm text-gray-500 mb-5">Đã nhập <span className="font-bold text-green-600">{importResult} tấm</span> vào đơn hàng</p>
              <button onClick={() => setImportResult(null)}
                className="w-full py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700">
                OK
              </button>
            </div>
          </div>
        )}
        {/* Modal Xoá tấm */}
        {xoaTamId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/>
                    <path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-800">Xoá tấm này?</p>
                  <p className="text-xs text-gray-400 mt-0.5">Thao tác không thể hoàn tác</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setXoaTamId(null)}
                  className="px-4 py-2 rounded-lg border text-xs text-gray-600 hover:bg-gray-50">Giữ lại</button>
                <button onClick={async () => {
                  const id = xoaTamId
                  setXoaTamId(null)
                  await xoaTam(id)
                }} className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600">Xoá tấm</button>
              </div>
            </div>
          </div>
        )}
        {/* Modal Huỷ đơn */}
        {showModalHuy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/>
                    <path d="M9,6V4h6v2"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-800">Huỷ đơn #{donHang.maDon}?</p>
                  <p className="text-xs text-gray-400 mt-0.5">Đơn có {donHang.panels.length} tấm — toàn bộ sẽ bị xoá vĩnh viễn</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowModalHuy(false)}
                  className="px-4 py-2 rounded-lg border text-xs text-gray-600 hover:bg-gray-50">Giữ lại</button>
                <button onClick={async () => {
                  await fetch('/api/don-hang/' + donHang.id, { method: 'DELETE' })
                  setShowModalHuy(false)
                  setDonHang(null)
                }} className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600">Xoá đơn</button>
              </div>
            </div>
          </div>
        )}
        {/* Modal Đặt ngoài */}
        {showModalDatNgoai && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
              <p className="font-bold text-gray-800 mb-1">Giá đặt ngoài</p>
              <p className="text-xs text-gray-400 mb-2">
                Vật liệu <span className="font-medium text-gray-700">{panel.vatLieu} {panel.doDay}mm</span> chưa có đơn giá.<br/>
                Nhập đơn giá gốc — hệ số <span className="font-medium text-orange-600">
                  {(panel.vatLieu.toUpperCase().includes('SUS') || panel.vatLieu.toUpperCase().startsWith('A')) ? '×1.2' : '×1.3'}
                </span> sẽ được áp dụng tự động.
              </p>
              {donGiaDatNgoai > 0 && (
                <div className="bg-blue-50 text-blue-700 text-xs rounded-lg px-3 py-2 mb-3">
                  Lần trước đã nhập: <span className="font-bold">{donGiaDatNgoai.toLocaleString()} ¥/kg</span>
                </div>
              )}
              <input
                type="number"
                value={inputDatNgoai}
                onChange={e => setInputDatNgoai(e.target.value)}
                placeholder="Nhập đơn giá (¥/kg)..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowModalDatNgoai(false); setPanel((p:any) => ({...p, doDay: ''})) }}
                  className="text-xs px-4 py-2 rounded-lg border text-gray-500 hover:bg-gray-50">Huỷ</button>
                <button onClick={() => {
                  const gia = Number(inputDatNgoai)
                  if (!gia || gia <= 0) return alert('Vui lòng nhập đơn giá hợp lệ')
                  setDonGiaDatNgoai(gia)
                  setShowModalDatNgoai(false)
                }} className="text-xs px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Xác nhận</button>
              </div>
            </div>
          </div>
        )}
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
                  ['Loại cuộn', modalPanel.cuonGio === 6000 ? 'Nửa hình' : modalPanel.cuonGio === 12000 ? 'Cả hình' : 'Không'],
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
                    cuonGio: modalPanel.cuonGio, vatMm: modalPanel.vatMm, lamTron250: !!modalPanel.lamTron250,
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
            <div className={`rounded p-1.5 ${result && result.gia1TamGoc < 250 ? 'bg-amber-50 border-2 border-amber-400' : 'bg-gray-50'}`}>
              <p className="text-xs font-bold text-blue-600">GIÁ 1 TẤM</p>
              <p className="font-mono font-bold text-xs">¥ {result ? fmt(result.gia1Tam) : 0}</p>
              {result && result.gia1TamGoc < 250 && (
                <div className="mt-1">
                  <p className="text-xs text-amber-600 font-medium leading-tight">⚠️ Giá gốc ¥{fmt(result.gia1TamGoc)} &lt; 250</p>
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => setPanel((pv:any) => ({ ...pv, lamTron250: false }))}
                      className={`flex-1 text-xs px-1 py-0.5 rounded border ${!panel.lamTron250 ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-500 border-gray-300 hover:bg-gray-50'}`}>Giữ gốc</button>
                    <button onClick={() => setPanel((pv:any) => ({ ...pv, lamTron250: true }))}
                      className={`flex-1 text-xs px-1 py-0.5 rounded border ${panel.lamTron250 ? 'bg-amber-500 text-white border-amber-500' : 'text-gray-500 border-gray-300 hover:bg-gray-50'}`}>Làm tròn 250</button>
                  </div>
                </div>
              )}
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
