"use client"

import { supabase } from '@/lib/supabase/client';
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Eye, Trash2, CheckCircle, PlusCircle, Search, Wrench, Plus } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';


// --- CORREÇÃO: Importamos os tipos dos arquivos centrais ---
import { formatStructuredService, type StructuredServiceData } from '@/lib/serviceUtils';
import { type SavedServiceOrder } from '@/lib/types'; // <-- Usa a definição de lib/types.ts

// --- REMOVIDO: A interface local 'SavedServiceOrder' foi apagada daqui ---

interface ServiceOrderListProps {
  onBack: () => void
  onViewServiceOrder: (serviceOrder: SavedServiceOrder) => void
  onAddServiceOrder: () => void;
}

const statusLabels = { agendado: "Agendado", "em-andamento": "Em Andamento", concluido: "Concluído", cancelado: "Cancelado" };
const statusColors = { agendado: "bg-yellow-100 text-yellow-800 border-yellow-200", "em-andamento": "bg-blue-100 text-blue-800 border-blue-200", concluido: "bg-green-100 text-green-800 border-green-200", cancelado: "bg-destructive/20 text-red-800 border-destructive/40" };
const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/warp-logo.png";

export function ServiceOrderList({ onBack, onViewServiceOrder, onAddServiceOrder  }: ServiceOrderListProps) {
  const [serviceOrders, setServiceOrders] = useState<SavedServiceOrder[]>([]) 
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SavedServiceOrder | null>(null);
  const [reportText, setReportText] = useState("");
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchServiceOrders = async () => { setIsLoading(true); const { data: { user } } = await supabase.auth.getUser(); if (!user) { setServiceOrders([]); setIsLoading(false); return; } const { data, error } = await supabase.from('ordens_servico').select('*').order('created_at', { ascending: false }); if (error) { console.error("Erro ao buscar dados:", error); alert("Falha ao carregar as Ordens de Serviço."); setServiceOrders([]); } else { setServiceOrders(data as SavedServiceOrder[]); } setIsLoading(false); };
  useEffect(() => { fetchServiceOrders(); }, []); 
  const updateServiceOrderStatus = async (orderId: string, newStatus: SavedServiceOrder["status"]) => { const { error } = await supabase.from('ordens_servico').update({ status: newStatus }).eq('id', orderId); if (error) { console.error("Erro ao atualizar status:", error); alert("Falha ao atualizar o status no banco."); } else { fetchServiceOrders(); } };
  const deleteServiceOrder = async (orderId: string) => { if (confirm("Tem certeza que deseja excluir esta ordem de serviço?")) { const { error } = await supabase.from('ordens_servico').delete().eq('id', orderId); if (error) { console.error("Erro ao excluir:", error); alert("Falha ao excluir a Ordem de Serviço."); } else { fetchServiceOrders(); } } };

  const handleFinalizeOS = async () => {
    if (!selectedOrder) return;
    setIsSavingReport(true);
    const { error } = await supabase
      .from('ordens_servico')
      .update({ relatorio_tecnico: reportText, status: 'concluido' })
      .eq('id', selectedOrder.id);
    if (error) { alert("Falha ao finalizar a Ordem de Serviço."); console.error("Erro ao finalizar OS:", error); } 
    else { alert("Ordem de Serviço finalizada com sucesso!"); setIsFinalizeModalOpen(false); fetchServiceOrders(); }
    setIsSavingReport(false);
  };

  const openFinalizeModal = (order: SavedServiceOrder) => {
    setSelectedOrder(order);
    setReportText(""); // Prioriza o relatório existente, senão a descrição
    setIsFinalizeModalOpen(true);
  };

  const filteredServiceOrders = serviceOrders.filter(order =>
    order.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.osnumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (statusLabels[order.status] && statusLabels[order.status].toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={isFinalizeModalOpen} onOpenChange={setIsFinalizeModalOpen}>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
  {/* Novo Cabeçalho com Logo no Centro */}
  <div className="flex items-center justify-between mb-6">
    <Button variant="outline" onClick={onBack} className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10">
      <ArrowLeft className="h-4 w-4" />
      Voltar ao Menu
    </Button>
    {brandLogo && (
    <Image src={brandLogo} alt="Logo" width={2011} height={755} quality={100} className="h-10 w-auto" /> )}
    <Button onClick={onAddServiceOrder} className="gap-2 bg-destructive hover:bg-destructive/90">
              <span className="flex items-center">
                <Wrench className="h-4 w-4" />
                <Plus className="h-3 w-3 -ml-1.5 -translate-y-1" />
              </span>
              Criar Nova O.S
            </Button>
          </div>
  <h1 className="text-3xl font-bold text-destructive mb-2 text-center">Controle de Ordens de Serviço</h1>
  <p className="text-muted-foreground text-center">Visualize e gerencie todas as ordens de serviço geradas</p>
</div>

{/* --- NOVO CAMPO DE BUSCA --- */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
              type="text"
              placeholder="Buscar por cliente, nº da O.S ou status..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? ( <Card><CardContent className="text-center py-12 text-blue-600">Carregando Ordens de Serviço...</CardContent></Card> ) 
        : serviceOrders.length === 0 ? ( <Card><CardContent className="text-center py-12"><p className="text-muted-foreground text-lg">Nenhuma ordem de serviço encontrada</p></CardContent></Card> ) 
        : (
          <div className="space-y-4">
            {filteredServiceOrders.length === 0 && (
              <Card><CardContent className="text-center py-12 text-muted-foreground">Nenhuma O.S encontrada para a busca "{searchTerm}"</CardContent></Card>
            )}
            {filteredServiceOrders.map((order) => (
              <Card key={order.id} className="border-red-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-destructive">{order.osnumber || 'Nº Indisponível'}</h3> 
                      <p className="text-sm text-muted-foreground">Criado em {(order.created_at && new Date(order.created_at).toLocaleDateString("pt-BR")) || 'Data Indisponível'}</p>
                    </div>
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>{statusLabels[order.status as keyof typeof statusLabels]}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div><p className="text-sm font-medium text-gray-600">Cliente</p><p className="text-sm">{order.cliente_nome || 'N/A'}</p></div>
                    <div><p className="text-sm font-medium text-gray-600">Tipo de Serviço</p><p className="text-sm">{formatStructuredService(order.servicetype)}</p></div>
                    <div><p className="text-sm font-medium text-gray-600">Agendado para</p><p className="text-sm">{order.scheduleddate && order.scheduleddate.length > 5 ? new Date(order.scheduleddate.replace('T', ' ')).toLocaleString("pt-BR") : "Não agendado"}</p></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <Select value={order.status} onValueChange={(value: SavedServiceOrder["status"]) => updateServiceOrderStatus(order.id, value)}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="agendado">Agendado</SelectItem><SelectItem value="em-andamento">Em Andamento</SelectItem><SelectItem value="concluido">Concluído</SelectItem><SelectItem value="cancelado">Cancelado</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {order.status !== 'concluido' && order.status !== 'cancelado' && (
                        <Button variant="outline" size="sm" onClick={() => openFinalizeModal(order)} className="gap-2 border-green-200 text-green-600 hover:bg-green-50">
                          <CheckCircle className="h-4 w-4" /> Finalizar O.S
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => onViewServiceOrder(order)} className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"><Eye className="h-4 w-4" /> Visualizar</Button>
                      <Button variant="outline" size="sm" onClick={() => deleteServiceOrder(order.id)} className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /> Excluir</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar Ordem de Serviço: {selectedOrder?.osnumber}</DialogTitle>
          <DialogDescription>Descreva o que foi executado. Este texto será salvo como o relatório final da O.S</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
            <Label htmlFor="report">Relatório de Execução</Label>
            <Textarea id="report" value={reportText} onChange={(e) => setReportText(e.target.value)} rows={8} placeholder="Ex: Foi realizada a troca da câmera do portão. Equipamento testado e funcionando perfeitamente." />
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost" className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10">Cancelar</Button></DialogClose>
          <Button onClick={handleFinalizeOS} disabled={isSavingReport} className="gap-2 bg-destructive hover:bg-destructive/90">{isSavingReport ?  "Salvando..." :  "Salvar e Concluir O.S"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}