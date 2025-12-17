import { Shield, Phone, Mail, MapPin } from "lucide-react"
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WARP Segurança Eletrônica";

export function Footer() {
  // Pega o ano atual automaticamente (ex: 2025)
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-slate-270 bg-slate-50 print:hidden">
      <div className="container mx-auto py-4 px-6 text-center text-xs text-slate-500">
        <p>© {currentYear} <strong>{brandName}</strong>. Todos os direitos reservados.
        </p>

        <p className="text-sm text-slate-500">
          Desenvolvido por{" "}
          <a
            href="https://wa.me/5511959902308?text=Olá, gostaria de conhecer os serviços da WARP Sistemas Inteligentes"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#dc2626] hover:text-[#dc2626]/80 transition-colors"
          >
            WARP Sistemas Inteligentes
          </a>
              </p>
      </div>
    </footer>
  )
}