"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
// AQUI ESTÁ A MUDANÇA: Importamos o COMPONENTE e também o TIPO
import { ServiceOrderPreview, type ServiceOrderData } from "./service-order-preview"

// Interface dos dados que vêm do banco (a origem)
interface SavedServiceOrder {
  id: string
  osNumber: string
  client: {
    name: string
    address: string
    phone: string
    email: string
    document: string
  }
  serviceType: string
  description: string
  scheduledDate: string
  observations: string
  status: "agendado" | "em-andamento" | "concluido" | "cancelado"
  createdAt: string
}

// A interface ServiceOrderData foi REMOVIDA daqui

interface SavedServiceOrderPreviewProps {
  serviceOrder: SavedServiceOrder
  onBack: () => void
}

export function SavedServiceOrderPreview({ serviceOrder, onBack }: SavedServiceOrderPreviewProps) {

  const mappedData: ServiceOrderData = {
    // Dados do cliente (já estavam corretos)
    cliente_nome: serviceOrder.client.name,
    cliente_endereco: serviceOrder.client.address,
    cliente_telefone: serviceOrder.client.phone,
    cliente_email: serviceOrder.client.email,
    cliente_documento: serviceOrder.client.document,

    // CORRIGINDO os nomes para bater com a interface
    servicetype: serviceOrder.serviceType,
    description: serviceOrder.description,
    scheduleddate: serviceOrder.scheduledDate,
    observations: serviceOrder.observations,

    // ADICIONANDO os campos que estavam faltando
    osnumber: serviceOrder.osNumber,
    created_at: serviceOrder.createdAt,
  }

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
          OS: {serviceOrder.osNumber} | Status: {serviceOrder.status}
        </div>
      </div>

      <ServiceOrderPreview serviceOrderData={mappedData} onBack={onBack} />
    </div>
  )
}