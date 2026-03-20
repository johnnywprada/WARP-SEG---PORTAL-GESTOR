import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { Footer } from "@/components/Footer"

export const metadata: Metadata = {
  title: "Portal Warp SEG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {/* ADIÇÃO DA CLASSE print:block PARA MATAR O FLEXBOX NA IMPRESSÃO */}
      <body className={`flex print:block min-h-screen flex-col font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        
        {/* ADIÇÃO DA CLASSE print:block AQUI TAMBÉM */}
        <main className="flex-grow print:block">
          <Suspense fallback={null}>{children}</Suspense>
        </main>

        <Footer />
        
        <Analytics />
      </body>
    </html>
  )
}