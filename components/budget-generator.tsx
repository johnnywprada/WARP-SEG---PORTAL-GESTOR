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
import { Plus, Trash2, FileText, Printer, Save, ChevronsUpDown, Check, UserPlus } from "lucide-react";
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

// --- NOVAS INTERFACES PARA A CONVERSÃO ---
interface QuotationItemForConversion {
  descricao: string;
  quantidade: number;
  custo_unitario: number;
  preco_venda_unitario?: number; // ← Adicionado
}
interface QuotationDataForConversion {
  porcentagem_lucro: number;
  itens_cotados: QuotationItemForConversion[];
}

interface BudgetGeneratorProps {
  onBackToMenu: () => void;
  onViewBudgetList: () => void;
  onLogout: () => void;
  dataFromQuotation?: QuotationDataForConversion | null;
}

export function BudgetGenerator({ onBackToMenu, onViewBudgetList, onLogout, dataFromQuotation }: BudgetGeneratorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [budgetData, setBudgetData] = useState<BudgetData>({ client: { name: "", address: "", phone: "", email: "" }, products: [{ id: "1", description: "", quantity: 1, unit: "UN", unitPrice: 0, total: 0 }], paymentMethod: "", observations: "", validUntil: "", budgetNumber: `WARP-${Date.now().toString().slice(-6)}` });
  const [clients, setClients] = useState<Client[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ nome: "", telefone: "", email: "", endereco: "" });
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchClients = async () => { const { data, error } = await supabase.from('clientes').select('id, nome, endereco, telefone, email').order('nome', { ascending: true }); if (error) { console.error("Erro ao buscar clientes:", error); } else { setClients(data as Client[]); } };
useEffect(() => {
  fetchClients(); // busca clientes sempre que o componente carrega

  if (dataFromQuotation && dataFromQuotation.itens_cotados) {
    const newProducts = dataFromQuotation.itens_cotados.map(item => {
      // Se preco_venda_unitario existir (cotação), usa direto, senão calcula com o lucro da cotação
      const unitPrice = (item as any).preco_venda_unitario ?? item.custo_unitario * (1 + dataFromQuotation.porcentagem_lucro / 100);

      return {
        id: Date.now().toString() + item.descricao,
        description: item.descricao,
        quantity: item.quantidade,
        unit: "UN",
        unitPrice,
        total: unitPrice * item.quantidade,
      };
    });

    setBudgetData(prev => ({
      ...prev,
      products: newProducts,
    }));
  }
}, [dataFromQuotation]);


  const handleClientSelect = (clientId: string) => { const selected = clients.find(c => c.id === clientId); if (selected) { setBudgetData(prev => ({ ...prev, client: { name: selected.nome, address: selected.endereco || "", phone: selected.telefone || "", email: selected.email || "" } })); } };
  const handleSaveNewClient = async () => { if (!newClient.nome.trim()) { alert("O nome do novo cliente é obrigatório."); return; } setIsSavingClient(true); const { data: { user } } = await supabase.auth.getUser(); if (!user) { alert("Erro de autenticação."); return; } const { data: insertedClient, error } = await supabase.from('clientes').insert([{ ...newClient, user_id: user.id }]).select().single(); if (error) { alert("Falha ao cadastrar novo cliente."); console.error(error); } else { alert("Cliente cadastrado com sucesso!"); await fetchClients(); handleClientSelect(insertedClient.id); setIsClientModalOpen(false); setNewClient({ nome: "", telefone: "", email: "", endereco: "" }); } setIsSavingClient(false); };
