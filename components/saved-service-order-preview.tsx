"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ServiceOrderPreview } from "./service-order-preview"
import { type SavedServiceOrder, type ServiceOrderData } from "@/lib/types" // Usa os tipos centrais

interface SavedServiceOrderPreviewProps {
  serviceOrder: SavedServiceOrder
  onBack: () => void
}

export function SavedServiceOrderPreview({ serviceOrder, onBack }: SavedServiceOrderPreviewProps) {
  // Mapeia os dados do formato 'SavedServiceOrder' para o formato 'ServiceOrderData' esperado pelo preview
  const ServiceOrderDataForPreview: ServiceOrderData = {
    cliente_nome: serviceOrder.cliente_nome,
    cliente_endereco: serviceOrder.cliente_endereco,
    cliente_telefone: serviceOrder.cliente_telefone,
    cliente_email: serviceOrder.cliente_email,
    cliente_documento: serviceOrder.cliente_documento,
    servicetype: serviceOrder.servicetype,
    description: serviceOrder.description,
    scheduleddate: serviceOrder.scheduleddate,
    observations: serviceOrder.observations,
    osnumber: serviceOrder.osnumber,
    created_at: serviceOrder.created_at,
    status: serviceOrder.status,
    relatorio_tecnico: serviceOrder.relatorio_tecnico
  };

  return (
    <div>
      <div className="no-print sticky top-0 bg-background border-b p-4 flex justify-between items-center print:hidden">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 bg-transparent border-red-200 text-red-600 hover:bg-red-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à Lista
        </Button>
        <div className="text-sm text-muted-foreground">
          OS: {serviceOrder.osnumber} | Status: {serviceOrder.status}
        </div>
      </div>
      <ServiceOrderPreview serviceOrderData={ServiceOrderDataForPreview} onBack={onBack} />
    </div>
  )
}