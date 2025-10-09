"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, HardDrive, Edit, Eye, EyeOff } from "lucide-react"
// --- CORREÇÃO: Importamos o tipo centralizado ---
import { type SavedClient } from "@/lib/types"

interface ClientDetailProps {
  client: SavedClient;
  onBack: () => void;
  onEdit: () => void;
}

// --- REMOVIDO: A interface SavedClient local foi apagada daqui ---

// Componente auxiliar para exibir um campo de dado
const DataField = ({ label, value }: { label: string, value: string | undefined | null }) => {
    if (!value) return null; // Não renderiza se o valor for vazio
    return (
        <div>
            <p className="text-xs font-semibold text-gray-500">{label}</p>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{value}</p>
        </div>
    );
};

// Componente auxiliar para exibir campos de senha com botão de "mostrar/ocultar"
const PasswordField = ({ label, value }: { label: string, value: string | undefined | null }) => {
    const [isVisible, setIsVisible] = useState(false);
    if (!value) return null;
    return (
        <div>
            <p className="text-xs font-semibold text-gray-500">{label}</p>
            <div className="flex items-center gap-2">
                <p className="text-sm text-slate-800">{isVisible ? value : '••••••••'}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsVisible(!isVisible)}>
                    {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}

export function ClientDetail({ client, onBack, onEdit }: ClientDetailProps) {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-red-600">{client.nome}</h1>
            <p className="text-muted-foreground">Ficha completa do cliente</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={onBack} className="gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Voltar para a Lista
            </Button>
            <Button onClick={onEdit} className="gap-2 bg-red-600 hover:bg-red-700">
                <Edit className="h-4 w-4" />
                Editar Cliente
            </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-red-100">
          <CardHeader className="bg-red-50"><CardTitle className="flex items-center gap-2 text-red-700"><User className="h-5 w-5" />Dados Cadastrais</CardTitle></CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <DataField label="Nome / Razão Social" value={client.nome} />
            <DataField label="CPF / CNPJ" value={client.documento} />
            <DataField label="Telefone" value={client.telefone} />
            <DataField label="E-mail" value={client.email} />
            <div className="md:col-span-2">
                <DataField label="Endereço" value={client.endereco} />
            </div>
            <div className="md:col-span-2">
                <DataField label="Observações Gerais do Cliente" value={client.observacoes} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
            <h2 className="text-xl font-bold text-red-700 flex items-center gap-2 mt-8"><HardDrive className="h-5 w-5" />Equipamentos e Dados Técnicos</h2>
            {(client.dados_equipamentos || []).length === 0 && (
              <Card><CardContent className="text-center py-8 text-muted-foreground">Nenhum equipamento cadastrado para este cliente.</CardContent></Card>
            )}
            {(client.dados_equipamentos || []).map((equip: any) => (
                <Card key={equip.id} className="border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-base text-slate-800">{equip.tipo} - {equip.modelo}</CardTitle>
                        <p className="text-xs text-muted-foreground">Local: {equip.local}</p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <DataField label="MAC / Nº de Série" value={equip.dados_tecnicos.numero_serie} />
                        <DataField label="Acesso Remoto (IP/DDNS)" value={equip.dados_tecnicos.acesso_remoto} />
                        <DataField label="Usuário Admin" value={equip.dados_tecnicos.usuario_admin} />
                        <PasswordField label="Senha Admin" value={equip.dados_tecnicos.senha_admin} />
                        <PasswordField label="Senha de Instalador" value={equip.dados_tecnicos.senha_instalador} />
                        <PasswordField label="Senha Master" value={equip.dados_tecnicos.senha_master} />
                        <PasswordField label="Senha de Acesso Remoto" value={equip.dados_tecnicos.senha_acesso_remoto} />
                        <div className="md:col-span-2"><DataField label="Zoneamento" value={equip.dados_tecnicos.zonas} /></div>
                        <div className="md:col-span-2"><DataField label="Observações do Equipamento" value={equip.dados_tecnicos.observacoes_equipamento} /></div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  )
}