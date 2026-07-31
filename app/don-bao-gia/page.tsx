'use client'
import { useEffect, useState } from 'react'

export default function DonBaoGiaPage() {
  const [donHangs, setDonHangs] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/don-hang')
      .then(r => r.json())
      .then(data => {
        setDonHangs(data.filter((d: any) => d.loaiDon === 'bao_gia' || !d.loaiDon))
        setLoading(false)
      })
  }, [])

  const filtered = donHangs.filter(d =>
    d.maDon.toLowerCase().includes(search.toLowerCase()) ||
    (d.tenCongTy || '').toLowerCase().includes(search.toLowerCase())
  )

  const fmt = (n: number) => Math.round(n).toLocaleString()

  function exportCSV(dh: any) {
    const header = ['Tên tấm','SL','Vật liệu','Dày(mm)','X(mm)','Y(mm)','Giá VL','Giá cắt','Gia công','Giá 1 tấm','ALL-IN']
    const rows = dh.panels.map((p: any) => [
      p.tenTam, p.soLuong, p.vatLieu, p.doDay, p.x, p.y,
      Math.round(p.giaVL), Math.round(p.giaCat), Math.round(p.giaCong),
      Math.round(p.gia1Tam), Math.round(p.allIn)
    ])
    const csv = [header, ...rows, ['','','','','','','','','Tổng cộng','', Math.round(dh.panels.reduce((s:number,p:any)=>s+p.allIn,0))]].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = dh.maDon + '_baogía.csv'; a.click()
  }

  if (loading) return <div className="p-8 text-gray-400 text-sm">Đang tải...</div>

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Danh sách đơn */}
      <div className="w-72 border-r bg-white flex flex-col">
        <div className="p-3 border-b">
          <h2 className="font-bold text-gray-800 mb-2">📄 Đơn báo giá</h2>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm mã đơn / công ty..."
            className="w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
          <p className="text-xs text-gray-400 mt-1">{filtered.length} / {donHangs.length} đơn</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-300 text-xs">Không có đơn nào</div>
          ) : filtered.map(d => (
            <div key={d.id} onClick={() => setSelected(d)}
              className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selected?.id === d.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}>
              <div className="flex justify-between items-start">
                <p className="font-bold text-sm text-gray-800">{d.maDon}</p>
                <p className="text-xs font-mono text-red-500 font-semibold">¥ {fmt(d.panels.reduce((s:number,p:any)=>s+p.allIn,0))}</p>
              </div>
              <p className="text-xs text-gray-500">{d.tenCongTy || '—'}</p>
              <p className="text-xs text-gray-400">{new Date(d.ngayTao).toLocaleDateString('vi-VN')} · {d.panels.length} tấm</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chi tiết đơn */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-gray-300">
            <div className="text-center">
              <p className="text-4xl mb-2">📄</p>
              <p className="text-sm">Chọn đơn để xem chi tiết</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Đơn #{selected.maDon}</h2>
                <p className="text-sm text-gray-500">{selected.tenCongTy || '—'} · {new Date(selected.ngayTao).toLocaleDateString('vi-VN')}</p>
                {selected.ghiChu && <p className="text-xs text-gray-400 mt-1">{selected.ghiChu}</p>}
              </div>
              <button onClick={() => exportCSV(selected)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-green-700">
                ↓ Xuất CSV
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="border-b">
                    {['Tên tấm','SL','Vật liệu','Dày','X','Y','Giá VL','Giá cắt','Gia công','Giá 1 tấm','ALL-IN'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selected.panels.map((p: any) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{p.tenTam}</td>
                      <td className="px-3 py-2">{p.soLuong}</td>
                      <td className="px-3 py-2"><span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-xs">{p.vatLieu}</span></td>
                      <td className="px-3 py-2">{p.doDay}mm</td>
                      <td className="px-3 py-2">{p.x}</td>
                      <td className="px-3 py-2">{p.y}</td>
                      <td className="px-3 py-2 font-mono text-blue-600">¥{fmt(p.giaVL)}</td>
                      <td className="px-3 py-2 font-mono text-purple-600">¥{fmt(p.giaCat)}</td>
                      <td className="px-3 py-2 font-mono text-orange-600">¥{fmt(p.giaCong)}</td>
                      <td className="px-3 py-2 font-mono text-gray-700">¥{fmt(p.gia1Tam)}</td>
                      <td className="px-3 py-2 font-mono text-red-500 font-bold">¥{fmt(p.allIn)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2">
                    <td colSpan={10} className="px-3 py-2 text-right font-bold text-gray-700">Tổng cộng</td>
                    <td className="px-3 py-2 font-mono text-red-500 font-bold text-sm">
                      ¥{fmt(selected.panels.reduce((s:number,p:any)=>s+p.allIn,0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
              {selected.panels.length === 0 && (
                <div className="p-8 text-center text-gray-300 text-xs">Đơn chưa có tấm nào</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
