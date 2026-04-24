import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'fixjson API',
  description: 'A fast, deterministic API to fix malformed JSON payloads.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
