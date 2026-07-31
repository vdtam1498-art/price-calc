import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  icons: { icon: '/logo.png', apple: '/logo.png' },
  title: 'OHTA Price Calculator',
  description: 'OFT by OHTA - Công cụ tính giá tấm kim loại',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