const handleGenerateBudget = async () => {
  if (!budgetData.client.name.trim()) {
    alert("Por favor, selecione ou cadastre um cliente.");
    return;
  }

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

    // ✅ Mostra mensagem temporária de sucesso
    const successMsg = document.createElement("div");
    successMsg.textContent = `Orçamento ${budgetData.budgetNumber} salvo com sucesso!`;
    successMsg.className =
      "fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50";
    document.body.appendChild(successMsg);

    // ⏳ Espera 2.5s e troca automaticamente de tela
    setTimeout(() => {
      successMsg.remove();
      setShowPreview(true);
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 2500);
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
  const getTotalBudget = () => { return budgetData.products.reduce((sum, product) => sum + product.total, 0); }; if (showPreview) { return <BudgetPreview budgetData={budgetData} onBack={() => setShowPreview(false)} />; }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Sistema de Orçamentos - WARP" onBackToMenu={onBackToMenu} onLogout={onLogout} onViewList={onViewBudgetList} viewListText="Ver Orçamentos" />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-destructive mb-2">Gerar Novo Orçamento</h1>
          <p className="text-muted-foreground">Preencha os dados abaixo</p>
        </div>
        <div className="space-y-6">
          <Card className="border-red-100">
            <CardHeader className="bg-destructive/10"><CardTitle className="flex items-center gap-2 text-destructive"><FileText className="h-5 w-5" />Dados do Cliente</CardTitle></CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Selecionar Cliente Cadastrado</Label>
                <div className="flex gap-2">
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}><PopoverTrigger asChild><Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between font-normal">{budgetData.client.name ? clients.find((c) => c.nome === budgetData.client.name)?.nome : "Buscar e selecionar cliente..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Pesquisar cliente..." /><CommandEmpty>Nenhum cliente encontrado.</CommandEmpty><CommandGroup>{clients.map((client) => (<CommandItem key={client.id} value={client.nome} onSelect={() => { handleClientSelect(client.id); setOpenCombobox(false); }}><Check className={cn("mr-2 h-4 w-4", budgetData.client.name === client.nome ? "opacity-100" : "opacity-0")} />{client.nome}</CommandItem>))}</CommandGroup></Command></PopoverContent></Popover>
                  <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}><DialogTrigger asChild><Button variant="outline" className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"><UserPlus className="h-4 w-4" /> Cadastrar Novo</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Cadastrar Novo Cliente</DialogTitle><DialogDescription>Preencha os dados básicos do novo cliente.</DialogDescription></DialogHeader><div className="space-y-4 py-4"><div><Label>Nome / Razão Social *</Label><Input value={newClient.nome} onChange={(e) => setNewClient({...newClient, nome: e.target.value})} /></div><div><Label>Telefone</Label><Input value={newClient.telefone} onChange={(e) => setNewClient({...newClient, telefone: e.target.value})} /></div><div><Label>E-mail</Label><Input type="email" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} /></div><div><Label>Endereço</Label><Textarea value={newClient.endereco} onChange={(e) => setNewClient({...newClient, endereco: e.target.value})} /></div></div><DialogFooter><DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose><Button onClick={handleSaveNewClient} disabled={isSavingClient}>{isSavingClient ? "Salvando..." : "Salvar Cliente"}</Button></DialogFooter></DialogContent></Dialog>
                </div>
              </div>
              {budgetData.client.name && (<div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm text-slate-700 space-y-1"><p><strong>Endereço:</strong> {budgetData.client.address || "Não informado"}</p><p><strong>Contato:</strong> {budgetData.client.phone || "Não informado"} | <strong>Email:</strong> {budgetData.client.email || "Não informado"}</p></div>)}
            </CardContent>
          </Card>
          <Card className="border-red-100">
            <CardHeader className="bg-destructive/10"><CardTitle className="flex items-center justify-between text-destructive"><span>Produtos/Serviços</span><Button onClick={addProduct} size="sm" className="gap-2 bg-destructive hover:bg-destructive/90"><Plus className="h-4 w-4" />Adicionar Item</Button></CardTitle></CardHeader>
            <CardContent className="pt-6"><div className="space-y-4">{budgetData.products.map((product, index) => (<div key={product.id} className="border border-red-100 rounded-lg p-4 space-y-4"><div className="flex items-center justify-between"><span className="font-medium text-destructive">Item {index + 1}</span>{budgetData.products.length > 1 && (<Button variant="outline" size="sm" onClick={() => removeProduct(product.id)} className="text-destructive hover:text-destructive border-destructive/40"><Trash2 className="h-4 w-4" /></Button>)}</div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"><div className="lg:col-span-2"><Label>Descrição do Produto/Serviço *</Label><Input value={product.description} onChange={(e) => updateProduct(product.id, "description", e.target.value)} placeholder="Ex: Câmera de segurança IP..." /></div><div><Label>Quantidade *</Label><Input type="number" min="1" value={product.quantity} onChange={(e) => updateProduct(product.id, "quantity", Number.parseInt(e.target.value) || 1)} /></div><div><Label>Unidade</Label><Select value={product.unit} onValueChange={(value) => updateProduct(product.id, "unit", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="UN">Unidade</SelectItem><SelectItem value="M">Metro</SelectItem><SelectItem value="M²">Metro²</SelectItem><SelectItem value="KG">Quilograma</SelectItem><SelectItem value="H">Hora</SelectItem><SelectItem value="SRV">Serviço</SelectItem></SelectContent></Select></div><div><Label>Valor Unitário (R$) *</Label><Input type="number" min="0" step="0.01" value={product.unitPrice} onChange={(e) => updateProduct(product.id, "unitPrice", Number.parseFloat(e.target.value) || 0)} placeholder="0,00" /></div></div><div className="text-right"><span className="text-lg font-semibold text-destructive">Total: R$ {product.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div></div>))}</div><Separator className="my-6" /><div className="text-right"><div className="text-3xl font-bold text-destructive">Total Geral: R$ {getTotalBudget().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div></div></CardContent>
          </Card>
          <Card className="border-red-100">
            <CardHeader className="bg-destructive/10"><CardTitle className="text-destructive">Condições Comerciais</CardTitle></CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="paymentMethod">Forma de Pagamento</Label><Select value={budgetData.paymentMethod} onValueChange={(value) => setBudgetData((prev) => ({ ...prev, paymentMethod: value }))}><SelectTrigger><SelectValue placeholder="Selecione a forma de pagamento" /></SelectTrigger><SelectContent><SelectItem value="vista">À Vista</SelectItem><SelectItem value="30dias">30 dias</SelectItem><SelectItem value="2x">2x sem juros</SelectItem><SelectItem value="3x">3x sem juros</SelectItem><SelectItem value="cartao">Cartão de Crédito</SelectItem><SelectItem value="pix">PIX</SelectItem><SelectItem value="boleto">Boleto Bancário</SelectItem></SelectContent></Select></div>
                <div><Label htmlFor="validUntil">Válido até</Label><Input id="validUntil" type="date" value={budgetData.validUntil} onChange={(e) => setBudgetData((prev) => ({ ...prev, validUntil: e.target.value }))} /></div>
              </div>
              <div><Label htmlFor="observations">Observações</Label><Textarea id="observations" value={budgetData.observations} onChange={(e) => setBudgetData((prev) => ({ ...prev, observations: e.target.value }))} placeholder="Informações adicionais, condições especiais, prazo de entrega, etc." rows={3} /></div>
            </CardContent>
          </Card>
          <div className="flex gap-4 justify-end">
            <Button onClick={handleGenerateBudget} disabled={isGenerating} className="gap-2 bg-destructive hover:bg-destructive/90">
              <Printer className="h-4 w-4" />
              {isGenerating ? "Salvando e Gerando..." : "Gerar Orçamento"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}