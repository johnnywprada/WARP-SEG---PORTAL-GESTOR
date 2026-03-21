"use client"

import { supabase } from '@/lib/supabase/client'
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Save, Wrench, ChevronsUpDown, Check, UserPlus, Eye } from "lucide-react"
import { PageHeader } from "./PageHeader"
import { ServiceOrderPreview} from "./service-order-preview"
import { type ServiceOrderData } from "@/lib/types"
import { type AcaoValue, type SistemaValue, type TipoManutencaoValue } from "@/lib/serviceUtils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { type SavedClient } from "@/lib/types"

const acaoOptions = [ { value: "instalacao", label: "Instalação" }, { value: "manutencao", label: "Manutenção" }, { value: "visita-tecnica", label: "Visita Técnica" } ] as const;
const sistemaOptions = [ { value: "cftv", label: "CFTV" }, { value: "alarme", label: "Alarme" }, { value: "controle-acesso", label: "Controle de Acesso" }, { value: "automacao-residencial", label: "Automação Residencial" } ] as const;
const tipoManutencaoOptions = [ { value: "preventiva", label: "Preventiva" }, { value: "corretiva", label: "Corretiva" } ] as const;

interface ServiceOrderGeneratorProps {
  onBackToMenu: () => void;
  onViewOSList: () => void;
  onLogout: () => void;
}

