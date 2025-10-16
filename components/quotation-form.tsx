"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, PlusCircle, Trash2, Save, Printer, FileText, Percent } from "lucide-react"
import { PageHeader } from "./PageHeader"
import { Separator } from "@/components/ui/separator"

// --- TIPOS E INTERFACES ATUALIZADAS ---
export interface QuotationItem {
  id: number; // ID temporário para React
  descricao: string;
  fornecedor: string;
  quantidade: number;
  custo_unitario: number;
  // NOVOS CAMPOS CALCULADOS PARA EXIBIÇÃO
  custo_total_item: number;
  lucro_item: number;
  preco_venda_unitario: number; // Rev. Unit. (R$)
  preco_venda_total_item: number;
}

export interface QuotationData {
  nome_cotacao: string;
  porcentagem_lucro: number;
  itens_cotados: QuotationItem[];
  status: string;
}

export interface QuotationFormProps {
  onBack: () => void;
  onLogout: () => void;
  quotationToEdit?: any;
  onConvertToBudget: (quotation: QuotationData) => void;
  onViewQuotationList: () => void;
}

export function QuotationForm({ onBack, onLogout, quotationToEdit, onConvertToBudget, onViewQuotationList }: QuotationFormProps) {
  const [quotation, setQuotation] = useState<QuotationData>({
    nome_cotacao: "",
    porcentagem_lucro: 40,
    itens_cotados: [],
    status: "Em cotação"
  });
  const [isLoading, setIsLoading] = useState(false);

  // --- EFEITO PARA PREENCHER O FORMULÁRIO NO MODO DE EDIÇÃO ---
  useEffect(() => {
    if (quotationToEdit) {
      // Quando editamos, precisamos adicionar os campos calculados que não vêm do banco
      const itemsFromDb = (quotationToEdit.itens_cotados || []).map((item: any, index: number) => ({
        ...item,
        id: Date.now() + index, // Adiciona ID temporário
        // Inicializa campos que serão preenchidos pelo próximo useEffect
        custo_total_item: 0,
        lucro_item: 0,
        preco_venda_unitario: 0,
        preco_venda_total_item: 0,
      }));

      setQuotation({
        nome_cotacao: quotationToEdit.nome_cotacao || "",
        porcentagem_lucro: quotationToEdit.porcentagem_lucro || 40,
        itens_cotados: itemsFromDb,
        status: quotationToEdit.status || "Em cotação",
      });
    }
  }, [quotationToEdit]);

  // --- EFEITO PARA CÁLCULO EM TEMPO REAL ---
  useEffect(() => {
    const updatedItems = quotation.itens_cotados.map(item => {
      const custoTotalItem = item.custo_unitario * item.quantidade;
      const precoVendaUnitario = item.custo_unitario * (1 + quotation.porcentagem_lucro / 100);
      const precoVendaTotalItem = precoVendaUnitario * item.quantidade;
      const lucroItem = precoVendaTotalItem - custoTotalItem;
      
      return { ...item, custo_total_item: custoTotalItem, lucro_item: lucroItem, preco_venda_unitario: precoVendaUnitario, preco_venda_total_item: precoVendaTotalItem };
    });
    
    // Evita loop infinito, atualizando o estado apenas se houver mudança nos valores
    if (JSON.stringify(updatedItems) !== JSON.stringify(quotation.itens_cotados)) {
        setQuotation(prev => ({ ...prev, itens_cotados: updatedItems }));
    }
  }, [quotation.itens_cotados, quotation.porcentagem_lucro]);

  // --- FUNÇÕES DE CÁLCULO GLOBAIS ---
  const custoTotal = quotation.itens_cotados.reduce((sum, item) => sum + item.custo_total_item, 0);
  const precoFinalVenda = quotation.itens_cotados.reduce((sum, item) => sum + item.preco_venda_total_item, 0);
  const valorLucro = precoFinalVenda - custoTotal;

  // --- FUNÇÕES DE MANIPULAÇÃO DO FORMULÁRIO ---
  const handleItemChange = (id: number, field: keyof Omit<QuotationItem, 'id' | 'custo_total_item' | 'lucro_item' | 'preco_venda_unitario' | 'preco_venda_total_item'>, value: any) => {
    const numericValue = (field === 'quantidade' || field === 'custo_unitario') ? Number(value) || 0 : value;
    setQuotation(prev => ({
      ...prev,
      itens_cotados: prev.itens_cotados.map(item =>
        item.id === id ? { ...item, [field]: numericValue } : item
      )
    }));
  };

  const addItem = () => {
    setQuotation(prev => ({
      ...prev,
      itens_cotados: [ ...prev.itens_cotados, { id: Date.now(), descricao: "", fornecedor: "", quantidade: 1, custo_unitario: 0, custo_total_item: 0, lucro_item: 0, preco_venda_unitario: 0, preco_venda_total_item: 0 } ]
    }));
  };

  const removeItem = (id: number) => { setQuotation(prev => ({ ...prev, itens_cotados: prev.itens_cotados.filter(item => item.id !== id) })); };

const handleSave = async (): Promise<boolean> => { // Modificado para retornar um booleano de sucesso
    if (!quotation.nome_cotacao.trim()) { alert("Por favor, dê um nome para a cotação."); return false; }
    setIsLoading(true);
    
    const itemsToSave = quotation.itens_cotados.map(({ descricao, fornecedor, quantidade, custo_unitario }) => ({ descricao, fornecedor, quantidade, custo_unitario }));

    let error;
    if (quotationToEdit) {
      // MODO EDIÇÃO
      ({ error } = await supabase.from('cotacoes').update({ nome_cotacao: quotation.nome_cotacao, porcentagem_lucro: quotation.porcentagem_lucro, itens_cotados: itemsToSave, status: quotation.status }).eq('id', quotationToEdit.id));
    } else {
      // MODO CRIAÇÃO
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("Erro de autenticação."); setIsLoading(false); return false; }
      ({ error } = await supabase.from('cotacoes').insert([{ user_id: user.id, nome_cotacao: quotation.nome_cotacao, porcentagem_lucro: quotation.porcentagem_lucro, itens_cotados: itemsToSave, status: quotation.status }]));
    }
    
    setIsLoading(false);
    if (error) {
      alert(quotationToEdit ? "Falha ao atualizar cotação." : "Falha ao salvar cotação.");
      console.error(error);
      return false;
    }
    return true;
  };

  const handleSaveAndGoBack = async () => {
    const success = await handleSave();
    if (success) {
      alert(quotationToEdit ? "Cotação atualizada com sucesso!" : "Cotação salva com sucesso!");
      onBack();
    }
  }

  // --- NOVA FUNÇÃO PARA SALVAR E CONVERTER ---
  const handleConvertToBudget = async () => {
    const success = await handleSave();
    if (success) {
      // Apenas chama a função de conversão se o salvamento for bem-sucedido
      onConvertToBudget(quotation);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={quotationToEdit ? "Editar Cotação" : "Sistema de Cotação - WARP"} onBackToMenu={onBack} onLogout={onLogout} onViewList={onViewQuotationList} viewListText="Ver Cotações" />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Informações Gerais</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="nome_cotacao">Nome da Cotação *</Label><Input id="nome_cotacao" value={quotation.nome_cotacao} onChange={e => setQuotation({...quotation, nome_cotacao: e.target.value})} placeholder="Ex: CFTV Cliente Maria"/></div>
              <div><Label htmlFor="porcentagem_lucro">Margem de Lucro (%) *</Label><div className="relative"><Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input id="porcentagem_lucro" type="number" value={quotation.porcentagem_lucro} onChange={e => setQuotation({...quotation, porcentagem_lucro: Number(e.target.value)})} className="pl-9"/></div></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Itens Cotados</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {quotation.itens_cotados.map(item => (
                <div key={item.id} className="p-4 border rounded-lg space-y-3 relative bg-slate-50">
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="absolute -top-2 -right-2 h-6 w-6 bg-red-100 text-red-600 hover:bg-red-200"><Trash2 className="h-4 w-4" /></Button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2"><Label>Descrição do Item</Label><Input value={item.descricao} onChange={e => handleItemChange(item.id, "descricao", e.target.value)} /></div>
                    <div><Label>Fornecedor</Label><Input value={item.fornecedor} onChange={e => handleItemChange(item.id, "fornecedor", e.target.value)} /></div>
                    <div><Label>Quantidade</Label><Input type="number" value={item.quantidade} onChange={e => handleItemChange(item.id, "quantidade", e.target.value)} /></div>
                    <div><Label>Custo Unit. (R$)</Label><Input type="number" value={item.custo_unitario} onChange={e => handleItemChange(item.id, "custo_unitario", e.target.value)}/></div>
                  </div>
                  
                  <div className="pt-3 border-t grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-xs">
                      <div><span className="text-muted-foreground">Custo Total:</span><p className="font-semibold text-slate-700">R$ {item.custo_total_item.toFixed(2)}</p></div>
                      <div><span className="text-muted-foreground">Rev. Unit. (R$):</span><p className="font-semibold text-slate-700">R$ {item.preco_venda_unitario.toFixed(2)}</p></div>
                      <div><span className="text-muted-foreground">Lucro (R$):</span><p className="font-semibold text-green-600">R$ {item.lucro_item.toFixed(2)}</p></div>
                      <div><span className="text-muted-foreground">Rev. Total (R$):</span><p className="font-semibold text-red-600">R$ {item.preco_venda_total_item.toFixed(2)}</p></div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addItem} className="w-full gap-2 border-dashed"><PlusCircle className="h-4 w-4" /> Adicionar Item</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Resumo Financeiro</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Custo Total dos Materiais:</span><span className="font-medium">R$ {custoTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Valor Total do Lucro:</span><span className="font-medium text-green-600">R$ {valorLucro.toFixed(2)}</span></div>
              <Separator/>
              <div className="flex justify-between text-base font-bold text-red-600"><span>Preço Final de Venda (Total):</span><span>R$ {precoFinalVenda.toFixed(2)}</span></div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => window.print()} className="gap-2"><Printer className="h-4 w-4"/>Imprimir / Salvar PDF</Button>
            <Button onClick={handleSave} disabled={isLoading} className="gap-2"><Save className="h-4 w-4"/>{isLoading ? "Salvando..." : (quotationToEdit ? "Salvar Alterações" : "Salvar Cotação")}</Button>
           <Button onClick={handleConvertToBudget} disabled={isLoading} className="gap-2 bg-red-600 hover:bg-red-700"> <FileText className="h-4 w-4"/> {isLoading ? "Salvando..." : "Converter em Orçamento"} </Button>
          </div>
        </div>
      </div>
    </div>
  )
}