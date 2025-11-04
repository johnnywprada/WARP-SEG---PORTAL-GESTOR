"use client"

import Image from "next/image"
import { Phone, Mail, Globe } from "lucide-react"

// Lemos as variáveis de ambiente. Elas começarão com NEXT_PUBLIC_ para serem acessíveis no navegador.
const brandMascot = process.env.NEXT_PUBLIC_BRAND_MASCOT_URL || "/images/warp-mascot.png";
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WARP Segurança Eletrônica";
const brandSlogan = process.env.NEXT_PUBLIC_BRAND_SLOGAN || "Especialistas em segurança eletrônica oferecendo soluções completas para proteger o que é mais importante para você.";
const brandPhone = process.env.NEXT_PUBLIC_BRAND_PHONE || "(11) 95990-2308";
const brandEmail = process.env.NEXT_PUBLIC_BRAND_EMAIL || "johnnywprada@gmail.com";
const brandWebsite = process.env.NEXT_PUBLIC_BRAND_WEBSITE || "https://warpseg.vercel.app";
const brandCnpj = process.env.NEXT_PUBLIC_BRAND_CNPJ || "CNPJ: 35.550.155/0001-86";

export function DocumentFooter() {
  return (
  // 1. 'hidden' - Oculto na tela
    // 2. 'print:block' - Visível APENAS na impressão
    // 3. 'print:fixed print:bottom-[1cm] print:left-0 print:right-0' - Fixado a 1cm do fundo na impressão
    // 4. 'print:opacity-20' - 80% transparente na impressão
    
    <div className="mt-8 print:mt-4 print:fixed print:bottom-1 print:left-0 print:right-0 print:w-full print:opacity-85" >
      
      {/* Container para alinhar com as margens da página (presumindo 1.5cm de padding da página) */}
      <div className="px-[0.3cm]">
        
        {/* Usamos flex para alinhar mascote, slogan e contatos */}
        <div className="flex flex-row items-center gap-0">
          
          {/* Coluna 1: Mascote (Menor) */}
          <div className="flex-shrink-0">
            <Image
              src={brandMascot}
              alt="Mascote"
              width={1120}     // <-- Largura real em pixels
              height={928}     // <-- Altura real em pixels
              quality={100}    // Opcional, para nitidez máxima
              className="w-auto h-25" // Agora vai redimensionar na proporção correta
            />
          </div>

          {/* Coluna 2: Bloco de Texto (com 'flex-grow' para ocupar o espaço) */}
          <div className="flex-grow grid grid-cols-2 gap-4 items-center">
            
            {/* Sub-coluna 1: Slogan (Menor) */}
            <div className="text-left">
              <h4 className="font-bold text-base">{brandName}</h4> {/* Corrigido de 'text-g' e reduzido de 'text-lg' */}
              <p className="text-[10px] text-gray-700"> {/* Reduzido de 'text-xs' */}
                {brandSlogan}
              </p>
            </div>
            
            {/* Sub-coluna 2: Contatos (Menor e alinhado à direita) */}
            <div className="text-right text-[10px] space-y-0.5"> {/* Reduzido de 'text-xs' */}
              <div className="flex items-center justify-end gap-1.5">
                <Phone className="h-2.5 w-2.5 text-destructive" />
                <span>{brandPhone}</span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <Mail className="h-2.5 w-2.5 text-destructive" />
                <span>{brandEmail}</span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <Globe className="h-2.5 w-2.5 text-destructive" />
                <span>{brandWebsite}</span>
              </div>
              <div className="pt-1">
                <span className="text-[10px] text-gray-700">{brandCnpj}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}