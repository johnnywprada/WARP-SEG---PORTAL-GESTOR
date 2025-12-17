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


// --- LISTA PRÉ-DEFINIDA DE EQUIPAMENTOS ---
// const equipmentTypes = [
//   { value: "dvr", label: "DVR (Gravador)" }, { value: "nvr", label: "NVR (Gravador de Rede)" }, { value: "camera_bullet", label: "Câmera Bullet" }, { value: "camera_dome", label: "Câmera Dome" }, { value: "camera_ip", label: "Câmera IP" }, { value: "central_alarme", label: "Central de Alarme" }, { value: "sensor_presenca", label: "Sensor de Presença (IVP)" }, { value: "sensor_magnetico", label: "Sensor Magnético (Abertura)" }, { value: "sirene", label: "Sirene" }, { value: "controladora_acesso", label: "Controladora de Acesso" }, { value: "leitor_biometrico", label: "Leitor Biométrico" }, { value: "leitor_cartao", label: "Leitor de Cartão (Tag)" }, { value: "fechadura_eletromagnetica", label: "Fechadura Eletromagnética" }, { value: "fechadura_eletrica", label: "Fechadura Elétrica (Eletroímã)" }, { value: "botoeira", label: "Botoeira (Botão de Saída)" }, { value: "cerca_eletrica", label: "Central de Cerca Elétrica" }, { value: "video_porteiro", label: "Vídeo Porteiro" }, { value: "nobreak", label: "Nobreak" }, { value: "fonte_alimentacao", label: "Fonte de Alimentação" }, { value: "outros", label: "Outros" },
// ];

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
    <div className="min-h-screen bg-background">
      <PageHeader
        title={clientToEdit ? "Editar Cliente" : "Sistema de cadastro de clientes - WARP Sistemas Inteligentes"}
        onBackToMenu={onBackToMenu}
        onViewList={onViewList}
        viewListText="Ver Clientes"
        onLogout={onLogout}
      />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6 mt-8">
          <Card className="border-blue-200">
            <CardHeader className="bg-destructive/10"><CardTitle className="flex items-center gap-2 text-destructive"><User className="h-5 w-5" />Dados Cadastrais</CardTitle></CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="nome">Nome / Razão Social *</Label><Input id="nome" value={client.nome} onChange={(e) => handleFieldChange("nome", e.target.value)} /></div>
                <div><Label htmlFor="documento">CPF / CNPJ</Label><Input id="documento" value={client.documento} onChange={(e) => handleFieldChange("documento", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="telefone">Telefone</Label><Input id="telefone" value={client.telefone} onChange={(e) => handleFieldChange("telefone", e.target.value)} /></div>
                <div><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={client.email} onChange={(e) => handleFieldChange("email", e.target.value)} /></div>
              </div>
              <div><Label htmlFor="endereco">Endereço</Label><Textarea id="endereco" value={client.endereco} onChange={(e) => handleFieldChange("endereco", e.target.value)} rows={2} /></div>
              <div><Label htmlFor="observacoes">Observações Gerais do Cliente</Label><Textarea id="observacoes" value={client.observacoes || ''} onChange={(e) => handleFieldChange("observacoes", e.target.value)} rows={3} placeholder="Informações adicionais sobre o cliente..." /></div>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardHeader className="bg-destructive/10"><CardTitle className="flex items-center gap-2 text-destructive"><HardDrive className="h-5 w-5" />Equipamentos e Dados Técnicos</CardTitle></CardHeader>
            <CardContent className="pt-6 space-y-4">
              {(client.dados_equipamentos || []).length === 0 && (<p className="text-sm text-center text-muted-foreground">Nenhum equipamento adicionado.</p>)}
              {(client.dados_equipamentos || []).map((equip) => (
                <div key={equip.id} className="p-4 border bg-slate-50 rounded-lg space-y-4 relative">
                  <Button variant="ghost" size="icon" onClick={() => removeEquipment(equip.id)} className="absolute top-1 right-1 h-7 w-7 text-red-500 hover:bg-destructive/20"><Trash2 className="h-4 w-4" /></Button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Tipo de Equipamento</Label>
                      <Select value={equip.tipo} onValueChange={(value) => handleEquipmentChange(equip.id, 'tipo', value)}>
                        <SelectTrigger><SelectValue placeholder="Selecione um tipo" /></SelectTrigger>
                        <SelectContent>{equipmentTypes.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Marca / Modelo</Label><Input value={equip.modelo} onChange={(e) => handleEquipmentChange(equip.id, 'modelo', e.target.value)} placeholder="Ex: Intelbras XYZ"/></div>
                    <div><Label>Local de Instalação</Label><Input value={equip.local} onChange={(e) => handleEquipmentChange(equip.id, 'local', e.target.value)} placeholder="Ex: Entrada, Sala, Garagem"/></div>
                  </div>
                  <div className="space-y-3 pt-3 border-t">
                    <Label className="text-xs font-semibold text-gray-500">DADOS ESPECÍFICOS</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label htmlFor={`serie-${equip.id}`}>MAC / Nº de Série</Label><Input id={`serie-${equip.id}`} value={equip.dados_tecnicos.numero_serie || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'numero_serie', e.target.value)} /></div>
                      {(equip.tipo.includes('dvr') || equip.tipo.includes('nvr') || equip.tipo.includes('camera_ip')) && (<>
                        <div><Label htmlFor={`remoto-${equip.id}`}>Acesso Remoto (IP/DDNS)</Label><Input id={`remoto-${equip.id}`} value={equip.dados_tecnicos.acesso_remoto || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'acesso_remoto', e.target.value)} /></div>
                        <div><Label htmlFor={`user-${equip.id}`}>Usuário Admin</Label><Input id={`user-${equip.id}`} value={equip.dados_tecnicos.usuario_admin || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'usuario_admin', e.target.value)} /></div>
                        <div><Label htmlFor={`pass-${equip.id}`}>Senha Admin</Label><Input id={`pass-${equip.id}`} value={equip.dados_tecnicos.senha_admin || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'senha_admin', e.target.value)} /></div>
                      </>)}
                      {equip.tipo.includes('central_alarme') && (<>
                        <div><Label htmlFor={`install-${equip.id}`}>Senha de Instalador</Label><Input id={`install-${equip.id}`} value={equip.dados_tecnicos.senha_instalador || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'senha_instalador', e.target.value)} /></div>
                        <div><Label htmlFor={`master-${equip.id}`}>Senha Master</Label><Input id={`master-${equip.id}`} value={equip.dados_tecnicos.senha_master || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'senha_master', e.target.value)} /></div>
                        <div><Label htmlFor={`remotepass-${equip.id}`}>Senha de Acesso Remoto</Label><Input id={`remotepass-${equip.id}`} value={equip.dados_tecnicos.senha_acesso_remoto || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'senha_acesso_remoto', e.target.value)} /></div>
                        <div className="md:col-span-2"><Label htmlFor={`zonas-${equip.id}`}>Zoneamento</Label><Textarea id={`zonas-${equip.id}`} value={equip.dados_tecnicos.zonas || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'zonas', e.target.value)} placeholder="Zona 1: Sensor magnético porta..." rows={3}/></div>
                      </>)}
                    </div>
                    <div className="pt-3">
                      <Label htmlFor={`obs-equip-${equip.id}`}>Observações do Equipamento</Label>
                      <Textarea id={`obs-equip-${equip.id}`} value={equip.dados_tecnicos.observacoes_equipamento || ''} onChange={(e) => handleDadosTecnicosChange(equip.id, 'observacoes_equipamento', e.target.value)} rows={2} placeholder="Detalhes específicos sobre este equipamento..."/>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addEquipment} className="w-full gap-2 border-dashed"><PlusCircle className="h-4 w-4" />Adicionar Equipamento</Button>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSaveClient} disabled={isLoading} className="gap-2 bg-destructive hover:bg-destructive/90">
              <Save className="h-4 w-4" />
              {isLoading ? "Salvando..." : (clientToEdit ? "Salvar Alterações" : "Salvar Cliente")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}