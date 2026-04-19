import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'System Design Trainer',
  description: 'Practice system design interviews with AI feedback and spaced repetition',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen`}>
        <nav className="border-b border-gray-800 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-gray-100 hover:text-blue-400 transition-colors">
              ⚙️ System Design Trainer
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/" className="text-gray-400 hover:text-gray-100 transition-colors">
                Practice
              </Link>
              <Link href="/study" className="text-gray-400 hover:text-gray-100 transition-colors">
                Study
              </Link>
              <Link href="/references" className="text-gray-400 hover:text-gray-100 transition-colors">
                References
              </Link>
              <Link href="/progress" className="text-gray-400 hover:text-gray-100 transition-colors">
                Progress
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
