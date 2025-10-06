"use client"

import { supabase } from '@/lib/supabase/client'
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Printer, Save, Wrench } from "lucide-react"
import { PageHeader } from "./PageHeader"

// --- CORREÇÃO PRINCIPAL: IMPORTAMOS DOS ARQUIVOS CERTOS ---
import { ServiceOrderPreview, type ServiceOrderData } from "./service-order-preview"
import { type StructuredServiceData, type AcaoValue, type SistemaValue, type TipoManutencaoValue } from "@/lib/serviceUtils"

// Opções para o formulário (hardcoded para simplicidade e segurança)
const acaoOptions = [ { value: "instalacao", label: "Instalação" }, { value: "manutencao", label: "Manutenção" }, { value: "visita-tecnica", label: "Visita Técnica" } ] as const;
const sistemaOptions = [ { value: "cftv", label: "CFTV" }, { value: "alarme", label: "Alarme" }, { value: "controle-acesso", label: "Controle de Acesso" }, { value: "automacao-residencial", label: "Automação Residencial" } ] as const;
const tipoManutencaoOptions = [ { value: "preventiva", label: "Preventiva" }, { value: "corretiva", label: "Corretiva" } ] as const;

// Interface local que estende a importada, para uso no estado do formulário
interface LocalServiceOrderData extends Omit<ServiceOrderData, 'servicetype' | 'status'> {
    servicetype: StructuredServiceData;
    status: "agendado" | "em-andamento" | "concluido" | "cancelado";
}

interface ServiceOrderGeneratorProps {
  onBackToMenu: () => void;
  onViewOSList: () => void;
  onLogout: () => void;
}

