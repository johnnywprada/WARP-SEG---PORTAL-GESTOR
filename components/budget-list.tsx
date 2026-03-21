"use client"

import { supabase } from '@/lib/supabase/client';
import { useState, useEffect } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Eye, Trash2, Search, FilePlus  } from "lucide-react";
import Image from "next/image";

const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/warp-logo.png";

interface SavedBudget {
  id: string;
  budgetNumber: string;
  client: { name: string; address: string; phone: string; email: string; };
  products: Array<any>;
  paymentMethod: string;
  observations: string;
  validUntil: string;
  totalValue: number;
  status: "em-aberto" | "instalando" | "concluido" | "cancelado";
  created_at: string;
}

interface BudgetListProps { onBack: () => void; onViewBudget: (budget: any) => void; onAddBudget: () => void; }

const statusLabels = { "em-aberto": "Em Aberto", instalando: "Instalando", concluido: "Concluído", cancelado: "Cancelado" };
const statusColors = { "em-aberto": "bg-yellow-100 text-yellow-800 border-yellow-200", instalando: "bg-blue-100 text-blue-800 border-blue-200", concluido: "bg-green-100 text-green-800 border-green-200", cancelado: "bg-destructive/20 text-red-800 border-destructive/40" };

export function BudgetList({ onBack, onViewBudget, onAddBudget  }: BudgetListProps) {
  const [budgets, setBudgets] = useState<SavedBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBudgets = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar orçamentos:", error);
        alert("Não foi possível carregar os orçamentos.");
      } else {
        setBudgets(data as SavedBudget[]);
      }
      setIsLoading(false);
    };

    fetchBudgets();
  }, []);

  const updateBudgetStatus = async (budgetId: string, newStatus: SavedBudget["status"]) => {
    const { error } = await supabase.from('orcamentos').update({ status: newStatus }).eq('id', budgetId);
    if (error) {
      alert("Falha ao atualizar o status.");
    } else {
      setBudgets(budgets.map((b) => (b.id === budgetId ? { ...b, status: newStatus } : b)));
    }
  };

  const deleteBudget = async (budgetId: string) => {
    if (confirm("Tem certeza que deseja excluir este orçamento?")) {
      const { error } = await supabase.from('orcamentos').delete().eq('id', budgetId);
      if (error) {
        alert("Falha ao deletar o orçamento.");
      } else {
        setBudgets(budgets.filter((b) => b.id !== budgetId));
      }
    }
  };

  const filteredBudgets = budgets.filter(budget =>
    budget.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.budgetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (statusLabels[budget.status] && statusLabels[budget.status].toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-6xl">
      <div className="mb-6 sm:mb-8">
        
        {/* CABEÇALHO RESPONSIVO: Empilhado no mobile, em linha no desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          {brandLogo && (
            <Image src={brandLogo} alt="Logo" width={708} height={256} quality={100} className="h-16 sm:h-24 w-auto order-1 sm:order-none" /> 
          )}
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 order-2 sm:order-none">
            <Button variant="outline" onClick={onBack} className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10 w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" /> Voltar ao Menu
            </Button>
            <Button onClick={onAddBudget} className="gap-2 bg-destructive hover:bg-destructive/90 w-full sm:w-auto">
              <FilePlus className="h-4 w-4" /> Criar Novo Orçamento
            </Button>
          </div>
        </div>
       
        <h1 className="text-2xl sm:text-3xl font-bold text-destructive mb-2 text-center">Controle de Orçamentos</h1>
        <p className="text-sm sm:text-base text-muted-foreground text-center">Visualize e gerencie todos os orçamentos gerados</p>
      </div>

      {/* CAMPO DE BUSCA AUMENTADO NO MOBILE */}
      <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
              type="text"
              placeholder="Buscar por cliente, nº do orçamento ou status..."
              className="pl-10 h-12 sm:h-10 text-base sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {isLoading ? (
        <Card>
            <CardContent className="text-center py-12 text-blue-600">Carregando Orçamentos do Banco de Dados...</CardContent>
        </Card>
      ) : budgets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground text-lg">Nenhum orçamento encontrado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crie seu primeiro orçamento para começar a usar o sistema de controle
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
            {filteredBudgets.length === 0 && (
              <Card><CardContent className="text-center py-12 text-muted-foreground">Nenhum orçamento encontrado para a busca "{searchTerm}"</CardContent></Card>
            )}

            {filteredBudgets.map((budget) => (
              <Card key={budget.id} className="border-red-100 overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  
                  {/* HEADER DO CARD */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-destructive">{budget.budgetNumber}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Criado em {new Date(budget.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge className={`${statusColors[budget.status as keyof typeof statusColors]} self-start sm:self-auto`}>
                      {statusLabels[budget.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>

                  {/* DADOS DO CARD (ESTILO DESTACADO) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Cliente</p>
                      <p className="text-sm font-semibold text-gray-800 break-words">{budget.client.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Valor Total</p>
                      <p className="text-sm font-bold text-destructive">
                        R$ {budget.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Válido até</p>
                      <p className="text-sm text-gray-800">
                        {budget.validUntil ? new Date(budget.validUntil).toLocaleDateString("pt-BR") : "Não informado"}
                      </p>
                    </div>
                  </div>

                  {/* AÇÕES RESPONSIVAS */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <Select
                        value={budget.status}
                        onValueChange={(value: SavedBudget["status"]) => updateBudgetStatus(budget.id, value)}
                      >
                        <SelectTrigger className="w-full sm:w-40 h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="em-aberto">Em Aberto</SelectItem>
                          <SelectItem value="instalando">Instalando</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" onClick={() => onViewBudget(budget)} className="flex-1 sm:flex-none gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 h-10">
                        <Eye className="h-4 w-4" /> <span className="hidden sm:inline">Ver</span>
                      </Button>
                      <Button variant="outline" onClick={() => deleteBudget(budget.id)} className="flex-1 sm:flex-none gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 h-10">
                        <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Excluir</span>
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