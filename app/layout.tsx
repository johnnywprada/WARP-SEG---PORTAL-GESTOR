// app/layout.tsx (Atualizado com o Footer)

import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { Footer } from "@/components/Footer" // 1. IMPORTAMOS O FOOTER

export const metadata: Metadata = {
  title: "Portal Warp SEG",
  // ... (o resto dos seus metadados)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {/* 2. AJUSTAMOS O BODY PARA EMPURRAR O RODAPÉ PARA BAIXO */}
      <body className={`flex min-h-screen flex-col font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        
        {/* 3. ENVOLVEMOS O CONTEÚDO PRINCIPAL EM UMA TAG <main> */}
        <main className="flex-grow">
          <Suspense fallback={null}>{children}</Suspense>
        </main>

        <Footer /> {/* 4. ADICIONAMOS O COMPONENTE DO RODAPÉ AQUI */}
        
        <Analytics />
      </body>
    </html>
  )
}