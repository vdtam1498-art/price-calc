'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/cong-cu-tinh-tien', label: 'Công cụ tính tiền', icon: '🧮' },
  { href: '/don-bao-gia', label: 'Đơn báo giá', icon: '📄' },
  { href: '/don-trien-khai', label: 'Đơn triển khai', icon: '📦' },
  { href: '/cai-dat', label: 'Cài đặt thông số', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <div className="w-[210px] min-h-screen bg-[#1a1f2e] flex flex-col text-white">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-sm font-bold">
            ≋
          </div>
          <div>
            <div className="font-bold text-sm">OHTA</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Price Calculator</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                ${active
                  ? 'bg-red-500 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-gray-500">OFT BY OHTA</div>
        <div className="text-xs text-gray-600">© 2026 by Đức Tâm</div>
      </div>
    </div>
  )
}