export function ServiceOrderGenerator({ onBackToMenu, onViewOSList, onLogout }: ServiceOrderGeneratorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [serviceOrderData, setServiceOrderData] = useState<ServiceOrderData>({
    cliente_nome: "", cliente_endereco: "", cliente_telefone: "", cliente_email: "", cliente_documento: "", 
    servicetype: { acao: undefined, sistemas: [], tipo_manutencao: undefined }, 
    description: "", scheduleddate: "", observations: "", 
    osnumber: `OS-${Date.now().toString().slice(-6)}`, 
    status: "agendado", created_at: new Date().toISOString(),
    relatorio_tecnico: null 
  })
  
  const [clients, setClients] = useState<SavedClient[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ nome: "", telefone: "", email: "", endereco: "", documento: "" });
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchClients = async () => { const { data, error } = await supabase.from('clientes').select('*').order('nome', { ascending: true }); if (error) { console.error("Erro ao buscar clientes:", error); } else { setClients(data as SavedClient[]); } };
  useEffect(() => { fetchClients(); }, []);

  const handleClientSelect = (clientId: string) => {
    const selected = clients.find(c => c.id === clientId);
    if (selected) {
      setServiceOrderData(prev => ({
        ...prev,
        cliente_nome: selected.nome,
        cliente_endereco: selected.endereco || "",
        cliente_telefone: selected.telefone || "",
        cliente_email: selected.email || "",
        cliente_documento: selected.documento || ""
      }));
    }
  };
  
  const handleSaveNewClient = async () => { if (!newClient.nome.trim()) { alert("O nome é obrigatório."); return; } setIsSavingClient(true); const { data: { user } } = await supabase.auth.getUser(); if (!user) { alert("Erro de autenticação."); return; } const { data: insertedClient, error } = await supabase.from('clientes').insert([{ ...newClient, user_id: user.id }]).select().single(); if (error) { alert("Falha ao cadastrar."); console.error(error); } else { alert("Cliente cadastrado!"); await fetchClients(); handleClientSelect(insertedClient.id); setIsClientModalOpen(false); setNewClient({ nome: "", telefone: "", email: "", endereco: "", documento: "" }); } setIsSavingClient(false); };
  
  // NOVA FUNÇÃO: Apenas faz a validação e abre o Rascunho (Não salva no banco)
  const handlePreviewOS = () => {
    if (!serviceOrderData.cliente_nome.trim()) {
      alert("Por favor, selecione ou cadastre um cliente.");
      return;
    }
    if (!serviceOrderData.servicetype.acao) {
      alert("Por favor, selecione uma Ação para o serviço.");
      return;
    }
    setShowPreview(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  // NOVA FUNÇÃO: É chamada pela tela de Rascunho, formata a data e salva de verdade!
  const handleSaveDefinitiveOS = async () => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Erro de autenticação. Faça login novamente.");

      let payloadData = { 
        ...serviceOrderData, 
        status: "agendado", 
        user_id: user.id 
      };

      if (payloadData.scheduleddate && payloadData.scheduleddate.length === 16) {
        payloadData.scheduleddate = `${payloadData.scheduleddate}:00-03:00`;
      }

      const { error } = await supabase.from("ordens_servico").insert([payloadData as any]);
      if (error) throw error;

      alert("Ordem de Serviço salva com sucesso!");
      
      if (typeof onViewOSList === 'function') {
         onViewOSList(); 
      }
    } catch (error: any) {
      console.error("Erro ao gerar O.S:", error);
      alert(`Falha ao salvar a Ordem de Serviço: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcaoChange = (value: AcaoValue) => { setServiceOrderData(prev => ({ ...prev, servicetype: { ...prev.servicetype, acao: value, sistemas: value === 'visita-tecnica' ? [] : prev.servicetype.sistemas, tipo_manutencao: value !== 'manutencao' ? undefined : prev.servicetype.tipo_manutencao } })); };
  const handleSistemaChange = (sistemaValue: SistemaValue) => { setServiceOrderData(prev => { const currentSistemas = prev.servicetype.sistemas || []; const newSistemas = currentSistemas.includes(sistemaValue) ? currentSistemas.filter(s => s !== sistemaValue) : [...currentSistemas, sistemaValue]; return { ...prev, servicetype: { ...prev.servicetype, sistemas: newSistemas } }; }); };
  const handleTipoManutencaoChange = (value: TipoManutencaoValue) => { setServiceOrderData(prev => ({ ...prev, servicetype: { ...prev.servicetype, tipo_manutencao: value } })); };
  const updateField = (field: keyof Omit<ServiceOrderData, 'servicetype'>, value: string) => { setServiceOrderData((prev) => ({ ...prev, [field]: value })) };

  // BLOCO ÚNICO E CORRETO DE PREVIEW
  if (showPreview) { 
    return (
      <ServiceOrderPreview 
        serviceOrderData={serviceOrderData}
        onBack={() => setShowPreview(false)} 
        onSave={handleSaveDefinitiveOS}
        isSaving={isGenerating}
      />
    ); 
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <PageHeader title="Sistema de Ordem de Serviço - WARP Sistemas Inteligentes" onBackToMenu={onBackToMenu} onLogout={onLogout} onViewList={onViewOSList} viewListText="Ver Ordens de Serviço" />
      
      <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-destructive mb-2">Gerar Nova Ordem de Serviço</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Preencha os dados abaixo</p>
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          <Card className="border-red-100">
            <CardHeader className="bg-destructive/10 py-4">
              <CardTitle className="flex items-center gap-2 text-destructive text-lg sm:text-xl">
                <FileText className="h-5 w-5" />Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 space-y-4">
              <div>
                <Label className="text-sm">Selecionar Cliente Cadastrado</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                        <span className="truncate">{serviceOrderData.cliente_nome || "Buscar cliente..."}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[90vw] sm:w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Pesquisar cliente..." />
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-y-auto">
                          {clients.map((client) => (
                            <CommandItem key={client.id} value={client.nome} onSelect={() => { handleClientSelect(client.id); setOpenCombobox(false); }}>
                              <Check className={cn("mr-2 h-4 w-4", serviceOrderData.cliente_nome === client.nome ? "opacity-100" : "opacity-0")} />
                              <span className="truncate">{client.nome}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto gap-2 border-destructive/40 text-destructive hover:bg-destructive/10">
                        <UserPlus className="h-4 w-4" /> Cadastrar Novo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:max-w-md rounded-lg p-4 sm:p-6">
                      <DialogHeader>
                        <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                        <DialogDescription>Preencha os dados do novo cliente.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div><Label>Nome / Razão Social *</Label><Input value={newClient.nome} onChange={(e) => setNewClient({...newClient, nome: e.target.value})} /></div>
                        <div><Label>CPF/CNPJ</Label><Input value={newClient.documento} onChange={(e) => setNewClient({...newClient, documento: e.target.value})} /></div>
                        <div><Label>Telefone</Label><Input value={newClient.telefone} onChange={(e) => setNewClient({...newClient, telefone: e.target.value})} /></div>
                        <div><Label>E-mail</Label><Input type="email" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} /></div>
                        <div><Label>Endereço</Label><Textarea value={newClient.endereco} onChange={(e) => setNewClient({...newClient, endereco: e.target.value})} /></div>
                      </div>
                      <DialogFooter className="flex-col sm:flex-row gap-2">
                        <DialogClose asChild><Button variant="ghost" className="w-full sm:w-auto">Cancelar</Button></DialogClose>
                        <Button onClick={handleSaveNewClient} disabled={isSavingClient} className="w-full sm:w-auto">
                          {isSavingClient ? "Salvando..." : "Salvar Cliente"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {serviceOrderData.cliente_nome && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs sm:text-sm text-slate-700 space-y-1 break-words">
                  <p><strong>Endereço:</strong> {serviceOrderData.cliente_endereco || "Não informado"}</p>
                  <p><strong>Contato:</strong> {serviceOrderData.cliente_telefone || "Não informado"} | <strong>Email:</strong> {serviceOrderData.cliente_email || "Não informado"}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-red-100">
            <CardHeader className="bg-destructive/10 py-4">
              <CardTitle className="flex items-center gap-2 text-destructive text-lg sm:text-xl">
                <Wrench className="h-5 w-5" />Detalhes do Serviço
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 space-y-5">
              <div className="space-y-5">
                <div>
                  <Label className="font-semibold text-sm sm:text-base">Ação *</Label>
                  <RadioGroup onValueChange={handleAcaoChange} value={serviceOrderData.servicetype.acao} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                    {acaoOptions.map(acao => ( 
                      <div key={acao.value} className="flex items-center space-x-2"> 
                        <RadioGroupItem value={acao.value} id={acao.value} /> 
                        <Label htmlFor={acao.value} className="text-sm sm:text-base">{acao.label}</Label> 
                      </div> 
                    ))}
                  </RadioGroup>
                </div>

                {serviceOrderData.servicetype.acao === 'manutencao' && (
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">Tipo de Manutenção *</Label>
                    <RadioGroup onValueChange={handleTipoManutencaoChange} value={serviceOrderData.servicetype.tipo_manutencao} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                      {tipoManutencaoOptions.map(tipo => ( 
                        <div key={tipo.value} className="flex items-center space-x-2"> 
                          <RadioGroupItem value={tipo.value} id={tipo.value} /> 
                          <Label htmlFor={tipo.value} className="text-sm sm:text-base">{tipo.label}</Label> 
                        </div> 
                      ))}
                    </RadioGroup>
                  </div>
                )}

                <div>
                  <Label className="font-semibold text-sm sm:text-base">Sistemas</Label>
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-2">
                    {sistemaOptions.map(sistema => ( 
                      <div key={sistema.value} className="flex items-center space-x-2"> 
                        <Checkbox id={sistema.value} checked={serviceOrderData.servicetype.sistemas?.includes(sistema.value)} onCheckedChange={() => handleSistemaChange(sistema.value)} disabled={serviceOrderData.servicetype.acao === 'visita-tecnica'} /> 
                        <Label htmlFor={sistema.value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{sistema.label}</Label> 
                      </div> 
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="scheduledDate" className="text-sm sm:text-base">Data Agendada</Label>
                <Input id="scheduledDate" type="datetime-local" className="w-full mt-1" value={serviceOrderData.scheduleddate || ''} onChange={(e) => updateField("scheduleddate", e.target.value)} />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm sm:text-base">Descrição do Serviço</Label>
                <Textarea id="description" value={serviceOrderData.description || ''} onChange={(e) => updateField("description", e.target.value)} placeholder="Descreva detalhadamente o serviço a ser executado..." rows={4} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="observations" className="text-sm sm:text-base">Observações</Label>
                <Textarea id="observations" value={serviceOrderData.observations || ''} onChange={(e) => updateField("observations", e.target.value)} placeholder="Informações adicionais, materiais necessários, etc." rows={3} className="mt-1" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Button onClick={handlePreviewOS} className="gap-2 bg-slate-800 hover:bg-slate-700 text-white shadow-md w-full sm:w-auto py-6 sm:py-2 text-base">
                <Eye className="h-5 w-5 sm:h-4 sm:w-4" />
                Pré-visualizar O.S
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}