"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Printer, Save, Wrench } from "lucide-react"
import { ServiceOrderPreview } from "./service-order-preview"
import Image from "next/image"

interface ClientData {
  name: string
  address: string
  phone: string
  email: string
  document: string
}

interface SavedServiceOrder {
  id: string
  osNumber: string
  client: ClientData
  serviceType: string
  description: string
  scheduledDate: string
  observations: string
  status: "agendado" | "em-andamento" | "concluido" | "cancelado"
  createdAt: string
}

interface ServiceOrderData {
  client: ClientData
  serviceType: string
  description: string
  scheduledDate: string
  observations: string
}

const serviceTypes = [
  { value: "visita-tecnica", label: "Visita Técnica" },
  { value: "instalacao-cftv", label: "Instalação de CFTV" },
  { value: "instalacao-alarme", label: "Instalação de Alarme" },
  { value: "instalacao-controle-acesso", label: "Instalação de Controle de Acesso" },
  { value: "instalacao-automacao", label: "Instalação de Automação Residencial" },
  { value: "manutencao-preventiva", label: "Manutenção Preventiva" },
  { value: "manutencao-corretiva", label: "Manutenção Corretiva" },
]

export function ServiceOrderGenerator() {
  const [showPreview, setShowPreview] = useState(false)
  const [serviceOrderData, setServiceOrderData] = useState<ServiceOrderData>({
    client: {
      name: "",
      address: "",
      phone: "",
      email: "",
      document: "",
    },
    serviceType: "",
    description: "",
    scheduledDate: "",
    observations: "",
  })

  const saveServiceOrder = () => {
    if (!serviceOrderData.client.name.trim()) {
      alert("Por favor, preencha o nome do cliente antes de salvar.")
      return
    }

    if (!serviceOrderData.serviceType) {
      alert("Por favor, selecione o tipo de serviço.")
      return
    }

    const osNumber = `OS-${Date.now().toString().slice(-6)}`
    const savedServiceOrder: SavedServiceOrder = {
      id: Date.now().toString(),
      osNumber,
      ...serviceOrderData,
      status: "agendado",
      createdAt: new Date().toISOString(),
    }

    const existingOrders = JSON.parse(localStorage.getItem("warp-service-orders") || "[]")
    const updatedOrders = [...existingOrders, savedServiceOrder]
    localStorage.setItem("warp-service-orders", JSON.stringify(updatedOrders))

    alert(`Ordem de Serviço ${osNumber} salva com sucesso!`)
  }

  const updateClient = (field: keyof ClientData, value: string) => {
    setServiceOrderData((prev) => ({
      ...prev,
      client: { ...prev.client, [field]: value },
    }))
  }

  if (showPreview) {
    return <ServiceOrderPreview serviceOrderData={serviceOrderData} onBack={() => setShowPreview(false)} />
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-6 mb-4">
          <Image
            src="/images/warp-logo.png"
            alt="WARP Segurança Eletrônica"
            width={300}
            height={80}
            className="h-16 w-auto"
          />
          <Image src="/images/warp-mascot.png" alt="Mascote WARP" width={80} height={80} className="h-16 w-auto" />
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">Sistema de Ordem de Serviço</h1>
        <p className="text-muted-foreground">Geração de ordens de serviço padronizadas</p>
      </div>

      <div className="space-y-6">
        {/* Dados do Cliente */}
        <Card className="border-red-100">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <FileText className="h-5 w-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Nome do Cliente *</Label>
                <Input
                  id="clientName"
                  value={serviceOrderData.client.name}
                  onChange={(e) => updateClient("name", e.target.value)}
                  placeholder="Nome completo ou razão social"
                />
              </div>
              <div>
                <Label htmlFor="clientDocument">CPF/CNPJ</Label>
                <Input
                  id="clientDocument"
                  value={serviceOrderData.client.document}
                  onChange={(e) => updateClient("document", e.target.value)}
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientPhone">Telefone/Contato *</Label>
                <Input
                  id="clientPhone"
                  value={serviceOrderData.client.phone}
                  onChange={(e) => updateClient("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">E-mail</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={serviceOrderData.client.email}
                  onChange={(e) => updateClient("email", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="clientAddress">Endereço Completo *</Label>
              <Textarea
                id="clientAddress"
                value={serviceOrderData.client.address}
                onChange={(e) => updateClient("address", e.target.value)}
                placeholder="Rua, número, bairro, cidade, CEP"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Serviço */}
        <Card className="border-red-100">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Wrench className="h-5 w-5" />
              Detalhes do Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceType">Tipo de Serviço *</Label>
                <Select
                  value={serviceOrderData.serviceType}
                  onValueChange={(value) => setServiceOrderData((prev) => ({ ...prev, serviceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scheduledDate">Data Agendada</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={serviceOrderData.scheduledDate}
                  onChange={(e) => setServiceOrderData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição do Serviço</Label>
              <Textarea
                id="description"
                value={serviceOrderData.description}
                onChange={(e) => setServiceOrderData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva detalhadamente o serviço a ser executado..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={serviceOrderData.observations}
                onChange={(e) => setServiceOrderData((prev) => ({ ...prev, observations: e.target.value }))}
                placeholder="Informações adicionais, materiais necessários, condições especiais, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={saveServiceOrder}
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
          >
            <Save className="h-4 w-4" />
            Salvar OS
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <FileText className="h-4 w-4" />
            Visualizar OS
          </Button>
          <Button onClick={() => setShowPreview(true)} className="gap-2 bg-red-600 hover:bg-red-700">
            <Printer className="h-4 w-4" />
            Gerar OS
          </Button>
        </div>
      </div>
    </div>
  )
}
