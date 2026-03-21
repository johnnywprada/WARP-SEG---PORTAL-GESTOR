"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, HardDrive, Edit, Eye, EyeOff } from "lucide-react"
import { type SavedClient } from "@/lib/types"
import { getEquipmentLabel } from "@/lib/constants"

interface ClientDetailProps {
  client: SavedClient;
  onBack: () => void;
  onEdit: () => void;
}

// Componente auxiliar para exibir um campo de dado com quebra de linha segura (break-words)
const DataField = ({ label, value }: { label: string, value: string | undefined | null }) => {
    if (!value) return null; 
    return (
        <div className="w-full">
            <p className="text-xs font-semibold text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{value}</p>
        </div>
    );
};

// Componente auxiliar para exibir campos de senha com botão de "mostrar/ocultar"
const PasswordField = ({ label, value }: { label: string, value: string | undefined | null }) => {
    const [isVisible, setIsVisible] = useState(false);
    if (!value) return null;
    return (
        <div className="w-full">
            <p className="text-xs font-semibold text-gray-500 mb-0.5">{label}</p>
            <div className="flex items-center gap-2">
                <p className="text-sm text-slate-800 break-all">{isVisible ? value : '••••••••'}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setIsVisible(!isVisible)}>
                    {isVisible ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                </Button>
            </div>
        </div>
    )
}

export function ClientDetail({ client, onBack, onEdit }: ClientDetailProps) {
  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
      
      {/* CABEÇALHO RESPONSIVO: Empilha no mobile, lado a lado no desktop */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-destructive break-words">{client.nome}</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Ficha completa do cliente</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={onBack} className="w-full sm:w-auto gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Voltar para a Lista
            </Button>
            <Button onClick={onEdit} className="w-full sm:w-auto gap-2 bg-destructive hover:bg-destructive/90 shadow-sm">
                <Edit className="h-4 w-4" />
                Editar Cliente
            </Button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        
        {/* DADOS CADASTRAIS */}
        <Card className="border-red-100">
          <CardHeader className="bg-destructive/10 py-4">
            <CardTitle className="flex items-center gap-2 text-destructive text-lg sm:text-xl">
              <User className="h-5 w-5" />Dados Cadastrais
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <DataField label="Nome / Razão Social" value={client.nome} />
            <DataField label="CPF / CNPJ" value={client.documento} />
            <DataField label="Telefone" value={client.telefone} />
            <DataField label="E-mail" value={client.email} />
            <div className="sm:col-span-2 border-t border-slate-100 pt-3">
                <DataField label="Endereço" value={client.endereco} />
            </div>
            <div className="sm:col-span-2 border-t border-slate-100 pt-3">
                <DataField label="Observações Gerais do Cliente" value={client.observacoes} />
            </div>
          </CardContent>
        </Card>

        {/* EQUIPAMENTOS E DADOS TÉCNICOS */}
        <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-destructive flex items-center gap-2 mt-8 mb-4">
              <HardDrive className="h-5 w-5" />Equipamentos e Dados Técnicos
            </h2>
            
            {(client.dados_equipamentos || []).length === 0 && (
              <Card className="border-slate-200">
                <CardContent className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum equipamento cadastrado para este cliente.
                </CardContent>
              </Card>
            )}
            
            {(client.dados_equipamentos || []).map((equip: any) => (
                <Card key={equip.id} className="border-red-100 bg-slate-50/30">
                    <CardHeader className="pb-3 border-b border-red-50">
                        <CardTitle className="text-base sm:text-lg text-destructive break-words">
                          {getEquipmentLabel(equip.tipo)} - {equip.modelo}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 break-words"><span className="font-semibold text-slate-500">Local:</span> {equip.local}</p>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                        <DataField label="MAC / Nº de Série" value={equip.dados_tecnicos.numero_serie} />
                        <DataField label="Acesso Remoto (IP/DDNS)" value={equip.dados_tecnicos.acesso_remoto} />
                        <DataField label="Usuário Admin" value={equip.dados_tecnicos.usuario_admin} />
                        <PasswordField label="Senha Admin" value={equip.dados_tecnicos.senha_admin} />
                        <PasswordField label="Senha de Instalador" value={equip.dados_tecnicos.senha_instalador} />
                        <PasswordField label="Senha Master" value={equip.dados_tecnicos.senha_master} />
                        <PasswordField label="Senha de Acesso Remoto" value={equip.dados_tecnicos.senha_acesso_remoto} />
                        
                        {(equip.dados_tecnicos.zonas || equip.dados_tecnicos.observacoes_equipamento) && (
                          <div className="sm:col-span-2 border-t border-slate-200 pt-3 grid grid-cols-1 gap-4 mt-2">
                            <DataField label="Zoneamento" value={equip.dados_tecnicos.zonas} />
                            <DataField label="Observações do Equipamento" value={equip.dados_tecnicos.observacoes_equipamento} />
                          </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  )
}