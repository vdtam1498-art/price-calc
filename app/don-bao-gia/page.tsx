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
      .then(data => { setDonHangs(data); setLoading(false) })
  }, [])

  const filtered = donHangs.filter(d =>
    d.maDon.toLowerCase().includes(search.toLowerCase()) ||
    d.tenCongTy.toLowerCase().includes(search.toLowerCase())
  )

  function exportCSV(donHang: any) {
    const header = ['Ten tam','SL','Vat lieu','Day(mm)','Ma khach','X(mm)','Y(mm)','Don gia','Thanh tien']
    const rows = donHang.panels.map((p: any) => [
      p.tenTam, p.soLuong, p.vatLieu, p.doDay, p.maKhach, p.x, p.y,
      Math.round(p.gia1Tam), Math.round(p.allIn)
    ])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = donHang.maDon + '.csv'
    a.click()
  }

  if (loading) return <div className="p-8 text-gray-500">Dang tai...</div>

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tim theo ma don / cong ty..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">{filtered.length} / {donHangs.length} don</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(d => (
            <div
              key={d.id}
              onClick={() => setSelected(d)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selected?.id === d.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex justify-between items-start">
                <span className="font-semibold text-sm">{d.maDon}</span>
                <span className="text-red-500 font-mono text-sm">Y {Math.round(d.tongTien).toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{d.tenCongTy}</div>
              <div className="text-xs text-gray-400">
                {new Date(d.ngayTao).toLocaleDateString('vi-VN')} · {d.panels.length} tam
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">Khong co don nao</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-blue-600">Chi tiet don: {selected.maDon}</h2>
              <button
                onClick={() => exportCSV(selected)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
              >
                Xuat CSV
              </button>
            </div>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3">Ten tam</th>
                    <th className="px-4 py-3">SL</th>
                    <th className="px-4 py-3">Vat lieu</th>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Ma khach</th>
                    <th className="px-4 py-3">X(mm)</th>
                    <th className="px-4 py-3">Y(mm)</th>
                    <th className="px-4 py-3">Don gia</th>
                    <th className="px-4 py-3">Thanh tien</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.panels.map((p: any) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{p.tenTam}</td>
                      <td className="px-4 py-3">{p.soLuong}</td>
                      <td className="px-4 py-3">
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">{p.vatLieu}</span>
                      </td>
                      <td className="px-4 py-3">{p.doDay}</td>
                      <td className="px-4 py-3 text-gray-400">{p.maKhach}</td>
                      <td className="px-4 py-3">{p.x}</td>
                      <td className="px-4 py-3">{p.y}</td>
                      <td className="px-4 py-3 text-blue-600 font-mono">Y {Math.round(p.gia1Tam).toLocaleString()}</td>
                      <td className="px-4 py-3 text-red-500 font-mono font-semibold">Y {Math.round(p.allIn).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-gray-50">
                    <td colSpan={8} className="px-4 py-3 text-right font-semibold text-gray-600">Tong cong</td>
                    <td className="px-4 py-3 text-red-500 font-mono font-bold">
                      Y {Math.round(selected.tongTien).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Chon mot don hang de xem chi tiet
          </div>
        )}
      </div>
    </div>
  )
}
