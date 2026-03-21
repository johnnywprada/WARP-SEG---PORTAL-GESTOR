"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 
import { ArrowLeft, UserPlus, Eye, Trash2, Search, Edit } from "lucide-react" 
import Image from "next/image"
import { type SavedClient } from "@/lib/types"

const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/warp-logo.png";

// 1. Adicionado o onEditClient nas propriedades
interface ClientListProps {
  onBack: () => void;
  onViewClient: (client: SavedClient) => void;
  onEditClient: (client: SavedClient) => void; 
  onAddClient: () => void;
  onLogout: () => void;
}

export function ClientList({ onBack, onViewClient, onEditClient, onAddClient, onLogout }: ClientListProps) {
  const [clients, setClients] = useState<SavedClient[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true });

    if (error) {
        console.error("Erro ao buscar clientes:", error);
        alert("Falha ao carregar os clientes.");
        setClients([]);
    } else {
        setClients(data as SavedClient[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const deleteClient = async (clientId: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      const { error } = await supabase.from('clientes').delete().eq('id', clientId);
      if (error) {
        alert("Falha ao excluir o cliente.");
        console.error("Erro ao excluir:", error);
      } else {
        fetchClients();
      }
    }
  }

  const filteredClients = clients.filter(client => 
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.documento && client.documento.includes(searchTerm)) ||
    (client.telefone && client.telefone.includes(searchTerm))
  );

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-6xl">
      <div className="mb-6 sm:mb-8">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          {brandLogo && (
            <Image src={brandLogo} alt="Logo" width={708} height={256} quality={100} className="h-16 sm:h-24 w-auto order-1 sm:order-none" /> 
          )}
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 order-2 sm:order-none">
            <Button variant="outline" onClick={onBack} className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10 w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Menu
            </Button>
            <Button onClick={onAddClient} className="gap-2 bg-destructive hover:bg-destructive/90 w-full sm:w-auto">
              <UserPlus className="h-4 w-4" />
              Cadastrar Novo Cliente
            </Button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-destructive mb-2 text-center">Gerenciar Clientes</h1>
        <p className="text-sm sm:text-base text-muted-foreground text-center">Visualize, edite ou exclua os clientes cadastrados</p>
      </div>
      
      <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
              type="text"
              placeholder="Buscar por nome, documento ou telefone..."
              className="pl-10 h-12 sm:h-10 text-base sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {isLoading ? (
        <Card><CardContent className="text-center py-12 text-blue-600">Carregando Clientes do Banco de Dados...</CardContent></Card>
      ) : clients.length === 0 ? (
        <Card><CardContent className="text-center py-12"><p className="text-muted-foreground text-lg">Nenhum cliente cadastrado.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          
          {filteredClients.length === 0 && (
            <Card><CardContent className="text-center py-12 text-muted-foreground">Nenhum cliente encontrado para a busca "{searchTerm}"</CardContent></Card>
          )}
          
          {filteredClients.map((client) => (
            <Card key={client.id} className="border-red-100 overflow-hidden">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                <div className="w-full sm:w-auto break-words">
                  <h3 className="text-lg font-semibold text-destructive">{client.nome}</h3>
                  <div className="bg-slate-50 p-2 rounded-md mt-2 sm:mt-1 border border-slate-100">
                    <p className="text-sm text-slate-700">{client.telefone || 'Sem telefone'} | {client.email || 'Sem email'}</p>
                  </div>
                </div>
                
                {/* 2. BOTÕES DE AÇÃO: 3 botões dividindo o espaço no mobile com texto oculto */}
                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 sm:border-none">
                  
                  <Button variant="outline" size="sm" onClick={() => onViewClient(client)} className="flex-1 sm:flex-none gap-2 text-destructive border-destructive/40 hover:bg-destructive/10 h-10">
                    <Eye className="h-4 w-4" /> <span className="hidden sm:inline">Ver</span>
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => onEditClient(client)} className="flex-1 sm:flex-none gap-2 text-destructive border-destructive/40 hover:bg-destructive/10 h-10">
                    <Edit className="h-4 w-4" /> <span className="hidden sm:inline">Editar</span>
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => deleteClient(client.id)} className="flex-1 sm:flex-none gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/40 h-10">
                    <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Excluir</span>
                  </Button>

                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}