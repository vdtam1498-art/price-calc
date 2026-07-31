'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/cong-cu-tinh-tien',
    label: 'Công cụ tính tiền',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <line x1="8" y1="7" x2="16" y2="7"/>
        <line x1="8" y1="11" x2="16" y2="11"/>
        <line x1="8" y1="15" x2="12" y2="15"/>
      </svg>
    )
  },
  {
    href: '/don-bao-gia',
    label: 'Đơn báo giá',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="13" y2="17"/>
      </svg>
    )
  },
  {
    href: '/don-trien-khai',
    label: 'Đơn triển khai',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    )
  },
  {
    href: '/cai-dat',
    label: 'Cài đặt thông số',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    )
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <div className="w-[210px] min-h-screen bg-[#1a1f2e] flex flex-col text-white">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white">
            <img src="/logo.png" alt="OHTA Logo" className="w-7 h-7 object-contain" />
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
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                ${active
                  ? 'bg-red-500 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
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
