"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Import do Input
import { ArrowLeft, UserPlus, Eye, Trash2, Search } from "lucide-react" // Import do Search
import Image from "next/image"
import { type SavedClient } from "@/lib/types"

const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/WARP-logo.png";

interface ClientListProps {
  onBack: () => void;
  onViewClient: (client: SavedClient) => void;
  onAddClient: () => void;
  onLogout: () => void;
}

export function ClientList({ onBack, onViewClient, onAddClient, onLogout }: ClientListProps) {
  const [clients, setClients] = useState<SavedClient[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // <-- NOVO ESTADO para a busca

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

  // <-- NOVA LÓGICA: Filtra a lista de clientes com base no termo de busca
  const filteredClients = clients.filter(client => 
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.documento && client.documento.includes(searchTerm)) ||
    (client.telefone && client.telefone.includes(searchTerm))
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button variant="outline" onClick={onBack} className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Menu
          </Button>
          {brandLogo && (
          <Image src={brandLogo} alt="Logo" width={2011} height={755} quality={100} className="h-32 w-auto" /> )}
          <Button onClick={onAddClient} className="gap-2 bg-destructive hover:bg-destructive/90">
            <UserPlus className="h-4 w-4" />
            Cadastrar Novo Cliente
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-destructive mb-2 text-center">Gerenciar Clientes</h1>
        <p className="text-muted-foreground text-center">Visualize, edite ou exclua os clientes cadastrados</p>
      </div>
      
      {/* --- NOVO CAMPO DE BUSCA --- */}
      <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
              type="text"
              placeholder="Buscar por nome, documento ou telefone..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {isLoading ? (
        <Card><CardContent className="text-center py-12">Carregando Clientes...</CardContent></Card>
      ) : clients.length === 0 ? ( // Verifica a lista original
        <Card><CardContent className="text-center py-12"><p>Nenhum cliente cadastrado.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {/* Mostra uma mensagem se a busca não encontrar nada */}
          {filteredClients.length === 0 && (
            <Card><CardContent className="text-center py-12 text-muted-foreground">Nenhum cliente encontrado para a busca "{searchTerm}"</CardContent></Card>
          )}
          
          {/* Mapeia a lista FILTRADA */}
          {filteredClients.map((client) => (
            <Card key={client.id} className="border-gray-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{client.nome}</h3>
                  <p className="text-sm text-muted-foreground">{client.telefone || 'Sem telefone'} | {client.email || 'Sem email'}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onViewClient(client)} className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10">
                    <Eye className="h-4 w-4" /> Visualizar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteClient(client.id)} className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/40">
                    <Trash2 className="h-4 w-4" /> Excluir
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