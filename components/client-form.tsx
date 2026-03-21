"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, HardDrive, PlusCircle, Trash2, Save } from "lucide-react"
import { PageHeader } from "./PageHeader"
import { type SavedClient } from "@/lib/types"
import { equipmentTypes } from "@/lib/constants"

// --- TIPOS E INTERFACES ---
interface DadosTecnicos { numero_serie?: string; usuario_admin?: string; senha_admin?: string; acesso_remoto?: string; senha_instalador?: string; senha_master?: string; zonas?: string; observacoes_equipamento?: string; senha_acesso_remoto?: string; }
interface EquipmentData { id: number; tipo: string; modelo: string; local: string; dados_tecnicos: DadosTecnicos; }
interface ClientFormData { nome: string; documento: string; telefone: string; email: string; endereco: string; observacoes: string; dados_equipamentos: EquipmentData[]; }

interface ClientFormProps {
  onBack: () => void;
  clientToEdit?: SavedClient | null;
  onBackToMenu: () => void;
  onViewList: () => void;
  onLogout: () => void;
}

export function ClientForm({ onBack, clientToEdit, onBackToMenu, onViewList, onLogout }: ClientFormProps) {
  const [client, setClient] = useState<ClientFormData>({ nome: "", documento: "", telefone: "", email: "", endereco: "", observacoes: "", dados_equipamentos: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (clientToEdit) {
      setClient({
        nome: clientToEdit.nome || "",
        documento: clientToEdit.documento || "",
        telefone: clientToEdit.telefone || "",
        email: clientToEdit.email || "",
        endereco: clientToEdit.endereco || "",
        observacoes: clientToEdit.observacoes || "",
        dados_equipamentos: (clientToEdit.dados_equipamentos as EquipmentData[]) || [],
      });
    }
  }, [clientToEdit]);

  const handleFieldChange = (field: keyof Omit<ClientFormData, 'dados_equipamentos'>, value: string) => { setClient(prev => ({ ...prev, [field]: value })); };
  const addEquipment = () => { setClient(prev => ({ ...prev, dados_equipamentos: [...(prev.dados_equipamentos || []), { id: Date.now(), tipo: "", modelo: "", local: "", dados_tecnicos: {} }] })); };
  const removeEquipment = (id: number) => { setClient(prev => ({ ...prev, dados_equipamentos: (prev.dados_equipamentos || []).filter(equip => equip.id !== id) })); };
  const handleEquipmentChange = (id: number, field: keyof Omit<EquipmentData, 'id' | 'dados_tecnicos'>, value: string) => { setClient(prev => ({ ...prev, dados_equipamentos: (prev.dados_equipamentos || []).map(equip => equip.id === id ? { ...equip, [field]: value } : equip) })); };
  const handleDadosTecnicosChange = (id: number, field: keyof DadosTecnicos, value: string) => { setClient(prev => ({ ...prev, dados_equipamentos: (prev.dados_equipamentos || []).map(equip => equip.id === id ? { ...equip, dados_tecnicos: { ...equip.dados_tecnicos, [field]: value } } : equip) })); };
  
  const handleSaveClient = async () => {
    if (!client.nome.trim()) { alert("O nome do cliente é obrigatório."); return; }
    setIsLoading(true);
    if (clientToEdit) {
      const { error } = await supabase.from('clientes').update(client).eq('id', clientToEdit.id);
      if (error) { alert("Falha ao atualizar cliente."); console.error("Erro no Supabase:", error); } 
      else { alert("Cliente atualizado com sucesso!"); onViewList(); }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Erro de autenticação."); setIsLoading(false); return; }
      const { error } = await supabase.from('clientes').insert([{ ...client, user_id: user.id }]);
      if (error) { alert("Falha ao cadastrar cliente."); console.error("Erro no Supabase:", error); } 
      else { alert("Cliente cadastrado com sucesso!"); onViewList(); }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <PageHeader
        title={clientToEdit ? "Editar Cliente" : "Sistema de Cadastro - WARP"}
        onBackToMenu={onBackToMenu}
        onViewList={onViewList}
        viewListText="Ver Clientes"
        onLogout={onLogout}
      />
      
      {/* Container com respiro mobile ajustado */}
      <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
        
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-destructive mb-2">{clientToEdit ? "Editar Cliente" : "Cadastrar Novo Cliente"}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Preencha os dados e adicione os equipamentos do local</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card className="border-red-100">
            <CardHeader className="bg-destructive/10 py-4">
              <CardTitle className="flex items-center gap-2 text-destructive text-lg sm:text-xl">
                <User className="h-5 w-5" />Dados Cadastrais
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="nome" className="text-sm">Nome / Razão Social *</Label><Input id="nome" className="mt-1" value={client.nome} onChange={(e) => handleFieldChange("nome", e.target.value)} /></div>
                <div><Label htmlFor="documento" className="text-sm">CPF / CNPJ</Label><Input id="documento" className="mt-1" value={client.documento} onChange={(e) => handleFieldChange("documento", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="telefone" className="text-sm">Telefone</Label><Input id="telefone" className="mt-1" value={client.telefone} onChange={(e) => handleFieldChange("telefone", e.target.value)} /></div>
                <div><Label htmlFor="email" className="text-sm">E-mail</Label><Input id="email" className="mt-1" type="email" value={client.email} onChange={(e) => handleFieldChange("email", e.target.value)} /></div>
              </div>
              <div><Label htmlFor="endereco" className="text-sm">Endereço</Label><Textarea id="endereco" className="mt-1" value={client.endereco} onChange={(e) => handleFieldChange("endereco", e.target.value)} rows={2} /></div>
              <div><Label htmlFor="observacoes" className="text-sm">Observações Gerais do Cliente</Label><Textarea id="observacoes" className="mt-1" value={client.observacoes || ''} onChange={(e) => handleFieldChange("observacoes", e.target.value)} rows={3} placeholder="Informações adicionais sobre o cliente..." /></div>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardHeader className="bg-destructive/10 py-4">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-destructive gap-3">
                <span className="flex items-center gap-2 text-lg sm:text-xl"><HardDrive className="h-5 w-5" />Equipamentos</span>
                <Button onClick={addEquipment} size="sm" className="gap-2 bg-destructive hover:bg-destructive/90 w-full sm:w-auto">
                  <PlusCircle className="h-4 w-4" />Adicionar Equipamento
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 space-y-4">
              {(client.dados_equipamentos || []).length === 0 && (<p className="text-sm text-center text-muted-foreground py-4">Nenhum equipamento adicionado ainda.</p>)}
              
              {(client.dados_equipamentos || []).map((equip, index) => (
                <div key={equip.id} className="p-3 sm:p-4 border border-red-100 bg-slate-50/50 rounded-lg space-y-4 relative">
                  
                  <div className="flex items-center justify-between border-b border-red-100 pb-2">
                    <span className="font-medium text-destructive text-sm sm:text-base">Equipamento {index + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeEquipment(equip.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-sm">Tipo de Equipamento</Label>
                      <Select value={equip.tipo} onValueChange={(value) => handleEquipmentChange(equip.id, 'tipo', value)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione um tipo" /></SelectTrigger>
                        <SelectContent>{equipmentTypes.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-sm">Marca / Modelo</Label><Input className="mt-1" value={equip.modelo} onChange={(e) => handleEquipmentChange(equip.id, 'modelo', e.target.value)} placeholder="Ex: Intelbras XYZ"/></div>
                    <div className="sm:col-span-2 md:col-span-1"><Label className="text-sm">Local de Instalação</Label><Input className="mt-1" value={equip.local} onChange={(e) => handleEquipmentChange(equip.id, 'local', e.target.value)} placeholder="Ex: Entrada principal"/></div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Dados Específicos e Senhas</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div><Label htmlFor={`serie-${equip.id}`} className="text-sm">MAC / Nº de Série</Label><Input className="mt-1" id={`serie-${equip.id}`} value={equip.dados_tecnicos.numero_serie || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'numero_serie', e.target.value)} /></div>
                      
                      {(equip.tipo.includes('dvr') || equip.tipo.includes('nvr') || equip.tipo.includes('camera_ip')) && (<>
                        <div><Label htmlFor={`remoto-${equip.id}`} className="text-sm">Acesso Remoto (IP/DDNS)</Label><Input className="mt-1" id={`remoto-${equip.id}`} value={equip.dados_tecnicos.acesso_remoto || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'acesso_remoto', e.target.value)} /></div>
                        <div><Label htmlFor={`user-${equip.id}`} className="text-sm">Usuário Admin</Label><Input className="mt-1" id={`user-${equip.id}`} value={equip.dados_tecnicos.usuario_admin || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'usuario_admin', e.target.value)} /></div>
                        <div><Label htmlFor={`pass-${equip.id}`} className="text-sm">Senha Admin</Label><Input className="mt-1" id={`pass-${equip.id}`} value={equip.dados_tecnicos.senha_admin || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'senha_admin', e.target.value)} /></div>
                      </>)}
                      
                      {equip.tipo.includes('central_alarme') && (<>
                        <div><Label htmlFor={`install-${equip.id}`} className="text-sm">Senha de Instalador</Label><Input className="mt-1" id={`install-${equip.id}`} value={equip.dados_tecnicos.senha_instalador || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'senha_instalador', e.target.value)} /></div>
                        <div><Label htmlFor={`master-${equip.id}`} className="text-sm">Senha Master</Label><Input className="mt-1" id={`master-${equip.id}`} value={equip.dados_tecnicos.senha_master || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'senha_master', e.target.value)} /></div>
                        <div><Label htmlFor={`remotepass-${equip.id}`} className="text-sm">Senha de Acesso Remoto</Label><Input className="mt-1" id={`remotepass-${equip.id}`} value={equip.dados_tecnicos.senha_acesso_remoto || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'senha_acesso_remoto', e.target.value)} /></div>
                        <div className="md:col-span-2"><Label htmlFor={`zonas-${equip.id}`} className="text-sm">Zoneamento</Label><Textarea className="mt-1" id={`zonas-${equip.id}`} value={equip.dados_tecnicos.zonas || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'zonas', e.target.value)} placeholder="Zona 1: Sensor magnético porta..." rows={3}/></div>
                      </>)}
                    </div>
                    <div className="pt-2">
                      <Label htmlFor={`obs-equip-${equip.id}`} className="text-sm">Observações Adicionais</Label>
                      <Textarea className="mt-1" id={`obs-equip-${equip.id}`} value={equip.dados_tecnicos.observacoes_equipamento || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'observacoes_equipamento', e.target.value)} rows={2} placeholder="Detalhes da porta HTTP, porta de serviço, estado físico..."/>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" onClick={addEquipment} className="w-full gap-2 border-dashed border-destructive/40 text-destructive hover:bg-destructive/5 h-12 mt-2">
                <PlusCircle className="h-5 w-5" />Adicionar Novo Equipamento
              </Button>
            </CardContent>
          </Card>

          {/* BOTÃO SALVAR GIGANTE NO MOBILE */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveClient} disabled={isLoading} className="gap-2 bg-destructive hover:bg-destructive/90 w-full sm:w-auto py-6 sm:py-2 text-base shadow-md">
              <Save className="h-5 w-5 sm:h-4 sm:w-4" />
              {isLoading ? "Salvando..." : (clientToEdit ? "Salvar Alterações" : "Cadastrar Cliente")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}