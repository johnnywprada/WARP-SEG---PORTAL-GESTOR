"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ServiceOrderPreview } from "./service-order-preview"

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

interface SavedServiceOrderPreviewProps {
  serviceOrder: SavedServiceOrder
  onBack: () => void
}

export function SavedServiceOrderPreview({ serviceOrder, onBack }: SavedServiceOrderPreviewProps) {
  const serviceOrderData = {
    client: serviceOrder.client,
    serviceType: serviceOrder.serviceType,
    description: serviceOrder.description,
    scheduledDate: serviceOrder.scheduledDate,
    observations: serviceOrder.observations,
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
      <ServiceOrderPreview serviceOrderData={serviceOrderData} onBack={onBack} />
    </div>
  )
}
