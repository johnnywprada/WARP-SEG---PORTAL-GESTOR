"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Eye, Edit, Trash2, Search, Plus, Calculator } from "lucide-react"
import Image from "next/image"
import { type Quotation } from "@/lib/types"

const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/warp-logo.png";

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
        fetchQuotations();
      }
    }
  }
  
  const updateQuotationStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('cotacoes').update({ status: newStatus }).eq('id', id);
    if (error) {
      alert("Falha ao atualizar o status.");
      console.error("Erro ao atualizar status:", error);
    } else {
      setQuotations(prev => prev.map(q => (q.id === id ? { ...q, status: newStatus } : q)));
    }
  };

  const filteredQuotations = quotations.filter(q => 
    q.nome_cotacao.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Button onClick={onAddQuotation} className="gap-2 bg-destructive hover:bg-destructive/90 w-full sm:w-auto">
              <span className="flex items-center">
                <Calculator className="h-4 w-4" />
                <Plus className="h-3 w-3 -ml-1.5 -translate-y-1" />
              </span>
              Criar Nova Cotação
            </Button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-destructive mb-2 text-center">Controle de Cotações</h1>
        <p className="text-sm sm:text-base text-muted-foreground text-center">Calcule custos e margens para seus orçamentos</p>
      </div>

      {/* CAMPO DE BUSCA RESPONSIVO */}
      <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
              type="text"
              placeholder="Buscar por nome da cotação..."
              className="pl-10 h-12 sm:h-10 text-base sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>
      
      {isLoading ? ( 
        <Card><CardContent className="text-center py-12 text-blue-600">Carregando cotações do Banco de Dados...</CardContent></Card> 
      ) : quotations.length === 0 ? ( 
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground text-lg">Nenhuma cotação encontrada</p>
            <p className="text-sm text-muted-foreground mt-2">Crie sua primeira cotação para estruturar seus custos.</p>
          </CardContent>
        </Card> 
      ) : (
        <div className="space-y-4">
          {filteredQuotations.length === 0 && (
            <Card><CardContent className="text-center py-12 text-muted-foreground">Nenhuma cotação encontrada para a busca "{searchTerm}"</CardContent></Card>
          )}
          
          {filteredQuotations.map((quotation) => (
            <Card key={quotation.id} className="border-red-100 overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                  
                  {/* HEADER DO CARD */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                          <h3 className="text-lg font-semibold text-destructive">{quotation.nome_cotacao}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                              Criada em: {new Date(quotation.created_at).toLocaleDateString('pt-BR')}
                          </p>
                      </div>
                      <Badge className={`${statusColors[quotation.status] || 'bg-gray-100 text-gray-800'} self-start sm:self-auto`}>
                          {quotation.status}
                      </Badge>
                  </div>

                  {/* AÇÕES RESPONSIVAS */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                      
                      {/* STATUS SELECT */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                         <span className="text-sm font-medium text-gray-600">Status:</span>
                         <Select value={quotation.status} onValueChange={(value) => updateQuotationStatus(quotation.id, value)}>
                              <SelectTrigger className="w-full sm:w-40 h-10"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Em cotação">Em cotação</SelectItem>
                                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                              </SelectContent>
                         </Select>
                      </div>

                      {/* BOTOES DE AÇÃO (Esconde o texto no celular para caber 3 botões) */}
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={() => onViewQuotation(quotation)} className="flex-1 sm:flex-none gap-2 text-destructive hover:text-destructive border-destructive/40 hover:bg-destructive/10 h-10"> 
                          <Eye className="h-4 w-4" /> <span className="hidden sm:inline">Visualizar</span> 
                        </Button>
                        <Button variant="outline" onClick={() => onEditQuotation(quotation)} className="flex-1 sm:flex-none gap-2 text-destructive hover:text-destructive border-destructive/40 hover:bg-destructive/10 h-10"> 
                          <Edit className="h-4 w-4" /> <span className="hidden sm:inline">Editar</span> 
                        </Button>
                        <Button variant="outline" onClick={() => deleteQuotation(quotation.id)} className="flex-1 sm:flex-none gap-2 text-destructive hover:text-destructive border-destructive/40 hover:bg-destructive/10 h-10"> 
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