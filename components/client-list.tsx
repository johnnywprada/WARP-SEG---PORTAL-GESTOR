"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserPlus, Eye, Trash2 } from "lucide-react"
import Image from "next/image"

// A mesma interface que definimos no page.tsx
interface SavedClient {
  id: string;
  nome: string;
  documento: string;
  telefone: string;
  email: string;
  endereco: string;
  observacoes: string;
  dados_equipamentos: any;
  created_at: string;
}

interface ClientListProps {
  onBack: () => void;
  onViewClient: (client: SavedClient) => void;
  onAddClient: () => void;
}

export function ClientList({ onBack, onViewClient, onAddClient }: ClientListProps) {
  const [clients, setClients] = useState<SavedClient[]>([])
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar os clientes no Supabase
  const fetchClients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true }); // Ordena por nome

    if (error) {
        console.error("Erro ao buscar clientes:", error);
        alert("Falha ao carregar os clientes.");
        setClients([]);
    } else {
        setClients(data as SavedClient[]);
    }
    setIsLoading(false);
  };

  // Carrega os dados na primeira vez que o componente aparece
  useEffect(() => {
    fetchClients();
  }, []);

  const deleteClient = async (clientId: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente e todos os seus dados? Esta ação não pode ser desfeita.")) {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clientId);

      if (error) {
        alert("Falha ao excluir o cliente.");
        console.error("Erro ao excluir:", error);
      } else {
        fetchClients(); // Recarrega a lista
      }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack} className="gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Menu
          </Button>
          <Button onClick={onAddClient} className="gap-2 bg-red-600 hover:bg-red-700">
            <UserPlus className="h-4 w-4" />
            Cadastrar Novo Cliente
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">Gerenciar Clientes</h1>
        <p className="text-muted-foreground">Visualize, edite ou exclua os clientes cadastrados</p>
      </div>

      {isLoading ? (
        <Card><CardContent className="text-center py-12">Carregando Clientes...</CardContent></Card>
      ) : clients.length === 0 ? (
        <Card><CardContent className="text-center py-12"><p className="text-muted-foreground">Nenhum cliente encontrado. Clique em "Cadastrar Novo Cliente" para começar.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <Card key={client.id} className="border-gray-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{client.nome}</h3>
                  <p className="text-sm text-muted-foreground">{client.telefone || 'Sem telefone'} | {client.email || 'Sem email'}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onViewClient(client)} className="gap-2">
                    <Eye className="h-4 w-4" /> Visualizar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteClient(client.id)} className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-600 border-red-200">
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