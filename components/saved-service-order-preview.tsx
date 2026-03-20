"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, MessageCircle } from "lucide-react"
import { ServiceOrderPreview } from "./service-order-preview"
import { type SavedServiceOrder } from "@/lib/types"

export function SavedServiceOrderPreview({ serviceOrder, onBack }: { serviceOrder: SavedServiceOrder, onBack: () => void }) {
  
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `OS ${serviceOrder.osnumber} - ${serviceOrder.cliente_nome}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  }

  const handleWhatsAppShare = () => {
    const publicUrl = `${window.location.origin}/view/os/${serviceOrder.id}`;
    const text = `Olá ${serviceOrder.cliente_nome},\n\nSegue o link para visualização da sua Ordem de Serviço da WARP:\n\n${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white flex flex-col">
      <div className="sticky top-0 bg-white border-b shadow-sm z-50 p-4 flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={onBack} className="gap-2 !text-destructive !border-destructive/40 hover:bg-destructive/10">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <div className="flex gap-3">
          <Button onClick={handleWhatsAppShare} className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm border-none">
            <MessageCircle className="h-4 w-4" /> Enviar WhatsApp
          </Button>
          <Button onClick={handlePrint} className="gap-2 bg-destructive hover:bg-destructive/90 text-white shadow-sm">
            <Printer className="h-4 w-4" /> Imprimir / Salvar PDF
          </Button>
        </div>
      </div>

      <div className="flex-grow py-8 px-4 flex justify-center print:p-0 print:block">
        <div className="bg-white shadow-xl w-full max-w-[210mm] p-10 print:p-0 print:shadow-none print:max-w-none print:w-full mx-auto">
          <ServiceOrderPreview serviceOrderData={serviceOrder as any} />
        </div>
      </div>
    </div>
  )
}