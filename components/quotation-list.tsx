"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, PlusCircle, Eye, Edit, Trash2, Search, Plus, Calculator } from "lucide-react"
import Image from "next/image"
import { PageHeader } from "./PageHeader"
import { type Quotation } from "@/lib/types"

const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/WARP-logo.png";

interface QuotationListProps {
  onBack: () => void;
  onLogout: () => void;
  onAddQuotation: () => void;
  onEditQuotation: (quotation: Quotation) => void;
  onViewQuotation: (quotation: Quotation) => void;
}

const statusColors: { [key: string]: string } = {
  "Em cotação": "bg-blue-100 text-blue-800",
  "Aprovado": "bg-green-100 text-green-800",
  "Cancelado": "bg-destructive/20 text-red-800",
};

export function QuotationList({ onBack, onLogout, onAddQuotation, onEditQuotation, onViewQuotation }: QuotationListProps) {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchQuotations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
        .from('cotacoes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erro ao buscar cotações:", error);
        alert("Falha ao carregar as cotações.");
    } else {
        setQuotations(data as Quotation[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const deleteQuotation = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta cotação?")) {
      const { error } = await supabase.from('cotacoes').delete().eq('id', id);
      if (error) {
        alert("Falha ao excluir a cotação.");
      } else {
        fetchQuotations(); // Recarrega a lista
      }
    }
  }
  
  const updateQuotationStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('cotacoes').update({ status: newStatus }).eq('id', id);
    if (error) {
      alert("Falha ao atualizar o status.");
      console.error("Erro ao atualizar status:", error);
    } else {
      // Atualiza o estado local para uma resposta visual imediata
      setQuotations(prev => prev.map(q => (q.id === id ? { ...q, status: newStatus } : q)));
    }
  };

  const filteredQuotations = quotations.filter(q => 
    q.nome_cotacao.toLowerCase().includes(searchTerm.toLowerCase())
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
          <Button onClick={onAddQuotation} className="gap-2 bg-destructive hover:bg-destructive/90">
              <span className="flex items-center">
                <Calculator className="h-4 w-4" />
                <Plus className="h-3 w-3 -ml-1.5 -translate-y-1" />
              </span>
            Criar Nova Cotação
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-destructive mb-2 text-center">Cotações</h1>
        <p className="text-muted-foreground text-center">Calcule custos e margens para seus orçamentos</p>
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
      
        {isLoading ? ( <Card><CardContent className="text-center py-12">Carregando cotações...</CardContent></Card> ) 
        : quotations.length === 0 ? ( <Card><CardContent className="text-center py-12"><p>Nenhuma cotação encontrada.</p></CardContent></Card> ) 
        : (
          <div className="space-y-4">
            {filteredQuotations.length === 0 && (
              <Card><CardContent className="text-center py-12 text-muted-foreground">Nenhuma cotação encontrada para a busca "{searchTerm}"</CardContent></Card>
            )}
            
            {filteredQuotations.map((quotation) => (
              <Card key={quotation.id} className="border-gray-200">
                <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">{quotation.nome_cotacao}</h3>
                            <p className="text-xs text-muted-foreground">
                                Criada em: {new Date(quotation.created_at).toLocaleDateString('pt-BR')} | 
                                Última alteração: {new Date(quotation.updated_at).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        <Badge className={statusColors[quotation.status] || 'bg-gray-100 text-gray-800'}>
                            {quotation.status}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-medium text-gray-600">Status:</span>
                           <Select value={quotation.status} onValueChange={(value) => updateQuotationStatus(quotation.id, value)}>
                                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Em cotação">Em cotação</SelectItem>
                                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                                </SelectContent>
                           </Select>
                        </div>
                        <div className="flex gap-2">
                         <Button variant="outline" size="sm" onClick={() => onViewQuotation(quotation)} className="gap-2 text-destructive hover:text-destructive border-destructive/40 hover:bg-destructive/10"> <Eye className="h-4 w-4" /> Visualizar </Button>
                         <Button variant="outline" size="sm" onClick={() => onEditQuotation(quotation)} className="gap-2 text-destructive hover:text-destructive border-destructive/40 hover:bg-destructive/10"> <Edit className="h-4 w-4" /> Editar </Button>
                         <Button variant="outline" size="sm" onClick={() => deleteQuotation(quotation.id)} className="gap-2 text-destructive hover:text-destructive border-destructive/40 hover:bg-destructive/10"> <Trash2 className="h-4 w-4" /> Excluir </Button>
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