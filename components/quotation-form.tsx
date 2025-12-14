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
  porcentagem_lucro_item?: number | null; // Novo campo opcional
  lucro_total?: boolean; // 👈 Indica se o item tem lucro direto de 100%
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
  id: Date.now() + index,
  porcentagem_lucro_item: item.porcentagem_lucro_item ?? null,
  lucro_total: item.lucro_total ?? false, // garante o campo
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

  // --- EFEITO PARA CÁLCULO EM TEMPO REAL ---
useEffect(() => {
const updatedItems = quotation.itens_cotados.map(item => {
  const custoTotalItem = item.custo_unitario * item.quantidade;

// Se "Zerar custo" estiver marcado
if (item.lucro_total) {
  // Mantém o preço de venda unitário já definido pelo usuário ou valor anterior
  const precoVendaUnitario = item.preco_venda_unitario > 0 ? item.preco_venda_unitario : item.custo_unitario || 0;
  const precoVendaTotalItem = precoVendaUnitario * item.quantidade;
  const lucroItem = precoVendaTotalItem; // tudo é lucro

  return {
    ...item,
    custo_total_item: 0, // custo zerado
    lucro_item: lucroItem,
    preco_venda_unitario: precoVendaUnitario,
    preco_venda_total_item: precoVendaTotalItem,
  };
}




  // Caso normal: aplica % individual ou geral
  const lucroUsado =
    item.porcentagem_lucro_item !== null && item.porcentagem_lucro_item !== undefined
      ? item.porcentagem_lucro_item
      : quotation.porcentagem_lucro;

  const precoVendaUnitario = item.custo_unitario * (1 + lucroUsado / 100);
  const precoVendaTotalItem = precoVendaUnitario * item.quantidade;
  const lucroItem = precoVendaTotalItem - custoTotalItem;

  return {
    ...item,
    custo_total_item: custoTotalItem,
    lucro_item: lucroItem,
    preco_venda_unitario: precoVendaUnitario,
    preco_venda_total_item: precoVendaTotalItem,
  };
});


  // Evita loop infinito
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
      itens_cotados: [ ...prev.itens_cotados, { id: Date.now(), descricao: "", fornecedor: "", quantidade: 1, custo_unitario: 0, porcentagem_lucro_item: null, lucro_total: false, custo_total_item: 0, lucro_item: 0, preco_venda_unitario: 0, preco_venda_total_item: 0 } ]
    }));
  };

  const removeItem = (id: number) => { setQuotation(prev => ({ ...prev, itens_cotados: prev.itens_cotados.filter(item => item.id !== id) })); };

