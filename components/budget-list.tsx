"use client"

import { supabase } from '@/lib/supabase/client';
import { useState, useEffect } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input'; // Import do Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Eye, Trash2, PlusCircle, Search, FilePlus  } from "lucide-react";
import Image from "next/image";

const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/WARP-logo.png";


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
  created_at: string; // Supabase usa created_at
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
        // Renomeando 'createdAt' para 'created_at' se necessário ao buscar, mas a tabela tem 'created_at'
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

  // <-- NOVA LÓgica: Filtra a lista de orçamentos
  const filteredBudgets = budgets.filter(budget =>
    budget.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.budgetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (statusLabels[budget.status] && statusLabels[budget.status].toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
  {/* Novo Cabeçalho com Logo no Centro */}
  <div className="flex items-center justify-between mb-6">
    <Button variant="outline" onClick={onBack} className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10">
      <ArrowLeft className="h-4 w-4" />
      Voltar ao Menu
    </Button>
    {brandLogo && (
    <Image src={brandLogo} alt="Logo" width={2011} height={755} quality={100} className="h-32 w-auto" /> )}
    <Button onClick={onAddBudget} className="gap-2 bg-destructive hover:bg-destructive/90">
            {/* ÍCONE ALTERADO AQUI */}
            <FilePlus className="h-4 w-4" />
            Criar Novo Orçamento
          </Button>
        </div>

       
  <h1 className="text-3xl font-bold text-destructive mb-2 text-center">Controle de Orçamentos</h1>
  <p className="text-muted-foreground text-center">Visualize e gerencie todos os orçamentos gerados</p>
</div>

 {/* --- NOVO CAMPO DE BUSCA --- */}
        <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                type="text"
                placeholder="Buscar por cliente, nº do orçamento ou status..."
                className="pl-10"
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
              <Card key={budget.id} className="border-red-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                    <h3 className="text-lg font-semibold text-destructive">{budget.budgetNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      Criado em {new Date(budget.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Badge className={statusColors[budget.status as keyof typeof statusColors]}>{statusLabels[budget.status as keyof typeof statusLabels]}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cliente</p>
                    <p className="text-sm">{budget.client.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                    <p className="text-sm font-semibold text-destructive">
                      R$ {budget.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Válido até</p>
                    <p className="text-sm">
                      {budget.validUntil ? new Date(budget.validUntil).toLocaleDateString("pt-BR") : "Não informado"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <Select
                      value={budget.status}
                      onValueChange={(value: SavedBudget["status"]) => updateBudgetStatus(budget.id, value)}
                    >
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="em-aberto">Em Aberto</SelectItem>
                        <SelectItem value="instalando">Instalando</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onViewBudget(budget)} className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10">
                      <Eye className="h-4 w-4" /> Visualizar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteBudget(budget.id)} className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10">
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