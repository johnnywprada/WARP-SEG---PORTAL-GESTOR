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

export interface QuotationItem {
  id: number;
  descricao: string;
  fornecedor: string;
  quantidade: number;
  custo_unitario: number;
  porcentagem_lucro_item?: number | null;
  lucro_total?: boolean;
  custo_total_item: number;
  lucro_item: number;
  preco_venda_unitario: number;
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

  useEffect(() => {
    if (quotationToEdit) {
      const itemsFromDb = (quotationToEdit.itens_cotados || []).map((item: any, index: number) => ({
        ...item,
        id: Date.now() + index,
        porcentagem_lucro_item: item.porcentagem_lucro_item ?? null,
        lucro_total: item.lucro_total ?? false,
        custo_total_item: 0,
        lucro_item: 0,
        preco_venda_unitario: item.preco_venda_unitario ?? 0,
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

  useEffect(() => {
    const updatedItems = quotation.itens_cotados.map(item => {
      const custoTotalItem = item.custo_unitario * item.quantidade;

      if (item.lucro_total) {
        const precoVendaUnitario = item.preco_venda_unitario > 0 ? item.preco_venda_unitario : item.custo_unitario || 0;
        const precoVendaTotalItem = precoVendaUnitario * item.quantidade;
        const lucroItem = precoVendaTotalItem;

        return { ...item, custo_total_item: 0, lucro_item: lucroItem, preco_venda_unitario: precoVendaUnitario, preco_venda_total_item: precoVendaTotalItem };
      }

      const lucroUsado = item.porcentagem_lucro_item !== null && item.porcentagem_lucro_item !== undefined
          ? item.porcentagem_lucro_item
          : quotation.porcentagem_lucro;

      const precoVendaUnitario = item.custo_unitario * (1 + lucroUsado / 100);
      const precoVendaTotalItem = precoVendaUnitario * item.quantidade;
      const lucroItem = precoVendaTotalItem - custoTotalItem;

      return { ...item, custo_total_item: custoTotalItem, lucro_item: lucroItem, preco_venda_unitario: precoVendaUnitario, preco_venda_total_item: precoVendaTotalItem };
    });

    if (JSON.stringify(updatedItems) !== JSON.stringify(quotation.itens_cotados)) {
      setQuotation(prev => ({ ...prev, itens_cotados: updatedItems }));
    }
  }, [quotation.itens_cotados, quotation.porcentagem_lucro]);

  const custoTotal = quotation.itens_cotados.reduce((sum, item) => sum + item.custo_total_item, 0);
  const precoFinalVenda = quotation.itens_cotados.reduce((sum, item) => sum + item.preco_venda_total_item, 0);
  const valorLucro = precoFinalVenda - custoTotal;

  const handleItemChange = (id: number, field: keyof Omit<QuotationItem, 'id' | 'custo_total_item' | 'lucro_item' | 'preco_venda_unitario' | 'preco_venda_total_item'>, value: any) => {
    const numericValue = (field === 'quantidade' || field === 'custo_unitario') ? Number(value) || 0 : value;
    setQuotation(prev => ({ ...prev, itens_cotados: prev.itens_cotados.map(item => item.id === id ? { ...item, [field]: numericValue } : item ) }));
  };

  const addItem = () => {
    setQuotation(prev => ({ ...prev, itens_cotados: [ ...prev.itens_cotados, { id: Date.now(), descricao: "", fornecedor: "", quantidade: 1, custo_unitario: 0, porcentagem_lucro_item: null, lucro_total: false, custo_total_item: 0, lucro_item: 0, preco_venda_unitario: 0, preco_venda_total_item: 0 } ] }));
  };

  const removeItem = (id: number) => { setQuotation(prev => ({ ...prev, itens_cotados: prev.itens_cotados.filter(item => item.id !== id) })); };

  const handleSave = async (): Promise<boolean> => {
    if (!quotation.nome_cotacao.trim()) { alert("Por favor, dê um nome para a cotação."); return false; }
    setIsLoading(true);
    
    const itemsToSave = quotation.itens_cotados.map(item => ({
      descricao: item.descricao,
      fornecedor: item.fornecedor,
      quantidade: item.quantidade,
      custo_unitario: item.custo_unitario,
      porcentagem_lucro_item: item.porcentagem_lucro_item,
      lucro_total: item.lucro_total,
      preco_venda_unitario: item.preco_venda_unitario,
    }));

    let error;
    if (quotationToEdit) {
      ({ error } = await supabase.from('cotacoes').update({ nome_cotacao: quotation.nome_cotacao, porcentagem_lucro: quotation.porcentagem_lucro, itens_cotados: itemsToSave, status: quotation.status }).eq('id', quotationToEdit.id));
    } else {
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
      const successMsg = document.createElement("div");
      successMsg.textContent = quotationToEdit ? "Cotação atualizada com sucesso!" : "Cotação salva com sucesso!";
      successMsg.className = "fixed bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm sm:text-base w-[90%] sm:w-auto text-center";
      document.body.appendChild(successMsg);

      setTimeout(() => {
        successMsg.remove();
        onViewQuotationList();
        window.scrollTo({ top: 0, behavior: "auto" });
      }, 2500);
    }
  };

  const handleConvertToBudget = async () => {
    const success = await handleSave();
    if (success) {
      const quotationForBudget = {
        ...quotation,
        itens_cotados: quotation.itens_cotados.map(item => {
          const precoVendaUnitarioFinal = item.lucro_total
            ? item.preco_venda_unitario > 0 ? item.preco_venda_unitario : item.custo_unitario || 0
            : item.preco_venda_unitario || item.custo_unitario * (1 + quotation.porcentagem_lucro / 100);
          return { ...item, preco_venda_unitario: precoVendaUnitarioFinal };
        }),
      };
      onConvertToBudget(quotationForBudget);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <PageHeader title={quotationToEdit ? "Editar Cotação" : "Sistema de Cotação - WARP Sistemas Inteligentes"} onBackToMenu={onBack} onLogout={onLogout} onViewList={onViewQuotationList} viewListText="Ver Cotações" />
      
      {/* Container com respiro ajustado pro mobile */}
      <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
        
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-destructive mb-2">{quotationToEdit ? "Editar Cotação" : "Criar Nova Cotação"}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Estruture os custos e defina as margens de lucro</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card className="border-red-100">
            <CardHeader className="bg-destructive/10 py-4"><CardTitle className="text-destructive text-lg sm:text-xl">Informações Gerais</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 sm:pt-6">
              <div><Label htmlFor="nome_cotacao" className="text-sm">Nome da Cotação *</Label><Input id="nome_cotacao" className="mt-1" value={quotation.nome_cotacao} onChange={e => setQuotation({...quotation, nome_cotacao: e.target.value})} placeholder="Ex: CFTV Cliente Maria"/></div>
              <div>
                <Label htmlFor="porcentagem_lucro" className="text-sm">Margem de Lucro Global (%) *</Label>
                <div className="relative mt-1">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                  <Input id="porcentagem_lucro" type="number" value={quotation.porcentagem_lucro} onChange={e => setQuotation({...quotation, porcentagem_lucro: Number(e.target.value)})} className="pl-9"/>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardHeader className="bg-destructive/10 py-4"><CardTitle className="text-destructive text-lg sm:text-xl">Itens Cotados</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-4 sm:pt-6">
              {quotation.itens_cotados.map((item, index) => (
                <div key={item.id} className="p-3 sm:p-4 border border-red-100 rounded-lg space-y-4 relative bg-slate-50/50">
                  
                  <div className="flex items-center justify-between border-b border-red-100 pb-2">
                    <span className="font-medium text-destructive text-sm sm:text-base">Item {index + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                  </div>

                  {/* GRID RESPONSIVO PARA DADOS DO ITEM */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
                    <div className="sm:col-span-2 lg:col-span-2"><Label className="text-sm">Descrição do Item</Label><Input className="mt-1" value={item.descricao} onChange={e => handleItemChange(item.id, "descricao", e.target.value)} /></div>
                    <div className="lg:col-span-2"><Label className="text-sm">Fornecedor</Label><Input className="mt-1" value={item.fornecedor} onChange={e => handleItemChange(item.id, "fornecedor", e.target.value)} /></div>
                    <div className="lg:col-span-1"><Label className="text-sm">Qtd</Label><Input className="mt-1" type="number" value={item.quantidade} onChange={e => handleItemChange(item.id, "quantidade", e.target.value)} /></div>
                    <div className="lg:col-span-1"><Label className="text-sm">Custo Unit. (R$)</Label><Input className="mt-1" type="number" value={item.custo_unitario} onChange={e => handleItemChange(item.id, "custo_unitario", e.target.value)}/></div>
                  </div>

                  {/* CONTROLES FINANCEIROS DO ITEM RESPONSIVOS */}
                  <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
                    <div className="w-full sm:w-1/3">
                      <Label className="text-sm">Lucro Individual (%)</Label>
                      <Input className="mt-1" type="number" placeholder="Usar geral" value={item.porcentagem_lucro_item ?? ""} onChange={e => {const value = e.target.value === "" ? null : Number(e.target.value); handleItemChange(item.id, "porcentagem_lucro_item", value); }} />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const updated = quotation.itens_cotados.map(it => it.id === item.id ? { ...it, porcentagem_lucro_item: it.porcentagem_lucro_item === 0 ? null : 0 } : it );
                        setQuotation({ ...quotation, itens_cotados: updated });
                      }}
                      className={`w-full sm:w-1/3 h-10 px-3 text-sm font-medium rounded-md transition-colors gap-2 ${ item.porcentagem_lucro_item === 0 ? "bg-destructive hover:bg-destructive/90 text-white" : "border border-destructive/40 text-destructive hover:bg-destructive/10 bg-white" }`}
                    >
                      {item.porcentagem_lucro_item === 0 ? "Lucro zerado ativado" : "Zerar lucro"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = quotation.itens_cotados.map((it, i) => i === index ? { ...it, lucro_total: !it.lucro_total } : it );
                        setQuotation({ ...quotation, itens_cotados: updated });
                      }}
                      className={`w-full sm:w-1/3 h-10 px-3 text-sm font-medium rounded-md transition-colors gap-2 ${ item.lucro_total ? "bg-destructive hover:bg-destructive/90 text-white" : "border border-destructive/40 text-destructive hover:bg-destructive/10 bg-white" }`}
                    >
                      {item.lucro_total ? "Custo zerado ativado" : "Zerar custo"}
                    </button>
                  </div>
                  
                  {/* TABELA RESUMO DO ITEM RESPONSIVA */}
                  <div className="pt-4 border-t border-red-100 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 text-xs sm:text-sm">
                      <div><span className="text-muted-foreground block mb-1">Custo Total:</span><p className="font-semibold text-slate-700">R$ {item.custo_total_item.toFixed(2)}</p></div>
                      <div><span className="text-muted-foreground block mb-1">Rev. Unit. (R$):</span><p className="font-semibold text-slate-700">R$ {item.preco_venda_unitario.toFixed(2)}</p></div>
                      <div><span className="text-muted-foreground block mb-1">Lucro (R$):</span><p className="font-semibold text-green-600">R$ {item.lucro_item.toFixed(2)}</p></div>
                      <div><span className="text-muted-foreground block mb-1">Rev. Total (R$):</span><p className="font-semibold text-destructive">R$ {item.preco_venda_total_item.toFixed(2)}</p></div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addItem} className="w-full gap-2 border-dashed border-destructive/40 text-destructive hover:bg-destructive/5 h-12 mt-2"><PlusCircle className="h-5 w-5" /> Adicionar Item</Button>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardHeader className="bg-destructive/10 py-4"><CardTitle className="text-destructive text-lg sm:text-xl">Resumo Financeiro</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm sm:text-base pt-4 sm:pt-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2"><span className="text-muted-foreground">Custo Total dos Materiais:</span><span className="font-medium text-slate-700">R$ {custoTotal.toFixed(2)}</span></div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2"><span className="text-muted-foreground">Valor Total do Lucro:</span><span className="font-medium text-green-600">R$ {valorLucro.toFixed(2)}</span></div>
              <div className="flex justify-between items-center text-lg sm:text-xl font-bold text-destructive pt-2"><span>Preço Final de Venda:</span><span>R$ {precoFinalVenda.toFixed(2)}</span></div>
            </CardContent>
          </Card>

          {/* BOTÕES DE AÇÃO RESPONSIVOS: 100% de largura no celular */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button onClick={handleSaveAndGoBack} disabled={isLoading} className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 bg-transparent w-full sm:w-auto py-6 sm:py-2 text-base">
              <Save className="h-5 w-5 sm:h-4 sm:w-4"/>
              {isLoading ? "Salvando..." : (quotationToEdit ? "Salvar Alterações" : "Salvar Cotação")}
            </Button>
           <Button onClick={handleConvertToBudget} disabled={isLoading} className="gap-2 bg-destructive hover:bg-destructive/90 w-full sm:w-auto py-6 sm:py-2 text-base shadow-md"> 
              <FileText className="h-5 w-5 sm:h-4 sm:w-4"/> 
              {isLoading ? "Salvando..." : "Converter em Orçamento"} 
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}