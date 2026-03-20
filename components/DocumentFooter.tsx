"use client"

import Image from "next/image"
import { Phone, Mail, Globe } from "lucide-react"

const brandMascot = process.env.NEXT_PUBLIC_BRAND_MASCOT_URL || "/images/warp-mascot.png";
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WARP Segurança Eletrônica";
const brandSlogan = process.env.NEXT_PUBLIC_BRAND_SLOGAN || "Especialistas em segurança eletrônica oferecendo soluções completas para proteger o que é mais importante para você.";
const brandPhone = process.env.NEXT_PUBLIC_BRAND_PHONE || "(11) 95990-2308";
const brandEmail = process.env.NEXT_PUBLIC_BRAND_EMAIL || "johnnywprada@gmail.com";
const brandWebsite = process.env.NEXT_PUBLIC_BRAND_WEBSITE || "www.warpseg.com.br";
const brandCnpj = process.env.NEXT_PUBLIC_BRAND_CNPJ || "CNPJ: 35.550.155/0001-86";

export function DocumentFooter() {
  return (
    <div className="mt-8 pt-4 border-t print:mt-8 print:block print:relative w-full print:opacity-100 break-inside-avoid" style={{ borderTopColor: "rgba(220, 38, 38, 0.2)" }}>
      
      {/* Container 100% width para não espremer */}
      <div className="w-full">
        
        {/* Usando Grid 3 colunas ao invés de Flex para garantir o alinhamento estrito na esquerda e direita */}
        <div className="grid grid-cols-[100px_1fr_auto] gap-4 items-center w-full">
          
          {/* Coluna 1: Mascote */}
          <div className="flex justify-start">
            <Image
              src={brandMascot}
              alt="Mascote"
              width={1120}
              height={928}
              quality={100}
              className="w-auto h-20 print:h-16 object-contain"
            />
          </div>

          {/* Coluna 2: Slogan */}
          <div className="text-left">
            <h4 className="font-bold text-sm" style={{ color: "#dc2626" }}>{brandName}</h4>
            <p className="text-[10px] text-gray-700 leading-tight mt-1 max-w-[300px]">
              {brandSlogan}
            </p>
          </div>
          
          {/* Coluna 3: Contatos */}
          <div className="text-right text-[10px] space-y-1 text-gray-800 flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" style={{ color: "#dc2626" }} />
              <span>{brandPhone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-3 w-3" style={{ color: "#dc2626" }} />
              <span>{brandEmail}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3 w-3" style={{ color: "#dc2626" }} />
              <span>{brandWebsite}</span>
            </div>
            <div className="pt-1 mt-1 border-t w-full text-right" style={{ borderTopColor: "rgba(0, 0, 0, 0.1)" }}>
              <span className="text-[9px] text-gray-500 font-medium">{brandCnpj}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}