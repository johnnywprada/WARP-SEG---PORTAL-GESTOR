"use client"

import { supabase } from '@/lib/supabase/client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, FileText, ChevronsUpDown, Check, UserPlus, Eye, Save } from "lucide-react";
import { BudgetPreview } from "./budget-preview";
import { PageHeader } from "./PageHeader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// --- INTERFACES ---
interface Product { id: string; description: string; quantity: number; unit: string; unitPrice: number; total: number; }
interface ClientData { name: string; address: string; phone: string; email: string; }
interface BudgetData { client: ClientData; products: Product[]; paymentMethod: string; observations: string; validUntil: string; budgetNumber: string; }
interface Client { id: string; nome: string; endereco: string | null; telefone: string | null; email: string | null; }

interface QuotationItemForConversion { descricao: string; quantidade: number; custo_unitario: number; preco_venda_unitario?: number; }
interface QuotationDataForConversion { porcentagem_lucro: number; itens_cotados: QuotationItemForConversion[]; }

interface BudgetGeneratorProps { onBackToMenu: () => void; onViewBudgetList: () => void; onLogout: () => void; dataFromQuotation?: QuotationDataForConversion | null; }

export function BudgetGenerator({ onBackToMenu, onViewBudgetList, onLogout, dataFromQuotation }: BudgetGeneratorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [budgetData, setBudgetData] = useState<BudgetData>({ client: { name: "", address: "", phone: "", email: "" }, products: [{ id: "1", description: "", quantity: 1, unit: "UN", unitPrice: 0, total: 0 }], paymentMethod: "", observations: "", validUntil: "", budgetNumber: `WARP-${Date.now().toString().slice(-6)}` });
  const [clients, setClients] = useState<Client[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ nome: "", telefone: "", email: "", endereco: "" });
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // Agora usado para o loading do "Salvar" no preview

  const fetchClients = async () => { const { data, error } = await supabase.from('clientes').select('id, nome, endereco, telefone, email').order('nome', { ascending: true }); if (error) { console.error("Erro ao buscar clientes:", error); } else { setClients(data as Client[]); } };
  
  useEffect(() => {
    fetchClients(); 
    if (dataFromQuotation && dataFromQuotation.itens_cotados) {
      const newProducts = dataFromQuotation.itens_cotados.map(item => {
        const unitPrice = (item as any).preco_venda_unitario ?? item.custo_unitario * (1 + dataFromQuotation.porcentagem_lucro / 100);
        return { id: Date.now().toString() + item.descricao, description: item.descricao, quantity: item.quantidade, unit: "UN", unitPrice, total: unitPrice * item.quantidade };
      });
      setBudgetData(prev => ({ ...prev, products: newProducts }));
    }
  }, [dataFromQuotation]);

  const handleClientSelect = (clientId: string) => { const selected = clients.find(c => c.id === clientId); if (selected) { setBudgetData(prev => ({ ...prev, client: { name: selected.nome, address: selected.endereco || "", phone: selected.telefone || "", email: selected.email || "" } })); } };
  const handleSaveNewClient = async () => { if (!newClient.nome.trim()) { alert("O nome do novo cliente é obrigatório."); return; } setIsSavingClient(true); const { data: { user } } = await supabase.auth.getUser(); if (!user) { alert("Erro de autenticação."); return; } const { data: insertedClient, error } = await supabase.from('clientes').insert([{ ...newClient, user_id: user.id }]).select().single(); if (error) { alert("Falha ao cadastrar novo cliente."); console.error(error); } else { alert("Cliente cadastrado com sucesso!"); await fetchClients(); handleClientSelect(insertedClient.id); setIsClientModalOpen(false); setNewClient({ nome: "", telefone: "", email: "", endereco: "" }); } setIsSavingClient(false); };
  
  // NOVO: Apenas mostra o rascunho. Não salva mais no banco aqui!
  const handlePreviewBudget = () => {
    if (!budgetData.client.name.trim()) { alert("Por favor, selecione ou cadastre um cliente."); return; }
    setShowPreview(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  // NOVO: Função enviada para a tela de Preview para fazer o salvamento real
  const handleSaveDefinitiveBudget = async () => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Erro de autenticação. Faça login novamente.");

      const budgetToInsert = {
        budgetNumber: budgetData.budgetNumber,
        client: budgetData.client,
        products: budgetData.products,
        paymentMethod: budgetData.paymentMethod,
        observations: budgetData.observations,
        validUntil: budgetData.validUntil || null,
        totalValue: getTotalBudget(),
        status: "em-aberto",
        user_id: user.id,
      };

      const { error } = await supabase.from("orcamentos").insert([budgetToInsert]);
      if (error) throw error;

      alert(`Orçamento ${budgetData.budgetNumber} salvo com sucesso!`);
      // Ao salvar com sucesso, leva o usuário direto para a lista de orçamentos para ele poder "Ver" ou "Enviar"
      onViewBudgetList(); 
    } catch (error: any) {
      console.error("Erro ao gerar orçamento:", error);
      alert(`Falha ao salvar o orçamento: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const addProduct = () => { const newProduct: Product = { id: Date.now().toString(), description: "", quantity: 1, unit: "UN", unitPrice: 0, total: 0 }; setBudgetData((prev) => ({ ...prev, products: [...prev.products, newProduct] })); };
  const removeProduct = (id: string) => { setBudgetData((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) })); };
  const updateProduct = (id: string, field: keyof Product, value: any) => { setBudgetData((prev) => ({ ...prev, products: prev.products.map((p) => { if (p.id === id) { const updated = { ...p, [field]: value }; if (field === "quantity" || field === "unitPrice") { updated.total = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0); } return updated; } return p; }), })); };
  const getTotalBudget = () => { return budgetData.products.reduce((sum, product) => sum + product.total, 0); }; 
  
  if (showPreview) { 
    return (
      <BudgetPreview 
        budgetData={budgetData} 
        onBack={() => setShowPreview(false)} 
        onSave={handleSaveDefinitiveBudget} // Passa a função de salvar para o preview
        isSaving={isGenerating} // Passa o estado de loading
      />
    ); 
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <PageHeader title="Sistema de Orçamentos - WARP Sistemas Inteligentes" onBackToMenu={onBackToMenu} onLogout={onLogout} onViewList={onViewBudgetList} viewListText="Ver Orçamentos" />
      
      <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-destructive mb-2">Gerar Novo Orçamento</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Preencha os dados abaixo</p>
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          <Card className="border-red-100">
            <CardHeader className="bg-destructive/10 py-4"><CardTitle className="flex items-center gap-2 text-destructive text-lg sm:text-xl"><FileText className="h-5 w-5" />Dados do Cliente</CardTitle></CardHeader>
            <CardContent className="pt-4 sm:pt-6 space-y-4">
              <div>
                <Label className="text-sm">Selecionar Cliente Cadastrado</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild><Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between font-normal"><span className="truncate">{budgetData.client.name ? clients.find((c) => c.nome === budgetData.client.name)?.nome : "Buscar e selecionar cliente..."}</span><ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
                    <PopoverContent className="w-[90vw] sm:w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Pesquisar cliente..." /><CommandEmpty>Nenhum cliente encontrado.</CommandEmpty><CommandGroup className="max-h-[200px] overflow-y-auto">{clients.map((client) => (<CommandItem key={client.id} value={client.nome} onSelect={() => { handleClientSelect(client.id); setOpenCombobox(false); }}><Check className={cn("mr-2 h-4 w-4", budgetData.client.name === client.nome ? "opacity-100" : "opacity-0")} /><span className="truncate">{client.nome}</span></CommandItem>))}</CommandGroup></Command></PopoverContent>
                  </Popover>
                  <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
                    <DialogTrigger asChild><Button variant="outline" className="w-full sm:w-auto gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"><UserPlus className="h-4 w-4" /> Cadastrar Novo</Button></DialogTrigger>
                    <DialogContent className="w-[95vw] sm:max-w-md rounded-lg p-4 sm:p-6"><DialogHeader><DialogTitle>Cadastrar Novo Cliente</DialogTitle><DialogDescription>Preencha os dados básicos do novo cliente.</DialogDescription></DialogHeader><div className="space-y-4 py-2"><div><Label>Nome / Razão Social *</Label><Input value={newClient.nome} onChange={(e) => setNewClient({...newClient, nome: e.target.value})} /></div><div><Label>Telefone</Label><Input value={newClient.telefone} onChange={(e) => setNewClient({...newClient, telefone: e.target.value})} /></div><div><Label>E-mail</Label><Input type="email" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} /></div><div><Label>Endereço</Label><Textarea value={newClient.endereco} onChange={(e) => setNewClient({...newClient, endereco: e.target.value})} /></div></div><DialogFooter className="flex-col sm:flex-row gap-2"><DialogClose asChild><Button variant="ghost" className="w-full sm:w-auto">Cancelar</Button></DialogClose><Button onClick={handleSaveNewClient} disabled={isSavingClient} className="w-full sm:w-auto">{isSavingClient ? "Salvando..." : "Salvar Cliente"}</Button></DialogFooter></DialogContent>
                  </Dialog>
                </div>
              </div>
              {budgetData.client.name && (<div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs sm:text-sm text-slate-700 space-y-1 break-words"><p><strong>Endereço:</strong> {budgetData.client.address || "Não informado"}</p><p><strong>Contato:</strong> {budgetData.client.phone || "Não informado"} | <strong>Email:</strong> {budgetData.client.email || "Não informado"}</p></div>)}
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardHeader className="bg-destructive/10 py-4"><CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-destructive gap-3"><span className="text-lg sm:text-xl">Produtos/Serviços</span><Button onClick={addProduct} size="sm" className="gap-2 bg-destructive hover:bg-destructive/90 w-full sm:w-auto"><Plus className="h-4 w-4" />Adicionar Item</Button></CardTitle></CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-4">
                {budgetData.products.map((product, index) => (
                  <div key={product.id} className="border border-red-100 rounded-lg p-3 sm:p-4 space-y-4 bg-slate-50/50">
                    <div className="flex items-center justify-between"><span className="font-medium text-destructive text-sm sm:text-base">Item {index + 1}</span>{budgetData.products.length > 1 && (<Button variant="outline" size="sm" onClick={() => removeProduct(product.id)} className="text-destructive hover:text-destructive border-destructive/40 h-8"><Trash2 className="h-4 w-4" /></Button>)}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4"><div className="lg:col-span-2"><Label className="text-sm">Descrição do Produto/Serviço *</Label><Input className="mt-1" value={product.description} onChange={(e) => updateProduct(product.id, "description", e.target.value)} placeholder="Ex: Câmera de segurança IP..." /></div><div><Label className="text-sm">Quantidade *</Label><Input className="mt-1" type="number" min="1" value={product.quantity} onChange={(e) => updateProduct(product.id, "quantity", Number.parseInt(e.target.value) || 1)} /></div><div><Label className="text-sm">Unidade</Label><Select value={product.unit} onValueChange={(value) => updateProduct(product.id, "unit", value)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="UN">Unidade</SelectItem><SelectItem value="M">Metro</SelectItem><SelectItem value="M²">Metro²</SelectItem><SelectItem value="KG">Quilograma</SelectItem><SelectItem value="H">Hora</SelectItem><SelectItem value="SRV">Serviço</SelectItem></SelectContent></Select></div><div><Label className="text-sm">Valor Unitário (R$) *</Label><Input className="mt-1" type="number" min="0" step="0.01" value={product.unitPrice} onChange={(e) => updateProduct(product.id, "unitPrice", Number.parseFloat(e.target.value) || 0)} placeholder="0,00" /></div></div>
                    <div className="text-right pt-2 border-t border-red-100/50"><span className="text-base sm:text-lg font-semibold text-destructive">Total: R$ {product.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="text-right"><div className="text-xl sm:text-3xl font-bold text-destructive">Total Geral: R$ {getTotalBudget().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div></div>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardHeader className="bg-destructive/10 py-4"><CardTitle className="text-destructive text-lg sm:text-xl">Condições Comerciais</CardTitle></CardHeader>
            <CardContent className="pt-4 sm:pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label htmlFor="paymentMethod" className="text-sm">Forma de Pagamento</Label><Select value={budgetData.paymentMethod} onValueChange={(value) => setBudgetData((prev) => ({ ...prev, paymentMethod: value }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione a forma de pagamento" /></SelectTrigger><SelectContent><SelectItem value="vista">À Vista</SelectItem><SelectItem value="30dias">30 dias</SelectItem><SelectItem value="2x">2x sem juros</SelectItem><SelectItem value="3x">3x sem juros</SelectItem><SelectItem value="cartao">Cartão de Crédito</SelectItem><SelectItem value="pix">PIX</SelectItem><SelectItem value="boleto">Boleto Bancário</SelectItem></SelectContent></Select></div><div><Label htmlFor="validUntil" className="text-sm">Válido até</Label><Input className="mt-1" id="validUntil" type="date" value={budgetData.validUntil} onChange={(e) => setBudgetData((prev) => ({ ...prev, validUntil: e.target.value }))} /></div></div>
              <div><Label htmlFor="observations" className="text-sm">Observações</Label><Textarea className="mt-1" id="observations" value={budgetData.observations} onChange={(e) => setBudgetData((prev) => ({ ...prev, observations: e.target.value }))} placeholder="Informações adicionais, condições especiais, prazo de entrega, etc." rows={3} /></div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end pt-2">
            <Button onClick={handlePreviewBudget} className="gap-2 bg-slate-800 hover:bg-slate-700 w-full sm:w-auto py-6 sm:py-2 text-base text-white shadow-md">
              <Eye className="h-5 w-5 sm:h-4 sm:w-4" />
              Pré-visualizar Orçamento
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}