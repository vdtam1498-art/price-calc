'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function DonChiTietPage() {
  const { id } = useParams()
  const router = useRouter()
  const [donHang, setDonHang] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    fetch('/api/don-hang/' + id)
      .then(r => r.json())
      .then(d => { setDonHang(d); setLoading(false) })
  }, [id])

  const fmt = (n: number) => Math.round(n).toLocaleString()
  const inpRo = "w-full mt-1 border rounded px-2 py-1 text-xs bg-gray-50 text-gray-500 cursor-not-allowed"
  const inpGreen = "w-full mt-1 border rounded px-2 py-1 text-xs bg-green-50 text-green-700 font-mono"

  if (loading) return <div className="p-8 text-gray-400 text-sm">Đang tải...</div>
  if (!donHang) return <div className="p-8 text-gray-400 text-sm">Không tìm thấy đơn</div>

  const panels = donHang.panels
  const p = panels[idx]
  if (!p) return <div className="p-8 text-gray-400 text-sm">Đơn chưa có tấm nào</div>

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 text-xs">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
            </button>
            <span className="text-sm font-semibold text-gray-700">Đơn #{donHang.maDon}</span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-500">{donHang.tenCongTy || '—'}</span>
            <span className="bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">👁 Chỉ xem</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{idx+1} / {panels.length} tấm</span>
            <button onClick={() => setIdx(i => Math.max(0, i-1))} disabled={idx===0}
              className="px-2 py-1 border rounded text-xs disabled:opacity-30 hover:bg-gray-50">← Trước</button>
            <button onClick={() => setIdx(i => Math.min(panels.length-1, i+1))} disabled={idx===panels.length-1}
              className="px-2 py-1 border rounded text-xs disabled:opacity-30 hover:bg-gray-50">Tiếp →</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-3">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-gray-700 text-sm">| Thông số tấm</p>
            <span className="text-xs border border-orange-300 text-orange-600 px-2 py-0.5 rounded-full">{p.vatLieu}</span>
          </div>
          <div className="grid grid-cols-6 gap-2 mb-2">
            {[['Tên tấm', p.tenTam],['Vật liệu', p.vatLieu],['Độ dày (MM)', p.doDay],['X (MM)', p.x],['Y (MM)', p.y],['Số lượng', p.soLuong]].map(([label, val]) => (
              <div key={String(label)}><label className="text-xs text-gray-400">{label}</label><input readOnly value={String(val)} className={inpRo}/></div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[['Đơn giá VL (¥/KG)', p.donGiaDatNgoai > 0 ? p.donGiaDatNgoai+' ¥/kg' : '—', inpRo],
              ['KL thực tế (KG)', '—', inpGreen],
              ['Tiền vật liệu', '¥'+fmt(p.giaVL), inpGreen],
              ['Giá cắt laser', '¥'+fmt(p.giaCat), inpGreen],
            ].map(([label, val, cls]) => (
              <div key={String(label)}><label className="text-xs text-gray-400">{label}</label><input readOnly value={String(val)} className={String(cls)}/></div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-3">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-gray-700 text-sm">| Gia công</p>
            <span className="bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-3 py-0.5 text-xs font-medium">GC: ¥{fmt(p.giaCong)}</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="border rounded-lg p-2">
              <p className="text-xs font-bold text-blue-600 mb-1.5">● LỖ CẮT</p>
              <label className="text-xs text-gray-400">Lỗ nhỏ</label><input readOnly value={p.loNho} className={inpRo}/>
              <label className="text-xs text-gray-400 mt-1.5 block">Lỗ lớn</label><input readOnly value={p.loLon} className={inpRo}/>
              <label className="text-xs text-gray-400 mt-1.5 block">Lỗ quy đổi</label><input readOnly value={((p.loNho||0)+(p.loLon||0)*1.5).toFixed(1)} className={inpRo}/>
            </div>
            <div className="border rounded-lg p-2">
              <p className="text-xs font-bold text-blue-600 mb-1.5">● LỖ TAPPU / SARA</p>
              <label className="text-xs text-gray-400">Số lỗ Tappu</label><input readOnly value={p.soLoTappu} className={inpRo}/>
              <label className="text-xs text-gray-400 mt-1.5 block">Số lỗ Sara</label><input readOnly value={p.soLoSara} className={inpRo}/>
            </div>
            <div className="border rounded-lg p-2">
              <p className="text-xs font-bold text-blue-600 mb-1.5">● PITCHI</p>
              <label className="text-xs text-gray-400">Loại gia công</label><input readOnly value={p.loaiGiaCong||'Pitchi'} className={inpRo}/>
              <label className="text-xs text-gray-400 mt-1.5 block">Số lần ấn</label><input readOnly value={p.pitchiSoLan} className={inpRo}/>
              <label className="text-xs text-gray-400 mt-1.5 block">Chiều dài ấn (mm)</label><input readOnly value={p.pitchiChieuDai} className={inpRo}/>
              <div className="mt-2"><p className="text-xs text-gray-400">Thành tiền</p>
                <div className="bg-orange-50 rounded px-2 py-1 font-mono text-orange-600 font-semibold">¥ {fmt(p.pitchiGio||0)}</div>
              </div>
            </div>
            <div className="border rounded-lg p-2">
              <p className="text-xs font-bold text-blue-600 mb-1.5">● CUỘN / VÁT</p>
              <label className="text-xs text-gray-400">Cuộn</label><input readOnly value={p.cuonGio > 0 ? 'Có gia công cuộn' : 'Không'} className={inpRo}/>
              <label className="text-xs text-gray-400 mt-1.5 block">Chiều dài vát (mm)</label><input readOnly value={p.vatMm} className={inpRo}/>
            </div>
          </div>
          {p.be && p.be.filter((b:any)=>b.daiMm>0).length > 0 && (
            <div className="mt-3 border rounded-lg p-2">
              <p className="text-xs font-bold text-blue-600 mb-1.5">● BẺ / UỐN</p>
              <div className="flex flex-wrap gap-2">
                {p.be.filter((b:any)=>b.daiMm>0).map((b:any,j:number) => (
                  <div key={j} className="bg-gray-50 rounded px-3 py-1.5 text-xs text-gray-600">
                    Đường {j+1}: {b.soDuong} đường · {b.daiMm}mm
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-56 bg-white border-l flex flex-col">
        <div className="p-3 border-b flex justify-between items-center">
          <span className="text-xs font-bold text-gray-500 border-l-2 border-blue-500 pl-2">Các tấm</span>
          <span className="text-xs font-mono text-red-500 font-bold">¥{fmt(donHang.panels.reduce((s:number,pp:any)=>s+pp.allIn,0))}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {panels.map((pp:any, i:number) => (
            <div key={pp.id} onClick={() => setIdx(i)}
              className={`px-2 py-1.5 rounded border-b cursor-pointer ${idx===i ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50'}`}>
              <p className="text-xs font-semibold text-gray-700">{pp.tenTam}</p>
              <p className="text-xs text-gray-400">{pp.vatLieu} {pp.doDay}mm · ×{pp.soLuong}</p>
              <p className="text-xs font-mono text-red-500 font-semibold">¥{fmt(pp.allIn)}</p>
            </div>
          ))}
        </div>
        <div className="p-3 border-t space-y-1.5">
          {[['Giá VL',fmt(p.giaVL),'text-blue-600'],['Giá cắt',fmt(p.giaCat),'text-purple-600'],['Gia công',fmt(p.giaCong),'text-orange-600'],['Giá 1 tấm',fmt(p.gia1Tam),'text-gray-800']].map(([l,v,c])=>(
            <div key={String(l)} className="flex justify-between text-xs">
              <span className="text-gray-400">{l}</span>
              <span className={'font-mono '+c}>¥{v}</span>
            </div>
          ))}
          <div className="bg-red-50 rounded p-2 text-center mt-1">
            <p className="text-xs text-gray-400">Tổng tiền</p>
            <p className="font-mono font-bold text-red-500 text-base">¥ {fmt(p.allIn)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