const handleSave = async (): Promise<boolean> => { // Modificado para retornar um booleano de sucesso
    if (!quotation.nome_cotacao.trim()) { alert("Por favor, dê um nome para a cotação."); return false; }
    setIsLoading(true);
    
    const itemsToSave = quotation.itens_cotados.map(item => ({
      descricao: item.descricao,
      fornecedor: item.fornecedor,
      quantidade: item.quantidade,
      custo_unitario: item.custo_unitario,
      porcentagem_lucro_item: item.porcentagem_lucro_item,
      lucro_total: item.lucro_total,
      preco_venda_unitario: item.preco_venda_unitario, // ✅ incluído
    }));


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
    // ✅ Mostra aviso temporário (sem travar o fluxo)
    const successMsg = document.createElement("div");
    successMsg.textContent = quotationToEdit
      ? "Cotação atualizada com sucesso!"
      : "Cotação salva com sucesso!";
    successMsg.className =
      "fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50";
    document.body.appendChild(successMsg);

    // ⏳ Espera 2.5s e troca para tela de visualização
    setTimeout(() => {
      successMsg.remove();
      onViewQuotationList(); // muda de tela para o preview
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 2500);
  }
};

  // --- Função de conversão em budget ---
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
    <div className="min-h-screen bg-background">
      <PageHeader title={quotationToEdit ? "Editar Cotação" : "Sistema de Cotação - WARP Sistemas Inteligentes"} onBackToMenu={onBack} onLogout={onLogout} onViewList={onViewQuotationList} viewListText="Ver Cotações" />
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
              {quotation.itens_cotados.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-3 relative bg-slate-50">
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="absolute -top-2 -right-2 h-6 w-6 bg-destructive/20 text-destructive hover:bg-red-200"><Trash2 className="h-4 w-4" /></Button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2"><Label>Descrição do Item</Label><Input value={item.descricao} onChange={e => handleItemChange(item.id, "descricao", e.target.value)} /></div>
                    <div><Label>Fornecedor</Label><Input value={item.fornecedor} onChange={e => handleItemChange(item.id, "fornecedor", e.target.value)} /></div>
                    <div><Label>Quantidade</Label><Input type="number" value={item.quantidade} onChange={e => handleItemChange(item.id, "quantidade", e.target.value)} /></div>
                    <div><Label>Custo Unit. (R$)</Label><Input type="number" value={item.custo_unitario} onChange={e => handleItemChange(item.id, "custo_unitario", e.target.value)}/></div>
                    <div><Label>Lucro Individual (%)</Label><Input type="number" placeholder="Usar geral" value={item.porcentagem_lucro_item ?? ""} onChange={e => {const value = e.target.value === "" ? null : Number(e.target.value); handleItemChange(item.id, "porcentagem_lucro_item", value); }} /></div>
<button
  type="button"
  onClick={() => {
    const updated = quotation.itens_cotados.map(it =>
      it.id === item.id
        ? {
            ...it,
            porcentagem_lucro_item:
              it.porcentagem_lucro_item === 0 ? null : 0, // alterna entre 0 e null
          }
        : it
    );
    setQuotation({ ...quotation, itens_cotados: updated });
  }}
  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors gap-2
    ${
      item.porcentagem_lucro_item === 0
        ? "bg-destructive hover:bg-destructive/90 text-white"
        : "border border-destructive/40 text-destructive hover:bg-destructive/10 bg-transparent"
    }`}
>
  {item.porcentagem_lucro_item === 0 ? "Lucro zerado ativado" : "Zerar lucro"}
</button>


                    <button
  type="button"
  onClick={() => {
    const updated = quotation.itens_cotados.map((it, i) =>
      i === index ? { ...it, lucro_total: !it.lucro_total } : it
    );
    setQuotation({ ...quotation, itens_cotados: updated });
  }}
  className={`gap-2 rounded-md transition-colors ${
    item.lucro_total
      ? "bg-destructive hover:bg-destructive/90 text-white"
      : "border border-destructive/40 text-destructive hover:bg-destructive/10 bg-transparent"
  }`}
>
  {item.lucro_total ? "Custo zerado ativado" : "Zerar custo"}
</button>

                    
                    </div>
                  
                  <div className="pt-3 border-t grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-xs">
                      <div><span className="text-muted-foreground">Custo Total:</span><p className="font-semibold text-slate-700">R$ {item.custo_total_item.toFixed(2)}</p></div>
                      <div><span className="text-muted-foreground">Rev. Unit. (R$):</span><p className="font-semibold text-slate-700">R$ {item.preco_venda_unitario.toFixed(2)}</p></div>
                      <div><span className="text-muted-foreground">Lucro (R$):</span><p className="font-semibold text-green-600">R$ {item.lucro_item.toFixed(2)}</p></div>
                      <div><span className="text-muted-foreground">Rev. Total (R$):</span><p className="font-semibold text-destructive">R$ {item.preco_venda_total_item.toFixed(2)}</p></div>
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
              <div className="flex justify-between text-base font-bold text-destructive"><span>Preço Final de Venda (Total):</span><span>R$ {precoFinalVenda.toFixed(2)}</span></div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            {/* <Button variant="outline" onClick={() => window.print()} className="gap-2"><Printer className="h-4 w-4"/>Imprimir / Salvar PDF</Button> */}
            <Button onClick={handleSaveAndGoBack} disabled={isLoading} className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 bg-transparent"><Save className="h-4 w-4"/>{isLoading ? "Salvando..." : (quotationToEdit ? "Salvar Alterações" : "Salvar Cotação")}</Button>
           <Button onClick={handleConvertToBudget} disabled={isLoading} className="gap-2 bg-destructive hover:bg-destructive/90"> <FileText className="h-4 w-4"/> {isLoading ? "Salvando..." : "Converter em Orçamento"} </Button>
          </div>
        </div>
      </div>
    </div>
  )
}