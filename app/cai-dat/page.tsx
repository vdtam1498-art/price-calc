'use client'
import { useEffect, useState } from 'react'

export default function CaiDatPage() {
  const [bangGia, setBangGia] = useState<any[]>([])
  const [congTy, setCongTy] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/bang-gia').then(r => r.json()),
      fetch('/api/cong-ty').then(r => r.json()),
    ]).then(([bg, ct]) => { setBangGia(bg); setCongTy(ct); setLoading(false) })
  }, [])

  async function xoaBangGia(id: number) {
    await fetch('/api/bang-gia/' + id, { method: 'DELETE' })
    setBangGia(prev => prev.filter(r => r.id !== id))
  }

  async function xoaCongTy(id: number) {
    await fetch('/api/cong-ty/' + id, { method: 'DELETE' })
    setCongTy(prev => prev.filter(r => r.id !== id))
  }

  if (loading) return <div className="p-8 text-gray-500">Đang tải...</div>

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Cài đặt thông số</h1>

      {/* Bảng giá VL */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">Bảng giá vật liệu</h2>
            <p className="text-xs text-gray-400">Đơn giá ¥/kg theo VL + độ dày · Ưu đãi ×1.1 · Không ưu đãi ×1.2</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="pb-2 pr-3">Vật liệu</th>
                <th className="pb-2 pr-3">Dày(mm)</th>
                <th className="pb-2 pr-3 text-green-600">Đơn giá VL</th>
                <th className="pb-2 pr-3 text-orange-500">Tiền bẻ(¥)</th>
                <th className="pb-2 pr-3 text-red-500">Giá cắt(¥/m)</th>
                <th className="pb-2 pr-3">Đơn giá lỗ(¥)</th>
                <th className="pb-2 pr-3">Đơn giá tappu(¥)</th>
                <th className="pb-2 pr-3">Giá vát(¥)</th>
                <th className="pb-2 pr-3">Tỷ trọng</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {bangGia.map(row => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-3 font-medium">{row.vatLieu}</td>
                  <td className="py-2 pr-3">{row.doDay}</td>
                  <td className="py-2 pr-3 text-green-600 font-mono">{row.donGiaVL}</td>
                  <td className="py-2 pr-3 font-mono">{row.tienBe}</td>
                  <td className="py-2 pr-3 text-red-500 font-mono">{row.giaCat}</td>
                  <td className="py-2 pr-3 font-mono">{row.donGiaLo}</td>
                  <td className="py-2 pr-3 font-mono">{row.donGiaLoTappu}</td>
                  <td className="py-2 pr-3 font-mono">{row.giaVat}</td>
                  <td className="py-2 pr-3">{row.tyTrong}</td>
                  <td className="py-2">
                    <button onClick={() => xoaBangGia(row.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bangGia.length === 0 && <p className="text-center text-gray-400 py-8">Chưa có dữ liệu. Hãy import từ Google Sheets.</p>}
        </div>
      </div>

      {/* Danh sách công ty */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Danh sách công ty ưu đãi</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b">
              <th className="pb-2 pr-3">Tên công ty (EN)</th>
              <th className="pb-2 pr-3">Tiếng Nhật</th>
              <th className="pb-2 pr-3 text-green-600">Hệ số ≥4.5mm</th>
              <th className="pb-2 pr-3 text-orange-500">Hệ số &lt;4.5mm</th>
              <th className="pb-2 pr-3">Ưu đãi</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {congTy.map(ct => (
              <tr key={ct.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-3 font-medium">{ct.tenCongTy}</td>
                <td className="py-2 pr-3 text-gray-500">{ct.tiengNhat}</td>
                <td className="py-2 pr-3 text-green-600 font-mono">{ct.heSo_4_5mm}</td>
                <td className="py-2 pr-3 text-orange-500 font-mono">{ct.heSo_duoi4_5mm}</td>
                <td className="py-2 pr-3">
                  <span className={ct.isUuDai ? 'text-green-500 text-xs font-medium' : 'text-gray-400 text-xs'}>
                    {ct.isUuDai ? '✓ Ưu đãi' : 'Thường'}
                  </span>
                </td>
                <td className="py-2">
                  <button onClick={() => xoaCongTy(ct.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {congTy.length === 0 && <p className="text-center text-gray-400 py-8">Chưa có công ty nào.</p>}
      </div>

      {/* Bảng hệ số tấm bẻ */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-800 mb-1">Bảng hệ số tấm bẻ</h2>
        <p className="text-xs text-gray-400 mb-4">Hệ số áp dụng khi tính tiền bẻ/uốn</p>
        <div className="grid grid-cols-2 gap-4">
          {/* Theo trọng lượng */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b">
              <p className="text-xs font-semibold text-gray-600">Theo trọng lượng</p>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50">
                <th className="px-3 py-2 text-left text-xs text-gray-500">Hệ số</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Điều kiện</th>
              </tr></thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">1</td><td className="px-3 py-2 text-xs text-gray-600">&lt; 40 kg</td></tr>
                <tr className="border-b hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">1.5</td><td className="px-3 py-2 text-xs text-gray-600">40 – 100 kg</td></tr>
                <tr className="hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">2</td><td className="px-3 py-2 text-xs text-gray-600">&gt; 100 kg</td></tr>
              </tbody>
            </table>
          </div>
          {/* Theo chiều dài */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b">
              <p className="text-xs font-semibold text-gray-600">Theo chiều dài</p>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50">
                <th className="px-3 py-2 text-left text-xs text-gray-500">Hệ số</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Điều kiện</th>
              </tr></thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">1</td><td className="px-3 py-2 text-xs text-gray-600">&lt; 3m</td></tr>
                <tr className="border-b hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">2.5</td><td className="px-3 py-2 text-xs text-gray-600">3 – 4m</td></tr>
                <tr className="border-b hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">3</td><td className="px-3 py-2 text-xs text-gray-600">4 – 5m</td></tr>
                <tr className="border-b hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">3.5</td><td className="px-3 py-2 text-xs text-gray-600">5 – 6m</td></tr>
                <tr className="hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">4.5</td><td className="px-3 py-2 text-xs text-gray-600">&gt; 6m</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bảng hệ số tấm Pitchi - Kakumaru */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-800 mb-1">Bảng hệ số tấm Pitchi - Kakumaru</h2>
        <p className="text-xs text-gray-400 mb-4">Hệ số áp dụng khi tính tiền Pitchi/Kakumaru</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b">
              <p className="text-xs font-semibold text-gray-600">Theo trọng lượng</p>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50">
                <th className="px-3 py-2 text-left text-xs text-gray-500">Hệ số</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Điều kiện</th>
              </tr></thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">1</td><td className="px-3 py-2 text-xs text-gray-600">&lt; 40 kg</td></tr>
                <tr className="border-b hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">1.5</td><td className="px-3 py-2 text-xs text-gray-600">40 – 100 kg</td></tr>
                <tr className="hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">2</td><td className="px-3 py-2 text-xs text-gray-600">&gt; 100 kg</td></tr>
              </tbody>
            </table>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b">
              <p className="text-xs font-semibold text-gray-600">Theo chiều dài</p>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50">
                <th className="px-3 py-2 text-left text-xs text-gray-500">Hệ số</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Điều kiện</th>
              </tr></thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">1</td><td className="px-3 py-2 text-xs text-gray-600">&lt; 3m</td></tr>
                <tr className="border-b hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">2.5</td><td className="px-3 py-2 text-xs text-gray-600">3 – 4m</td></tr>
                <tr className="border-b hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">3</td><td className="px-3 py-2 text-xs text-gray-600">4 – 5m</td></tr>
                <tr className="border-b hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">3.5</td><td className="px-3 py-2 text-xs text-gray-600">5 – 6m</td></tr>
                <tr className="hover:bg-gray-50"><td className="px-3 py-2 font-mono text-blue-600">4.5</td><td className="px-3 py-2 text-xs text-gray-600">&gt; 6m</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bảng hệ số gia công */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-800 mb-1">Bảng hệ số gia công</h2>
        <p className="text-xs text-gray-400 mb-4">Hệ số nhân theo loại gia công</p>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-2 text-left text-xs text-gray-500">Pitchi</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500">Nón</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500">Nón lệch</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500">Kakumaru</th>
                <th className="px-4 py-2 text-left text-xs text-gray-500">Kakumaru lệch</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-blue-600">1</td>
                <td className="px-4 py-3 font-mono text-blue-600">1.25</td>
                <td className="px-4 py-3 font-mono text-blue-600">1.5</td>
                <td className="px-4 py-3 font-mono text-blue-600">2</td>
                <td className="px-4 py-3 font-mono text-blue-600">2.5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bảng hệ số cuộn */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-800 mb-1">Bảng hệ số cuộn</h2>
        <p className="text-xs text-gray-400 mb-4">Đang cập nhật...</p>
        <div className="border rounded-lg p-8 text-center text-gray-300">
          <p className="text-sm">Chưa có dữ liệu</p>
        </div>
      </div>

    </div>
  )
}