export function ServiceOrderGenerator({ onBackToMenu, onViewOSList, onLogout }: ServiceOrderGeneratorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const initialOsNumber = `OS-${Date.now().toString().slice(-6)}`

  const [serviceOrderData, setServiceOrderData] = useState<LocalServiceOrderData>({
    cliente_nome: "", cliente_endereco: "", cliente_telefone: "", cliente_email: "", cliente_documento: "", 
    servicetype: { acao: undefined, sistemas: [], tipo_manutencao: undefined }, 
    description: "", scheduleddate: "", observations: "", osnumber: initialOsNumber, 
    status: "agendado", created_at: new Date().toISOString()
  })

  const saveServiceOrder = async () => { if (!serviceOrderData.cliente_nome.trim()) { alert("Por favor, preencha o nome do cliente."); return; } if (!serviceOrderData.servicetype.acao) { alert("Por favor, selecione o tipo de serviço."); return; } const { data: { user } } = await supabase.auth.getUser(); if (!user) { alert("Erro: Você precisa estar logado."); return; } const osDataToInsert = { ...serviceOrderData, user_id: user.id }; const { error } = await supabase.from('ordens_servico').insert([osDataToInsert as any]); if (error) { console.error("Erro ao salvar:", error); alert(`Falha ao salvar.`); } else { alert(`Ordem de Serviço ${serviceOrderData.osnumber} salva com sucesso!`); } };
  const updateField = (field: keyof Omit<LocalServiceOrderData, 'servicetype'>, value: string) => { setServiceOrderData((prev) => ({ ...prev, [field]: value })) };

  const handleAcaoChange = (value: AcaoValue) => { setServiceOrderData(prev => ({ ...prev, servicetype: { ...prev.servicetype, acao: value, sistemas: value === 'visita-tecnica' ? [] : prev.servicetype.sistemas, tipo_manutencao: value !== 'manutencao' ? undefined : prev.servicetype.tipo_manutencao } })); };
  const handleSistemaChange = (sistemaValue: SistemaValue) => { setServiceOrderData(prev => { const currentSistemas = prev.servicetype.sistemas || []; const newSistemas = currentSistemas.includes(sistemaValue) ? currentSistemas.filter((s: SistemaValue) => s !== sistemaValue) : [...currentSistemas, sistemaValue]; return { ...prev, servicetype: { ...prev.servicetype, sistemas: newSistemas } }; }); };
  const handleTipoManutencaoChange = (value: TipoManutencaoValue) => { setServiceOrderData(prev => ({ ...prev, servicetype: { ...prev.servicetype, tipo_manutencao: value } })); };

  if (showPreview) {
    return <ServiceOrderPreview serviceOrderData={serviceOrderData as ServiceOrderData} onBack={() => setShowPreview(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Sistema de Ordem de Serviço - WARP" onBackToMenu={onBackToMenu} onLogout={onLogout} onViewList={onViewOSList} viewListText="Ver Ordens de Serviço" />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Gerar Nova Ordem de Serviço</h1>
            <p className="text-muted-foreground">Preencha os dados abaixo</p>
        </div>
        <div className="space-y-6">
            <Card className="border-red-100">
                <CardHeader className="bg-red-50"><CardTitle className="flex items-center gap-2 text-red-700"><FileText className="h-5 w-5" />Dados do Cliente</CardTitle></CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="clientName">Nome do Cliente *</Label><Input id="clientName" value={serviceOrderData.cliente_nome} onChange={(e) => updateField("cliente_nome", e.target.value)} placeholder="Nome completo ou razão social" /></div>
                        <div><Label htmlFor="clientDocument">CPF/CNPJ</Label><Input id="clientDocument" value={serviceOrderData.cliente_documento} onChange={(e) => updateField("cliente_documento", e.target.value)} placeholder="000.000.000-00 ou 00.000.000/0001-00" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="clientPhone">Telefone/Contato *</Label><Input id="clientPhone" value={serviceOrderData.cliente_telefone} onChange={(e) => updateField("cliente_telefone", e.target.value)} placeholder="(11) 99999-9999" /></div>
                        <div><Label htmlFor="clientEmail">E-mail</Label><Input id="clientEmail" type="email" value={serviceOrderData.cliente_email} onChange={(e) => updateField("cliente_email", e.target.value)} placeholder="email@exemplo.com" /></div>
                    </div>
                    <div><Label htmlFor="clientAddress">Endereço Completo *</Label><Textarea id="clientAddress" value={serviceOrderData.cliente_endereco} onChange={(e) => updateField("cliente_endereco", e.target.value)} placeholder="Rua, número, bairro, cidade, CEP" rows={2} /></div>
                </CardContent>
            </Card>
            
            <Card className="border-red-100">
                <CardHeader className="bg-red-50"><CardTitle className="flex items-center gap-2 text-red-700"><Wrench className="h-5 w-5" />Detalhes do Serviço</CardTitle></CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-4">
                        <div>
                            <Label className="font-semibold text-base">Ação *</Label>
                            <RadioGroup onValueChange={handleAcaoChange} value={serviceOrderData.servicetype.acao} className="flex flex-col sm:flex-row gap-4 mt-2">
                                {acaoOptions.map(acao => ( <div key={acao.value} className="flex items-center space-x-2"> <RadioGroupItem value={acao.value} id={acao.value} /> <Label htmlFor={acao.value}>{acao.label}</Label> </div> ))}
                            </RadioGroup>
                        </div>
                        {serviceOrderData.servicetype.acao === 'manutencao' && (
                            <div>
                                <Label className="font-semibold text-base">Tipo de Manutenção *</Label>
                                <RadioGroup onValueChange={handleTipoManutencaoChange} value={serviceOrderData.servicetype.tipo_manutencao} className="flex flex-col sm:flex-row gap-4 mt-2">
                                    {tipoManutencaoOptions.map(tipo => ( <div key={tipo.value} className="flex items-center space-x-2"> <RadioGroupItem value={tipo.value} id={tipo.value} /> <Label htmlFor={tipo.value}>{tipo.label}</Label> </div> ))}
                                </RadioGroup>
                            </div>
                        )}
                        <div>
                             <Label className="font-semibold text-base">Sistemas</Label>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                {sistemaOptions.map(sistema => ( <div key={sistema.value} className="flex items-center space-x-2"> <Checkbox id={sistema.value} checked={serviceOrderData.servicetype.sistemas?.includes(sistema.value)} onCheckedChange={() => handleSistemaChange(sistema.value)} disabled={serviceOrderData.servicetype.acao === 'visita-tecnica'} /> <Label htmlFor={sistema.value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{sistema.label}</Label> </div> ))}
                             </div>
                        </div>
                    </div>
                    <div><Label htmlFor="scheduledDate">Data Agendada</Label><Input id="scheduledDate" type="datetime-local" value={serviceOrderData.scheduleddate} onChange={(e) => updateField("scheduleddate", e.target.value)} /></div>
                    <div><Label htmlFor="description">Descrição do Serviço</Label><Textarea id="description" value={serviceOrderData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Descreva detalhadamente o serviço a ser executado..." rows={4} /></div>
                    <div><Label htmlFor="observations">Observações</Label><Textarea id="observations" value={serviceOrderData.observations} onChange={(e) => updateField("observations", e.target.value)} placeholder="Informações adicionais, materiais necessários, etc." rows={3} /></div>
                </CardContent>
            </Card>

            <div className="flex gap-4 justify-end"><Button variant="outline" onClick={saveServiceOrder} className="gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"><Save className="h-4 w-4" />Salvar OS</Button><Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2 border-red-200 text-red-600 hover:bg-red-50"><FileText className="h-4 w-4" />Visualizar OS</Button><Button onClick={() => setShowPreview(true)} className="gap-2 bg-red-600 hover:bg-red-700"><Printer className="h-4 w-4" />Gerar OS</Button></div>
        </div>
      </div>
    </div>
  )
}