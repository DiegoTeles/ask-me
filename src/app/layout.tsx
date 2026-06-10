import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Me pergunte qualquer coisa',
  description: 'Faça perguntas anônimas e veja as respostas.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
