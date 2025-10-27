"use client"

import Image from "next/image"
import { Phone, Mail, Globe } from "lucide-react"

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
              src="/images/warp-mascot.png"
              alt="Mascote WARP"
              width={75}   // largura proporcional
              height={90}  // altura proporcional
              className="w-auto h-20"
            />
          </div>

          {/* Coluna 2: Bloco de Texto (com 'flex-grow' para ocupar o espaço) */}
          <div className="flex-grow grid grid-cols-2 gap-4 items-center">
            
            {/* Sub-coluna 1: Slogan (Menor) */}
            <div className="text-left">
              <h4 className="font-bold text-base">WARP Segurança Eletrônica</h4> {/* Corrigido de 'text-g' e reduzido de 'text-lg' */}
              <p className="text-[10px] text-gray-700"> {/* Reduzido de 'text-xs' */}
                Especialistas em segurança eletrônica oferecendo soluções completas para proteger o que é mais importante para você.
              </p>
            </div>
            
            {/* Sub-coluna 2: Contatos (Menor e alinhado à direita) */}
            <div className="text-right text-[10px] space-y-0.5"> {/* Reduzido de 'text-xs' */}
              <div className="flex items-center justify-end gap-1.5">
                <Phone className="h-2.5 w-2.5 text-red-600" />
                <span>(11) 95990-2308</span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <Mail className="h-2.5 w-2.5 text-red-600" />
                <span>johnnywprada@gmail.com</span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <Globe className="h-2.5 w-2.5 text-red-600" />
                <span>https://warpseg.vercel.app</span>
              </div>
              <div className="pt-1">
                <span className="text-[10px] text-gray-700">CNPJ: 35.550.155/0001-86</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}