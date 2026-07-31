'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function DonChiTietPage() {
  const { id } = useParams()
  const router = useRouter()
  const [donHang, setDonHang] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/don-hang/' + id)
      .then(r => r.json())
      .then(d => { setDonHang(d); setLoading(false) })
  }, [id])

  const fmt = (n: number) => Math.round(n).toLocaleString()
  const inpRo = "w-full mt-1 border rounded px-2 py-1 text-xs bg-gray-50 text-gray-500"

  if (loading) return <div className="p-8 text-gray-400 text-sm">Đang tải...</div>
  if (!donHang) return <div className="p-8 text-gray-400 text-sm">Không tìm thấy đơn</div>

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>
          <div>
            <p className="font-bold text-gray-800">Đơn #{donHang.maDon}</p>
            <p className="text-xs text-gray-400">{donHang.tenCongTy || '—'} · {new Date(donHang.ngayTao).toLocaleDateString('vi-VN')}</p>
          </div>
          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">Chỉ xem</span>
        </div>
        <div className="text-sm font-bold text-red-500">
          Tổng: ¥{fmt(donHang.panels.reduce((s:number,p:any)=>s+p.allIn,0))}
        </div>
      </div>

      {/* Danh sách tấm */}
      <div className="p-4 space-y-4 max-w-5xl mx-auto">
        {donHang.panels.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center text-gray-300 text-sm">Đơn chưa có tấm nào</div>
        )}
        {donHang.panels.map((p: any, i: number) => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Header tấm */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">{p.tenTam}</span>
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded">{p.vatLieu}</span>
                <span className="text-xs text-gray-400">{p.doDay}mm · X{p.x} × Y{p.y} · ×{p.soLuong}</span>
              </div>
              <span className="font-mono font-bold text-red-500 text-sm">ALL-IN ¥{fmt(p.allIn)}</span>
            </div>

            <div className="p-4 grid grid-cols-4 gap-4 text-xs">
              {/* Thông số VL */}
              <div className="col-span-4 grid grid-cols-4 gap-3 pb-3 border-b">
                {[
                  ['KL báo giá', p.klBaoGia ? p.klBaoGia.toFixed(3)+' kg' : '—'],
                  ['KL thực tế', '—'],
                  ['Giá VL', '¥'+fmt(p.giaVL)],
                  ['Giá cắt', '¥'+fmt(p.giaCat)],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-gray-400 mb-0.5">{label}</p>
                    <p className="font-medium text-gray-700">{val}</p>
                  </div>
                ))}
              </div>

              {/* Gia công */}
              <div className="col-span-4 grid grid-cols-4 gap-3 pb-3 border-b">
                {[
                  ['Lỗ nhỏ', p.loNho + ' lỗ'],
                  ['Lỗ lớn', p.loLon + ' lỗ'],
                  ['Lỗ Tappu', p.soLoTappu + ' lỗ'],
                  ['Lỗ Sara', p.soLoSara + ' lỗ'],
                  ['Vát (mm)', p.vatMm],
                  ['Pitchi SL', p.pitchiSoLan],
                  ['Pitchi CD', p.pitchiChieuDai + ' mm'],
                  ['Loại GC', p.loaiGiaCong],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-gray-400 mb-0.5">{label}</p>
                    <p className="font-medium text-gray-700">{val || '0'}</p>
                  </div>
                ))}
              </div>

              {/* Bẻ */}
              {p.be && p.be.filter((b:any) => b.daiMm > 0).length > 0 && (
                <div className="col-span-4 pb-3 border-b">
                  <p className="text-gray-400 mb-2">Bẻ / Uốn</p>
                  <div className="flex flex-wrap gap-3">
                    {p.be.filter((b:any) => b.daiMm > 0).map((b:any, j:number) => (
                      <div key={j} className="bg-gray-50 rounded px-3 py-1.5 text-xs">
                        <span className="text-gray-500">Đường {j+1}: </span>
                        <span className="font-medium">{b.soDuong} đường · {b.daiMm}mm</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tổng kết */}
              <div className="col-span-4 grid grid-cols-4 gap-3">
                {[
                  ['Giá VL', '¥'+fmt(p.giaVL)],
                  ['Giá cắt', '¥'+fmt(p.giaCat)],
                  ['Gia công', '¥'+fmt(p.giaCong)],
                  ['Giá 1 tấm', '¥'+fmt(p.gia1Tam)],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded p-2">
                    <p className="text-gray-400 mb-0.5">{label}</p>
                    <p className="font-mono font-semibold text-gray-700">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Tổng đơn */}
        {donHang.panels.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border px-6 py-4 flex justify-between items-center">
            <span className="font-bold text-gray-700">Tổng cộng ({donHang.panels.length} tấm)</span>
            <span className="font-mono font-bold text-red-500 text-xl">¥{fmt(donHang.panels.reduce((s:number,p:any)=>s+p.allIn,0))}</span>
          </div>
        )}
      </div>
    </div>
  )
}
