"use client"

// ADICIONADO: Import do Supabase
import { supabase } from '@/lib/supabase/client'; 

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Eye, Trash2 } from "lucide-react"
import Image from "next/image"

// NOTE: A interface agora reflete as colunas planas que o Supabase retorna
interface SavedServiceOrder {
  id: string // UUID
  osnumber: string // MINÚSCULO
  // Dados do cliente
  cliente_nome: string 
  cliente_endereco: string
  cliente_telefone: string
  cliente_email: string
  cliente_documento: string
  
  // Nomes de coluna minúsculos no banco
  servicetype: string
  description: string
  scheduleddate: string // MINÚSCULO
  observations: string
  status: "agendado" | "em-andamento" | "concluido" | "cancelado"
  created_at: string
  user_id: string
}

interface ServiceOrderListProps {
  onBack: () => void
  onViewServiceOrder: (serviceOrder: SavedServiceOrder) => void // CORREÇÃO: RECEBE O OBJETO INTEIRO
}

const statusLabels = {
  agendado: "Agendado",
  "em-andamento": "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
}

const statusColors = {
  agendado: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "em-andamento": "bg-blue-100 text-blue-800 border-blue-200",
  concluido: "bg-green-100 text-green-800 border-green-200",
  cancelado: "bg-red-100 text-red-800 border-red-200",
}

const serviceTypeLabels: { [key: string]: string } = {
  "visita-tecnica": "Visita Técnica",
  "instalacao-cftv": "Instalação de CFTV",
  "instalacao-alarme": "Instalação de Alarme",
  "instalacao-controle-acesso": "Instalação de Controle de Acesso",
  "instalacao-automacao": "Instalação de Automação Residencial",
  "manutencao-preventiva": "Manutenção Preventiva",
  "manutencao-corretiva": "Manutenção Corretiva",
}

export function ServiceOrderList({ onBack, onViewServiceOrder }: ServiceOrderListProps) {
  // Ajustamos o tipo para 'any[]' para lidar com a tipagem da lista do Supabase
  const [serviceOrders, setServiceOrders] = useState<any[]>([]) 
  const [isLoading, setIsLoading] = useState(true);

  // FUNÇÃO PARA LER OS DADOS DO SUPABASE
  const fetchServiceOrders = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        setServiceOrders([]);
        setIsLoading(false);
        return;
    }
    
    // O select busca todas as colunas que salvamos, e o RLS garante que o usuário só veja as suas.
    const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .order('created_at', { ascending: false }); // Ordena pela data de criação

    if (error) {
        console.error("Erro ao buscar dados:", error);
        alert("Falha ao carregar as Ordens de Serviço.");
        setServiceOrders([]);
    } else {
        setServiceOrders(data); 
    }
    setIsLoading(false);
  };

  // Carrega os dados na primeira vez (Substitui a leitura do localStorage)
  useEffect(() => {
    fetchServiceOrders();
  }, []); 

  // FUNÇÃO PARA ATUALIZAR O STATUS (Substitui o update do localStorage)
  const updateServiceOrderStatus = async (orderId: string, newStatus: SavedServiceOrder["status"]) => {
    // 1. Atualiza a coluna 'status' no Supabase para o ID da Ordem
    const { error } = await supabase
        .from('ordens_servico')
        .update({ status: newStatus })
        .eq('id', orderId); // O '.eq' garante que apenas a OS correta seja atualizada

    if (error) {
        console.error("Erro ao atualizar status:", error);
        alert("Falha ao atualizar o status no banco.");
    } else {
        fetchServiceOrders(); // Recarrega a lista para mostrar a mudança
    }
  }

  // FUNÇÃO PARA EXCLUIR OS (Substitui o delete do localStorage)
  const deleteServiceOrder = async (orderId: string) => {
    if (confirm("Tem certeza que deseja excluir esta ordem de serviço?")) {
        // 1. Executa o comando DELETE no Supabase
        const { error } = await supabase
            .from('ordens_servico')
            .delete()
            .eq('id', orderId);

        if (error) {
            console.error("Erro ao excluir:", error);
            // Este erro é quase sempre causado por RLS (permissão)
            alert("Falha ao excluir a Ordem de Serviço. Verifique as permissões de exclusão no Supabase.");
        } else {
            fetchServiceOrders(); // Recarrega a lista para mostrar a mudança
        }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-6">
            <Image
              src="/images/warp-logo.png"
              alt="WARP Segurança Eletrônica"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">Controle de Ordens de Serviço</h1>
        <p className="text-muted-foreground">Visualize e gerencie todas as ordens de serviço geradas</p>
      </div>

      {isLoading ? (
          <Card><CardContent className="text-center py-12 text-blue-600">Carregando Ordens de Serviço do Banco de Dados...</CardContent></Card>
      ) : serviceOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground text-lg">Nenhuma ordem de serviço encontrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crie sua primeira OS para começar a usar o sistema de controle
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {serviceOrders.map((order) => (
            <Card key={order.id} className="border-red-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {/* Exibe o osnumber ou fallback de indisponível */}
                    <h3 className="text-lg font-semibold text-red-600">{order.osnumber || 'Nº Indisponível'}</h3> 
                    <p className="text-sm text-muted-foreground">
                      {/* Formata created_at com fallback seguro */}
                      Criado em {(order.created_at && new Date(order.created_at).toLocaleDateString("pt-BR")) || 'Data Indisponível'}
                    </p>
                  </div>
                  <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                    {statusLabels[order.status as keyof typeof statusLabels]}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cliente</p>
                    {/* Lendo diretamente da coluna plana: cliente_nome */}
                    <p className="text-sm">{order.cliente_nome || 'N/A'}</p> 
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tipo de Serviço</p>
                    {/* Corrigido acesso com tipagem para 'servicetype' minúsculo */}
                    <p className="text-sm"> {serviceTypeLabels[order.servicetype as keyof typeof serviceTypeLabels] || order.servicetype} </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Agendado para</p>
                    <p className="text-sm">
                      {/* CORREÇÃO FINAL: Tratamento robusto para data agendada */}
                      {order.scheduleddate && order.scheduleddate.length > 5
                        ? new Date(order.scheduleddate.replace('T', ' ')).toLocaleString("pt-BR") 
                        : "Não agendado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <Select
                      value={order.status}
                      onValueChange={(value: SavedServiceOrder["status"]) => updateServiceOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="em-andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewServiceOrder(order as SavedServiceOrder)} // CORREÇÃO: PASSA OBJETO INTEIRO
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteServiceOrder(order.id)}
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}