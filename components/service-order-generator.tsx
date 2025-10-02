"use client"

import { supabase } from '@/lib/supabase/client'
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Printer, Save, Wrench } from "lucide-react"
import { ServiceOrderPreview } from "./service-order-preview"
import { PageHeader } from "./PageHeader"

// Interfaces
interface ServiceOrderData { cliente_nome: string; cliente_endereco: string; cliente_telefone: string; cliente_email: string; cliente_documento: string; servicetype: string; description: string; scheduleddate: string; observations: string; osnumber: string; created_at: string; status: "agendado" | "em-andamento" | "concluido" | "cancelado"; }

// Props
interface ServiceOrderGeneratorProps {
  onBackToMenu: () => void;
  onViewOSList: () => void;
  onLogout: () => void;
}

const serviceTypes = [ { value: "visita-tecnica", label: "Visita Técnica" }, { value: "instalacao-cftv", label: "Instalação de CFTV" }, { value: "instalacao-alarme", label: "Instalação de Alarme" }, { value: "instalacao-controle-acesso", label: "Instalação de Controle de Acesso" }, { value: "instalacao-automacao", label: "Instalação de Automação Residencial" }, { value: "manutencao-preventiva", label: "Manutenção Preventiva" }, { value: "manutencao-corretiva", label: "Manutenção Corretiva" }, ]

export function ServiceOrderGenerator({ onBackToMenu, onViewOSList, onLogout }: ServiceOrderGeneratorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const initialOsNumber = `OS-${Date.now().toString().slice(-6)}`
  const [serviceOrderData, setServiceOrderData] = useState<ServiceOrderData>({ cliente_nome: "", cliente_endereco: "", cliente_telefone: "", cliente_email: "", cliente_documento: "", servicetype: "", description: "", scheduleddate: "", observations: "", osnumber: initialOsNumber, status: "agendado", created_at: new Date().toISOString() })

  const saveServiceOrder = async () => { if (!serviceOrderData.cliente_nome.trim()) { alert("Por favor, preencha o nome do cliente antes de salvar."); return; } if (!serviceOrderData.servicetype) { alert("Por favor, selecione o tipo de serviço."); return; } const { data: { user } } = await supabase.auth.getUser(); if (!user) { alert("Erro: Você precisa estar logado para salvar uma Ordem de Serviço."); return; } const osDataToInsert = { ...serviceOrderData, user_id: user.id }; const { error } = await supabase.from('ordens_servico').insert([osDataToInsert as any]); if (error) { console.error("Erro ao salvar no Supabase:", error); alert(`Falha ao salvar a Ordem de Serviço. Verifique o console.`); } else { alert(`Ordem de Serviço ${serviceOrderData.osnumber} salva com sucesso no banco de dados!`); } };
  const updateClient = (field: keyof ServiceOrderData, value: string) => { setServiceOrderData((prev) => ({ ...prev, [field]: value, })) };

  if (showPreview) {
    return <ServiceOrderPreview serviceOrderData={serviceOrderData as any} onBack={() => setShowPreview(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Sistema de Ordem de Serviço - WARP"
        onBackToMenu={onBackToMenu}
        onLogout={onLogout}
        onViewList={onViewOSList}
        viewListText="Ver Ordens de Serviço"
      />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Gerar Nova Ordem de Serviço</h1>
          <p className="text-muted-foreground">Preencha os dados abaixo</p>
        </div>
        <div className="space-y-6">
          <Card className="border-red-100"><CardHeader className="bg-red-50"><CardTitle className="flex items-center gap-2 text-red-700"><FileText className="h-5 w-5" />Dados do Cliente</CardTitle></CardHeader><CardContent className="pt-6 space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label htmlFor="clientName">Nome do Cliente *</Label><Input id="clientName" value={serviceOrderData.cliente_nome} onChange={(e) => updateClient("cliente_nome", e.target.value)} placeholder="Nome completo ou razão social" /></div><div><Label htmlFor="clientDocument">CPF/CNPJ</Label><Input id="clientDocument" value={serviceOrderData.cliente_documento} onChange={(e) => updateClient("cliente_documento", e.target.value)} placeholder="000.000.000-00 ou 00.000.000/0001-00" /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label htmlFor="clientPhone">Telefone/Contato *</Label><Input id="clientPhone" value={serviceOrderData.cliente_telefone} onChange={(e) => updateClient("cliente_telefone", e.target.value)} placeholder="(11) 99999-9999" /></div><div><Label htmlFor="clientEmail">E-mail</Label><Input id="clientEmail" type="email" value={serviceOrderData.cliente_email} onChange={(e) => updateClient("cliente_email", e.target.value)} placeholder="email@exemplo.com" /></div></div><div><Label htmlFor="clientAddress">Endereço Completo *</Label><Textarea id="clientAddress" value={serviceOrderData.cliente_endereco} onChange={(e) => updateClient("cliente_endereco", e.target.value)} placeholder="Rua, número, bairro, cidade, CEP" rows={2} /></div></CardContent></Card>
          <Card className="border-red-100"><CardHeader className="bg-red-50"><CardTitle className="flex items-center gap-2 text-red-700"><Wrench className="h-5 w-5" />Detalhes do Serviço</CardTitle></CardHeader><CardContent className="pt-6 space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label htmlFor="serviceType">Tipo de Serviço *</Label><Select value={serviceOrderData.servicetype} onValueChange={(value) => setServiceOrderData((prev) => ({ ...prev, servicetype: value }))}><SelectTrigger><SelectValue placeholder="Selecione o tipo de serviço" /></SelectTrigger><SelectContent>{serviceTypes.map((service) => (<SelectItem key={service.value} value={service.value}>{service.label}</SelectItem>))}</SelectContent></Select></div><div><Label htmlFor="scheduledDate">Data Agendada</Label><Input id="scheduledDate" type="datetime-local" value={serviceOrderData.scheduleddate} onChange={(e) => setServiceOrderData((prev) => ({ ...prev, scheduleddate: e.target.value }))} /></div></div><div><Label htmlFor="description">Descrição do Serviço</Label><Textarea id="description" value={serviceOrderData.description} onChange={(e) => setServiceOrderData((prev) => ({ ...prev, description: e.target.value }))} placeholder="Descreva detalhadamente o serviço a ser executado..." rows={4} /></div><div><Label htmlFor="observations">Observações</Label><Textarea id="observations" value={serviceOrderData.observations} onChange={(e) => setServiceOrderData((prev) => ({ ...prev, observations: e.target.value }))} placeholder="Informações adicionais, materiais necessários, condições especiais, etc." rows={3} /></div></CardContent></Card>
          <div className="flex gap-4 justify-end"><Button variant="outline" onClick={saveServiceOrder} className="gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"><Save className="h-4 w-4" />Salvar OS</Button><Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2 border-red-200 text-red-600 hover:bg-red-50"><FileText className="h-4 w-4" />Visualizar OS</Button><Button onClick={() => setShowPreview(true)} className="gap-2 bg-red-600 hover:bg-red-700"><Printer className="h-4 w-4" />Gerar OS</Button></div>
        </div>
      </div>
    </div>
  )
}