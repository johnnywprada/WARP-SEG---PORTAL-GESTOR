"use client"

import { supabase } from '@/lib/supabase/client';
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Eye, Trash2 } from "lucide-react"
import Image from "next/image"
// ALTERAÇÃO 1: Importamos nossa função e o tipo do arquivo central.
import { formatStructuredService, type StructuredServiceData } from '@/lib/serviceUtils';

// ALTERAÇÃO 2: A interface agora usa o tipo StructuredServiceData.
interface SavedServiceOrder {
  id: string
  osnumber: string
  cliente_nome: string 
  cliente_endereco: string
  cliente_telefone: string
  cliente_email: string
  cliente_documento: string
  servicetype: StructuredServiceData // <-- MUDOU DE 'string' PARA O NOVO TIPO
  description: string
  scheduleddate: string
  observations: string
  status: "agendado" | "em-andamento" | "concluido" | "cancelado"
  created_at: string
  user_id: string
}

interface ServiceOrderListProps {
  onBack: () => void
  onViewServiceOrder: (serviceOrder: SavedServiceOrder) => void
}

const statusLabels = { agendado: "Agendado", "em-andamento": "Em Andamento", concluido: "Concluído", cancelado: "Cancelado" };
const statusColors = { agendado: "bg-yellow-100 text-yellow-800 border-yellow-200", "em-andamento": "bg-blue-100 text-blue-800 border-blue-200", concluido: "bg-green-100 text-green-800 border-green-200", cancelado: "bg-red-100 text-red-800 border-red-200" };

// O objeto 'serviceTypeLabels' foi removido, pois não é mais necessário aqui.

export function ServiceOrderList({ onBack, onViewServiceOrder }: ServiceOrderListProps) {
  const [serviceOrders, setServiceOrders] = useState<SavedServiceOrder[]>([]) 
  const [isLoading, setIsLoading] = useState(true);

  const fetchServiceOrders = async () => { setIsLoading(true); const { data: { user } } = await supabase.auth.getUser(); if (!user) { setServiceOrders([]); setIsLoading(false); return; } const { data, error } = await supabase.from('ordens_servico').select('*').order('created_at', { ascending: false }); if (error) { console.error("Erro ao buscar dados:", error); alert("Falha ao carregar as Ordens de Serviço."); setServiceOrders([]); } else { setServiceOrders(data as SavedServiceOrder[]); } setIsLoading(false); };
  useEffect(() => { fetchServiceOrders(); }, []); 
  const updateServiceOrderStatus = async (orderId: string, newStatus: SavedServiceOrder["status"]) => { const { error } = await supabase.from('ordens_servico').update({ status: newStatus }).eq('id', orderId); if (error) { console.error("Erro ao atualizar status:", error); alert("Falha ao atualizar o status no banco."); } else { fetchServiceOrders(); } };
  const deleteServiceOrder = async (orderId: string) => { if (confirm("Tem certeza que deseja excluir esta ordem de serviço?")) { const { error } = await supabase.from('ordens_servico').delete().eq('id', orderId); if (error) { console.error("Erro ao excluir:", error); alert("Falha ao excluir a Ordem de Serviço. Verifique as permissões de exclusão no Supabase."); } else { fetchServiceOrders(); } } };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* SEU CABEÇALHO ORIGINAL, AGORA PRESERVADO */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} className="gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-6">
            <Image src="/images/warp-logo.png" alt="WARP Segurança Eletrônica" width={200} height={60} className="h-12 w-auto" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">Controle de Ordens de Serviço</h1>
        <p className="text-muted-foreground">Visualize e gerencie todas as ordens de serviço geradas</p>
      </div>

      {isLoading ? (
        <Card><CardContent className="text-center py-12 text-blue-600">Carregando Ordens de Serviço do Banco de Dados...</CardContent></Card>
      ) : serviceOrders.length === 0 ? (
        <Card><CardContent className="text-center py-12"><p className="text-muted-foreground text-lg">Nenhuma ordem de serviço encontrada</p><p className="text-sm text-muted-foreground mt-2">Crie sua primeira OS para começar a usar o sistema de controle</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {serviceOrders.map((order) => (
            <Card key={order.id} className="border-red-100">
              <CardContent className="p-6">
                {/* CABEÇALHO DO CARD, AGORA PRESERVADO */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-red-600">{order.osnumber || 'Nº Indisponível'}</h3> 
                    <p className="text-sm text-muted-foreground">Criado em {(order.created_at && new Date(order.created_at).toLocaleDateString("pt-BR")) || 'Data Indisponível'}</p>
                  </div>
                  <Badge className={statusColors[order.status as keyof typeof statusColors]}>{statusLabels[order.status as keyof typeof statusLabels]}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cliente</p>
                    <p className="text-sm">{order.cliente_nome || 'N/A'}</p> 
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tipo de Serviço</p>
                    {/* ALTERAÇÃO 3: A única mudança visual. Usamos a função para formatar o texto. */}
                    <p className="text-sm">{formatStructuredService(order.servicetype)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Agendado para</p>
                    <p className="text-sm">{order.scheduleddate && order.scheduleddate.length > 5 ? new Date(order.scheduleddate.replace('T', ' ')).toLocaleString("pt-BR") : "Não agendado"}</p>
                  </div>
                </div>
                
                {/* BOTÕES E AÇÕES, AGORA PRESERVADOS */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <Select value={order.status} onValueChange={(value: SavedServiceOrder["status"]) => updateServiceOrderStatus(order.id, value)}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="em-andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onViewServiceOrder(order)} className="gap-2 border-red-200 text-red-600 hover:bg-red-50">
                      <Eye className="h-4 w-4" /> Visualizar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteServiceOrder(order.id)} className="gap-2 border-red-200 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" /> Excluir
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