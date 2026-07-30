'use client'
import { useEffect, useState } from 'react'

const ADMIN_PASSWORD = 'ohta2026'

function HeSoTable({ title, data, loaiA, loaiB, labelA, labelB, onUpdate, onAdd, onDelete, locked }: any) {
  const [editing, setEditing] = useState<any>(null)
  const [newRow, setNewRow] = useState({ loai: loaiA, heSo: '', dieuKien: '', thuTu: 0 })
  const [showAdd, setShowAdd] = useState(false)

  const groupA = data.filter((r: any) => r.loai === loaiA)
  const groupB = data.filter((r: any) => r.loai === loaiB)

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
        {!locked && <button onClick={() => setShowAdd(!showAdd)} className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-100">+ Thêm dòng</button>}
      </div>
      {showAdd && !locked && (
        <div className="flex gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
          <select value={newRow.loai} onChange={e => setNewRow(r => ({...r, loai: e.target.value}))} className="border rounded px-2 py-1 text-xs">
            <option value={loaiA}>{labelA}</option>
            <option value={loaiB}>{labelB}</option>
          </select>
          <input placeholder="Hệ số" type="number" value={newRow.heSo} onChange={e => setNewRow(r => ({...r, heSo: e.target.value}))} className="border rounded px-2 py-1 text-xs w-20" />
          <input placeholder="Điều kiện" value={newRow.dieuKien} onChange={e => setNewRow(r => ({...r, dieuKien: e.target.value}))} className="border rounded px-2 py-1 text-xs flex-1" />
          <input placeholder="Thứ tự" type="number" value={newRow.thuTu} onChange={e => setNewRow(r => ({...r, thuTu: Number(e.target.value)}))} className="border rounded px-2 py-1 text-xs w-16" />
          <button onClick={() => { onAdd({...newRow, heSo: Number(newRow.heSo)}); setShowAdd(false); setNewRow({ loai: loaiA, heSo: '', dieuKien: '', thuTu: 0 }) }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Lưu</button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {[{ loai: loaiA, label: labelA, rows: groupA }, { loai: loaiB, label: labelB, rows: groupB }].map(g => (
          <div key={g.loai} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-1.5 border-b"><p className="text-xs font-semibold text-gray-600">{g.label}</p></div>
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white z-10"><tr className="border-b bg-gray-50">
                <th className="px-3 py-1.5 text-left text-gray-400">Hệ số</th>
                <th className="px-3 py-1.5 text-left text-gray-400">Điều kiện</th>
                {!locked && <th className="px-3 py-1.5"></th>}
              </tr></thead>
              <tbody>
                {g.rows.map((r: any) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-1.5">
                      {editing?.id === r.id
                        ? <input type="number" value={editing.heSo} onChange={e => setEditing((ed: any) => ({...ed, heSo: e.target.value}))} className="border rounded px-1 py-0.5 w-16 text-xs" />
                        : <span className="font-mono text-blue-600">{r.heSo}</span>}
                    </td>
                    <td className="px-3 py-1.5">
                      {editing?.id === r.id
                        ? <input value={editing.dieuKien} onChange={e => setEditing((ed: any) => ({...ed, dieuKien: e.target.value}))} className="border rounded px-1 py-0.5 w-full text-xs" />
                        : <span className="text-gray-600">{r.dieuKien}</span>}
                    </td>
                    {!locked && <td className="px-3 py-1.5">
                      {editing?.id === r.id
                        ? <div className="flex gap-1">
                            <button onClick={() => { onUpdate(editing.id, { heSo: Number(editing.heSo), dieuKien: editing.dieuKien }); setEditing(null) }} className="text-green-600 text-xs">✓</button>
                            <button onClick={() => setEditing(null)} className="text-gray-400 text-xs">✕</button>
                          </div>
                        : <div className="flex gap-1">
                            <button onClick={() => setEditing(r)} className="text-blue-400 text-xs hover:text-blue-600">✏️</button>
                            <button onClick={() => onDelete(r.id)} className="text-red-400 text-xs hover:text-red-600">✕</button>
                          </div>}
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CaiDatPage() {
  const [bangGia, setBangGia] = useState<any[]>([])
  const [congTy, setCongTy] = useState<any[]>([])
  const [hesoBe, setHesoBe] = useState<any[]>([])
  const [hesoPitchi, setHesoPitchi] = useState<any[]>([])
  const [hesoGiaCong, setHesoGiaCong] = useState<any[]>([])
  const [hesoCuon, setHesoCuon] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Bảng giá form
  const [showAddBG, setShowAddBG] = useState(false)
  const [newBG, setNewBG] = useState({ vatLieu: '', doDay: '', donGia: 0, giaUon: 0, giaCat: 0, giaMoLo: 0, giaTappu: 0, giaVat: 0, tyTrong: 7.85 })
  const [editingBG, setEditingBG] = useState<any>(null)

  // Công ty form
  const [showAddCT, setShowAddCT] = useState(false)
  const [newCT, setNewCT] = useState({ tenCongTy: '', tiengNhat: '', heSo_4_5mm: 44, heSo_duoi4_5mm: 64, isUuDai: false })
  const [editingCT, setEditingCT] = useState<any>(null)

  // Hệ số gia công editing
  const [editingGC, setEditingGC] = useState<any>(null)

  // Lock state cho 4 bảng hệ số
  const [locked, setLocked] = useState(true)
  const [showPwdModal, setShowPwdModal] = useState(false)
  const [pwd, setPwd] = useState('')
  const [pwdError, setPwdError] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/bang-gia').then(r => r.json()),
      fetch('/api/cong-ty').then(r => r.json()),
      fetch('/api/heso-be').then(r => r.json()),
      fetch('/api/heso-pitchi').then(r => r.json()),
      fetch('/api/heso-gia-cong').then(r => r.json()),
      fetch('/api/heso-cuon').then(r => r.json()),
    ]).then(([bg, ct, hb, hp, hg, hc]) => {
      setBangGia(bg); setCongTy(ct); setHesoBe(hb)
      setHesoPitchi(hp); setHesoGiaCong(hg); setHesoCuon(hc)
      setLoading(false)
    })
  }, [])

  function unlock() {
    if (pwd === ADMIN_PASSWORD) { setLocked(false); setShowPwdModal(false); setPwd(''); setPwdError(false) }
    else { setPwdError(true) }
  }

  // CRUD bang gia
  async function themBangGia() {
    const r = await fetch('/api/bang-gia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newBG) })
    const d = await r.json(); setBangGia(p => [...p, d]); setShowAddBG(false)
    setNewBG({ vatLieu: '', doDay: '', donGiaVL: 0, tienBe: 0, giaCat: 0, donGiaLo: 0, donGiaLoTappu: 0, giaVat: 0, tyTrong: 7.85 })
  }
  async function suaBangGia(id: number, data: any) {
    const r = await fetch('/api/bang-gia/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const d = await r.json(); setBangGia(p => p.map(x => x.id === id ? d : x)); setEditingBG(null)
  }
  async function xoaBangGia(id: number) {
    if (!confirm('Xoá dòng này?')) return
    await fetch('/api/bang-gia/' + id, { method: 'DELETE' }); setBangGia(p => p.filter(x => x.id !== id))
  }

  // CRUD cong ty
  async function themCongTy() {
    const r = await fetch('/api/cong-ty', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCT) })
    const d = await r.json(); setCongTy(p => [...p, d]); setShowAddCT(false)
    setNewCT({ tenCongTy: '', tiengNhat: '', heSo_4_5mm: 44, heSo_duoi4_5mm: 64, isUuDai: false })
  }
  async function suaCongTy(id: number, data: any) {
    const r = await fetch('/api/cong-ty/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const d = await r.json(); setCongTy(p => p.map(x => x.id === id ? d : x)); setEditingCT(null)
  }
  async function xoaCongTy(id: number) {
    if (!confirm('Xoá công ty này?')) return
    await fetch('/api/cong-ty/' + id, { method: 'DELETE' }); setCongTy(p => p.filter(x => x.id !== id))
  }

  // CRUD heso chung
  async function crudHeSo(api: string, setter: any, action: string, id?: number, data?: any) {
    if (action === 'add') {
      const r = await fetch('/api/' + api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      r.json().then((d: any) => setter((p: any) => [...p, d]))
    } else if (action === 'update') {
      const r = await fetch('/api/' + api + '/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      setter((p: any) => p.map((x: any) => x.id === id ? { ...x, ...data } : x))
    } else if (action === 'delete') {
      if (!confirm('Xoá dòng này?')) return
      await fetch('/api/' + api + '/' + id, { method: 'DELETE' })
      setter((p: any) => p.filter((x: any) => x.id !== id))
    }
  }

  if (loading) return <div className="p-8 text-gray-400 text-sm">Đang tải...</div>

  return (
    <div className="p-5 space-y-5 text-xs">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Cài đặt thông số</h1>
        {locked
          ? <button onClick={() => setShowPwdModal(true)} className="flex items-center gap-1 text-xs border border-orange-300 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50">🔒 Mở khoá chỉnh hệ số</button>
          : <button onClick={() => setLocked(true)} className="flex items-center gap-1 text-xs border border-green-300 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-50">🔓 Đang mở khoá · Khoá lại</button>}
      </div>

      {/* Modal mật khẩu */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80">
            <h3 className="font-bold text-gray-800 mb-3">🔒 Nhập mật khẩu</h3>
            <p className="text-xs text-gray-400 mb-3">Cần mật khẩu để chỉnh sửa bảng hệ số</p>
            <input type="password" value={pwd} onChange={e => { setPwd(e.target.value); setPwdError(false) }}
              onKeyDown={e => e.key === 'Enter' && unlock()}
              placeholder="Nhập mật khẩu..."
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${pwdError ? 'border-red-400 focus:ring-red-300' : 'focus:ring-blue-400'}`} />
            {pwdError && <p className="text-red-500 text-xs mt-1">Mật khẩu không đúng</p>}
            <div className="flex gap-2 mt-3">
              <button onClick={unlock} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">Xác nhận</button>
              <button onClick={() => { setShowPwdModal(false); setPwd(''); setPwdError(false) }} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Huỷ</button>
            </div>
          </div>
        </div>
      )}

      {/* Bảng giá VL */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="font-semibold text-gray-800 text-sm">Bảng giá vật liệu</h2>
            <p className="text-xs text-gray-400">Đơn giá ¥/kg theo VL + độ dày · Ưu đãi ×1.1 · Không ưu đãi ×1.2</p>
          </div>
          <button onClick={() => setShowAddBG(!showAddBG)} className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-100">+ Thêm</button>
        </div>

        {showAddBG && (
          <div className="grid grid-cols-9 gap-1.5 mb-3 p-3 bg-gray-50 rounded-lg">
            {[
              { key: 'vatLieu', ph: 'Vật liệu' }, { key: 'doDay', ph: 'Dày(mm)', type: 'number' },
              { key: 'donGia', ph: 'Đơn giá', type: 'number' },
              { key: 'giaUon', ph: 'Giá uốn', type: 'number' }, { key: 'giaCat', ph: 'Giá cắt', type: 'number' },
              { key: 'giaMoLo', ph: 'Giá mở lỗ', type: 'number' }, { key: 'giaTappu', ph: 'Tappu/Sara', type: 'number' },
              { key: 'giaVat', ph: 'Giá vát', type: 'number' }, { key: 'tyTrong', ph: 'Tỷ trọng', type: 'number' },
            ].map(f => (
              <input key={f.key} type={f.type || 'text'} placeholder={f.ph} value={(newBG as any)[f.key]}
                onChange={e => setNewBG(p => ({...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value}))}
                className="border rounded px-2 py-1 text-xs" />
            ))}
            <button onClick={themBangGia} className="col-span-9 bg-blue-600 text-white py-1 rounded text-xs">Lưu</button>
          </div>
        )}

        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-left text-gray-400 border-b">
                <th className="pb-1.5 pr-2">Vật liệu</th>
                <th className="pb-1.5 pr-2">Dày(mm)</th>
                <th className="pb-1.5 pr-2">Đơn giá</th>
                <th className="pb-1.5 pr-2 text-green-600">Ưu đãi ×1.1</th>
                <th className="pb-1.5 pr-2 text-orange-500">Không ưu đãi ×1.2</th>
                <th className="pb-1.5 pr-2 text-red-500">Đặt ngoài ×1.3</th>
                <th className="pb-1.5 pr-2">Giá uốn(¥/m)</th>
                <th className="pb-1.5 pr-2">Giá cắt(¥/m)</th>
                <th className="pb-1.5 pr-2">Giá mở lỗ(¥)</th>
                <th className="pb-1.5 pr-2">Giá Tappu/Sara(¥)</th>
                <th className="pb-1.5 pr-2">Giá vát(¥)</th>
                <th className="pb-1.5 pr-2">Tỷ trọng</th>
                <th className="pb-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {bangGia.map(row => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  {editingBG?.id === row.id ? (
                    <>
                      {['vatLieu','doDay','donGia','giaUon','giaCat','giaMoLo','giaTappu','giaVat','tyTrong'].map(k => (
                        <td key={k} className="py-1 pr-2">
                          <input type={k === 'vatLieu' ? 'text' : 'number'} value={editingBG[k]}
                            onChange={e => setEditingBG((p: any) => ({...p, [k]: k === 'vatLieu' ? e.target.value : Number(e.target.value)}))}
                            className="border rounded px-1.5 py-0.5 w-full text-xs" />
                        </td>
                      ))}
                      <td className="py-1">
                        <div className="flex gap-1">
                          <button onClick={() => suaBangGia(editingBG.id, editingBG)} className="text-green-600">✓</button>
                          <button onClick={() => setEditingBG(null)} className="text-gray-400">✕</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-1.5 pr-2 font-medium">{row.vatLieu}</td>
                      <td className="py-1.5 pr-2">{row.doDay}</td>
                      <td className="py-1.5 pr-2 font-mono">{row.donGia}</td>
                      <td className="py-1.5 pr-2 text-green-600 font-mono">{row.uuDai || (row.donGia * 1.1).toFixed(1)}</td>
                      <td className="py-1.5 pr-2 text-orange-500 font-mono">{row.khongUuDai || (row.donGia * 1.2).toFixed(1)}</td>
                      <td className="py-1.5 pr-2 text-red-500 font-mono">{row.datNgoai || (row.donGia * 1.3).toFixed(1)}</td>
                      <td className="py-1.5 pr-2 font-mono">{row.giaUon}</td>
                      <td className="py-1.5 pr-2 font-mono">{row.giaCat}</td>
                      <td className="py-1.5 pr-2 font-mono">{row.giaMoLo}</td>
                      <td className="py-1.5 pr-2 font-mono">{row.giaTappu}</td>
                      <td className="py-1.5 pr-2 font-mono">{row.giaVat}</td>
                      <td className="py-1.5 pr-2">{row.tyTrong}</td>
                      <td className="py-1.5">
                        <div className="flex gap-1">
                          <button onClick={() => setEditingBG(row)} className="text-blue-400 hover:text-blue-600">✏️</button>
                          <button onClick={() => xoaBangGia(row.id)} className="text-red-400 hover:text-red-600">✕</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {bangGia.length === 0 && <p className="text-center text-gray-400 py-6">Chưa có dữ liệu</p>}
        </div>
      </div>

      {/* Danh sách công ty */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-800 text-sm">Danh sách công ty ưu đãi</h2>
          <button onClick={() => setShowAddCT(!showAddCT)} className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-100">+ Thêm</button>
        </div>
        {showAddCT && (
          <div className="flex gap-2 mb-3 p-3 bg-gray-50 rounded-lg flex-wrap">
            <input placeholder="Tên công ty (EN)" value={newCT.tenCongTy} onChange={e => setNewCT(p => ({...p, tenCongTy: e.target.value}))} className="border rounded px-2 py-1 text-xs flex-1 min-w-32" />
            <input placeholder="Tiếng Nhật" value={newCT.tiengNhat} onChange={e => setNewCT(p => ({...p, tiengNhat: e.target.value}))} className="border rounded px-2 py-1 text-xs flex-1 min-w-32" />
            <input placeholder="HeSo ≥4.5" type="number" value={newCT.heSo_4_5mm} onChange={e => setNewCT(p => ({...p, heSo_4_5mm: Number(e.target.value)}))} className="border rounded px-2 py-1 text-xs w-24" />
            <input placeholder="HeSo <4.5" type="number" value={newCT.heSo_duoi4_5mm} onChange={e => setNewCT(p => ({...p, heSo_duoi4_5mm: Number(e.target.value)}))} className="border rounded px-2 py-1 text-xs w-24" />
            <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={newCT.isUuDai} onChange={e => setNewCT(p => ({...p, isUuDai: e.target.checked}))} />
              Ưu đãi
            </label>
            <button onClick={themCongTy} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Lưu</button>
          </div>
        )}
        <div className="max-h-60 overflow-y-auto"><table className="w-full text-xs">
          <thead className="sticky top-0 bg-white z-10"><tr className="text-left text-gray-400 border-b">
            <th className="pb-1.5 pr-2">Tên công ty (EN)</th>
            <th className="pb-1.5 pr-2">Tiếng Nhật</th>
            <th className="pb-1.5 pr-2 text-green-600">Hệ số ≥4.5mm</th>
            <th className="pb-1.5 pr-2 text-orange-500">Hệ số &lt;4.5mm</th>
            <th className="pb-1.5 pr-2">Ưu đãi</th>
            <th className="pb-1.5"></th>
          </tr></thead>
          <tbody>
            {congTy.map(ct => (
              <tr key={ct.id} className="border-b hover:bg-gray-50">
                {editingCT?.id === ct.id ? (
                  <>
                    <td className="py-1 pr-2"><input value={editingCT.tenCongTy} onChange={e => setEditingCT((p:any) => ({...p, tenCongTy: e.target.value}))} className="border rounded px-1.5 py-0.5 w-full text-xs" /></td>
                    <td className="py-1 pr-2"><input value={editingCT.tiengNhat} onChange={e => setEditingCT((p:any) => ({...p, tiengNhat: e.target.value}))} className="border rounded px-1.5 py-0.5 w-full text-xs" /></td>
                    <td className="py-1 pr-2"><input type="number" value={editingCT.heSo_4_5mm} onChange={e => setEditingCT((p:any) => ({...p, heSo_4_5mm: Number(e.target.value)}))} className="border rounded px-1.5 py-0.5 w-16 text-xs" /></td>
                    <td className="py-1 pr-2"><input type="number" value={editingCT.heSo_duoi4_5mm} onChange={e => setEditingCT((p:any) => ({...p, heSo_duoi4_5mm: Number(e.target.value)}))} className="border rounded px-1.5 py-0.5 w-16 text-xs" /></td>
                    <td className="py-1 pr-2"><input type="checkbox" checked={editingCT.isUuDai} onChange={e => setEditingCT((p:any) => ({...p, isUuDai: e.target.checked}))} /></td>
                    <td className="py-1"><div className="flex gap-1">
                      <button onClick={() => suaCongTy(editingCT.id, editingCT)} className="text-green-600">✓</button>
                      <button onClick={() => setEditingCT(null)} className="text-gray-400">✕</button>
                    </div></td>
                  </>
                ) : (
                  <>
                    <td className="py-1.5 pr-2 font-medium">{ct.tenCongTy}</td>
                    <td className="py-1.5 pr-2 text-gray-500">{ct.tiengNhat}</td>
                    <td className="py-1.5 pr-2 text-green-600 font-mono">{ct.heSo_4_5mm}</td>
                    <td className="py-1.5 pr-2 text-orange-500 font-mono">{ct.heSo_duoi4_5mm}</td>
                    <td className="py-1.5 pr-2"><span className={ct.isUuDai ? 'text-green-500 font-medium' : 'text-gray-400'}>{ct.isUuDai ? '✓ Ưu đãi' : 'Thường'}</span></td>
                    <td className="py-1.5"><div className="flex gap-1">
                      <button onClick={() => setEditingCT(ct)} className="text-blue-400 hover:text-blue-600">✏️</button>
                      <button onClick={() => xoaCongTy(ct.id)} className="text-red-400 hover:text-red-600">✕</button>
                    </div></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {congTy.length === 0 && <p className="text-center text-gray-400 py-6">Chưa có công ty nào</p>}
      </div>

      {/* Hệ số bẻ */}
      <HeSoTable title="Bảng hệ số tấm bẻ" data={hesoBe}
        loaiA="trong_luong" loaiB="chieu_dai" labelA="Theo trọng lượng" labelB="Theo chiều dài"
        locked={locked}
        onAdd={(d: any) => crudHeSo('heso-be', setHesoBe, 'add', undefined, d)}
        onUpdate={(id: number, d: any) => crudHeSo('heso-be', setHesoBe, 'update', id, d)}
        onDelete={(id: number) => crudHeSo('heso-be', setHesoBe, 'delete', id)} />

      {/* Hệ số Pitchi Kakumaru */}
      <HeSoTable title="Bảng hệ số tấm Pitchi - Kakumaru" data={hesoPitchi}
        loaiA="trong_luong" loaiB="chieu_dai" labelA="Theo trọng lượng" labelB="Theo chiều dài"
        locked={locked}
        onAdd={(d: any) => crudHeSo('heso-pitchi', setHesoPitchi, 'add', undefined, d)}
        onUpdate={(id: number, d: any) => crudHeSo('heso-pitchi', setHesoPitchi, 'update', id, d)}
        onDelete={(id: number) => crudHeSo('heso-pitchi', setHesoPitchi, 'delete', id)} />

      {/* Hệ số gia công */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-800 text-sm">Bảng hệ số gia công</h2>
          {!locked && <span className="text-xs text-green-600">🔓 Có thể chỉnh sửa</span>}
        </div>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white z-10"><tr className="bg-gray-50 border-b">
              {hesoGiaCong.map((r: any) => <th key={r.id} className="px-4 py-2 text-left text-gray-500">{r.tenLoai}</th>)}
            </tr></thead>
            <tbody><tr className="hover:bg-gray-50">
              {hesoGiaCong.map((r: any) => (
                <td key={r.id} className="px-4 py-2">
                  {!locked && editingGC === r.id
                    ? <input type="number" defaultValue={r.heSo}
                        onBlur={e => { crudHeSo('heso-gia-cong', setHesoGiaCong, 'update', r.id, { heSo: Number(e.target.value) }); setEditingGC(null) }}
                        className="border rounded px-1 py-0.5 w-16 text-xs" autoFocus />
                    : <span className="font-mono text-blue-600 cursor-pointer" onClick={() => !locked && setEditingGC(r.id)}>{r.heSo}{!locked && ' ✏️'}</span>}
                </td>
              ))}
            </tr></tbody>
          </table>
        </div>
      </div>

      {/* Hệ số cuộn */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-800 text-sm">Bảng hệ số cuộn</h2>
          {!locked && (
            <button onClick={() => crudHeSo('heso-cuon', setHesoCuon, 'add', undefined, { tenLoai: 'Mới', heSo: 1, dieuKien: '' })}
              className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-100">+ Thêm</button>
          )}
        </div>
        {hesoCuon.length === 0
          ? <div className="border rounded-lg p-6 text-center text-gray-300 text-xs">Chưa có dữ liệu — {locked ? 'mở khoá để thêm' : 'bấm + Thêm'}</div>
          : <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white z-10"><tr className="bg-gray-50 border-b">
                  <th className="px-3 py-2 text-left text-gray-400">Loại</th>
                  <th className="px-3 py-2 text-left text-gray-400">Hệ số</th>
                  <th className="px-3 py-2 text-left text-gray-400">Điều kiện</th>
                  {!locked && <th className="px-3 py-2"></th>}
                </tr></thead>
                <tbody>
                  {hesoCuon.map((r: any) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-1.5 font-medium">{r.tenLoai}</td>
                      <td className="px-3 py-1.5 font-mono text-blue-600">{r.heSo}</td>
                      <td className="px-3 py-1.5 text-gray-500">{r.dieuKien}</td>
                      {!locked && <td className="px-3 py-1.5">
                        <button onClick={() => crudHeSo('heso-cuon', setHesoCuon, 'delete', r.id)} className="text-red-400 hover:text-red-600">✕</button>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
      </div>
    </div>
  )
}
