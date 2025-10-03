"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Eye, Trash2 } from "lucide-react"
import Image from "next/image"

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

interface ServiceOrderListProps {
  onBack: () => void
  onViewServiceOrder: (serviceOrder: SavedServiceOrder) => void
}

const statusLabels = {
  agendado: "Agendado",
  "em-andamento": "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
}

const statusColors = {
  agendado: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "em-andamento": "bg-blue-100 text-blue-800 border-blue-200",
  concluido: "bg-green-100 text-green-800 border-green-200",
  cancelado: "bg-red-100 text-red-800 border-red-200",
}

const serviceTypeLabels: { [key: string]: string } = {
  "visita-tecnica": "Visita Técnica",
  "instalacao-cftv": "Instalação de CFTV",
  "instalacao-alarme": "Instalação de Alarme",
  "instalacao-controle-acesso": "Instalação de Controle de Acesso",
  "instalacao-automacao": "Instalação de Automação Residencial",
  "manutencao-preventiva": "Manutenção Preventiva",
  "manutencao-corretiva": "Manutenção Corretiva",
}

export function ServiceOrderList({ onBack, onViewServiceOrder }: ServiceOrderListProps) {
  const [serviceOrders, setServiceOrders] = useState<SavedServiceOrder[]>([])

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("warp-service-orders") || "[]")
    setServiceOrders(
      savedOrders.sort(
        (a: SavedServiceOrder, b: SavedServiceOrder) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    )
  }, [])

  const updateServiceOrderStatus = (orderId: string, newStatus: SavedServiceOrder["status"]) => {
    const updatedOrders = serviceOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    setServiceOrders(updatedOrders)
    localStorage.setItem("warp-service-orders", JSON.stringify(updatedOrders))
  }

  const deleteServiceOrder = (orderId: string) => {
    if (confirm("Tem certeza que deseja excluir esta ordem de serviço?")) {
      const updatedOrders = serviceOrders.filter((order) => order.id !== orderId)
      setServiceOrders(updatedOrders)
      localStorage.setItem("warp-service-orders", JSON.stringify(updatedOrders))
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-6">
            <Image
              src="/images/warp-logo.png"
              alt="WARP Segurança Eletrônica"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">Controle de Ordens de Serviço</h1>
        <p className="text-muted-foreground">Visualize e gerencie todas as ordens de serviço geradas</p>
      </div>

      {serviceOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground text-lg">Nenhuma ordem de serviço encontrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crie sua primeira OS para começar a usar o sistema de controle
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {serviceOrders.map((order) => (
            <Card key={order.id} className="border-red-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-red-600">{order.osNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      Criado em {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cliente</p>
                    <p className="text-sm">{order.client.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tipo de Serviço</p>
                    <p className="text-sm">{serviceTypeLabels[order.serviceType] || order.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Agendado para</p>
                    <p className="text-sm">
                      {order.scheduledDate ? new Date(order.scheduledDate).toLocaleString("pt-BR") : "Não agendado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <Select
                      value={order.status}
                      onValueChange={(value: SavedServiceOrder["status"]) => updateServiceOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="em-andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewServiceOrder(order)}
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteServiceOrder(order.id)}
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
